package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.repository.UserRepository;
import com.fixkh.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
public class MfaService {
    private final UserRepository users;
    private final CurrentUser current;
    private final PasswordEncoder passwords;
    private final String encryptionKey;
    private final SecureRandom random = new SecureRandom();

    public MfaService(UserRepository users, CurrentUser current, PasswordEncoder passwords,
            @Value("${fixkh.two-factor-encryption-key:}") String encryptionKey) {
        this.users = users;
        this.current = current;
        this.passwords = passwords;
        this.encryptionKey = encryptionKey;
    }

    public MfaStatusResponse status() {
        return new MfaStatusResponse(current.user().isMfaEnabled());
    }

    @Transactional
    public MfaSetupResponse beginSetup(MfaSetupRequest request) {
        User user = lockedCurrent();
        if (user.isMfaEnabled()) throw new ApiException(HttpStatus.CONFLICT, "Authenticator is already enabled");
        if (!passwords.matches(request.password(), user.getPasswordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid password");
        key();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        String secret = AuthenticatorCodes.encodeSecret(bytes);
        Instant expiresAt = Instant.now().plusSeconds(600);
        user.setMfaPendingCiphertext(encrypt(secret));
        user.setMfaPendingExpiresAt(expiresAt);
        user.setMfaPendingAttempts(0);
        return new MfaSetupResponse(secret, AuthenticatorCodes.uri(user.getEmail(), secret), expiresAt);
    }

    public record Confirmation(User user, List<String> recoveryCodes) {}

    @Transactional(noRollbackFor = ApiException.class)
    public Confirmation confirm(MfaCodeRequest request) {
        User user = lockedCurrent();
        Instant now = Instant.now();
        if (user.isMfaEnabled()) throw new ApiException(HttpStatus.CONFLICT, "Authenticator is already enabled");
        if (user.getMfaPendingCiphertext() == null || user.getMfaPendingExpiresAt() == null
                || !now.isBefore(user.getMfaPendingExpiresAt()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Authenticator setup expired. Start again");
        if (user.getMfaPendingAttempts() >= 5)
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many incorrect codes. Start setup again");
        String secret = decrypt(user.getMfaPendingCiphertext());
        long step = AuthenticatorCodes.matchingStep(secret, request.code(), now.getEpochSecond() / 30, null);
        if (step < 0) {
            user.setMfaPendingAttempts(user.getMfaPendingAttempts() + 1);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid authenticator code");
        }
        user.setMfaSecretCiphertext(user.getMfaPendingCiphertext());
        user.setMfaPendingCiphertext(null);
        user.setMfaPendingExpiresAt(null);
        user.setMfaPendingAttempts(0);
        user.setMfaLastStep(step);
        user.setMfaEnabled(true);
        user.setAuthVersion(user.getAuthVersion() + 1);
        List<String> codes = new ArrayList<>();
        List<String> hashes = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            byte[] bytes = new byte[8];
            random.nextBytes(bytes);
            String code = HexFormat.of().withUpperCase().formatHex(bytes);
            codes.add(code);
            hashes.add(passwords.encode(code));
        }
        user.setMfaRecoveryHashes(String.join(",", hashes));
        return new Confirmation(user, codes);
    }

    @Transactional
    public MfaChallengeResponse startChallenge(User user) {
        key();
        Instant now = Instant.now();
        ensureNotLocked(user, now);
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        user.setMfaChallengeHash(sha256(challenge));
        user.setMfaChallengeExpiresAt(now.plusSeconds(300));
        return new MfaChallengeResponse(true, challenge);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public User verifyLogin(MfaVerifyRequest request) {
        User user = users.findLockedByMfaChallengeHash(sha256(request.challengeToken()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired MFA challenge"));
        Instant now = Instant.now();
        if (!user.isMfaEnabled() || user.getMfaChallengeExpiresAt() == null
                || !now.isBefore(user.getMfaChallengeExpiresAt())) {
            clearChallenge(user);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired MFA challenge");
        }
        ensureNotLocked(user, now);
        if (!verifyCode(user, request.code(), now)) {
            recordFailure(user, now);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid authenticator or recovery code");
        }
        clearChallenge(user);
        user.setMfaFailures(0);
        user.setMfaLockedUntil(null);
        return user;
    }

    @Transactional(noRollbackFor = ApiException.class)
    public User disable(MfaDisableRequest request) {
        User user = lockedCurrent();
        if (!user.isMfaEnabled()) throw new ApiException(HttpStatus.CONFLICT, "Authenticator is not enabled");
        if (!passwords.matches(request.password(), user.getPasswordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid password");
        Instant now = Instant.now();
        ensureNotLocked(user, now);
        if (!verifyCode(user, request.code(), now)) {
            recordFailure(user, now);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid authenticator or recovery code");
        }
        user.setMfaEnabled(false);
        user.setMfaSecretCiphertext(null);
        user.setMfaLastStep(null);
        user.setMfaRecoveryHashes(null);
        user.setMfaFailures(0);
        user.setMfaLockedUntil(null);
        clearChallenge(user);
        user.setAuthVersion(user.getAuthVersion() + 1);
        return user;
    }

    private boolean verifyCode(User user, String code, Instant now) {
        key();
        if (code.matches("[0-9]{6}")) {
            long step = AuthenticatorCodes.matchingStep(decrypt(user.getMfaSecretCiphertext()),
                    code, now.getEpochSecond() / 30, user.getMfaLastStep());
            if (step < 0) return false;
            user.setMfaLastStep(step);
            return true;
        }
        String normalized = code.replace("-", "").trim().toUpperCase(java.util.Locale.ROOT);
        if (!normalized.matches("[0-9A-F]{16}") || user.getMfaRecoveryHashes() == null) return false;
        List<String> hashes = new ArrayList<>(List.of(user.getMfaRecoveryHashes().split(",")));
        for (int i = 0; i < hashes.size(); i++) {
            if (passwords.matches(normalized, hashes.get(i))) {
                hashes.remove(i);
                user.setMfaRecoveryHashes(String.join(",", hashes));
                return true;
            }
        }
        return false;
    }

    private void recordFailure(User user, Instant now) {
        int failures = user.getMfaFailures() + 1;
        user.setMfaFailures(failures);
        if (failures >= 5) {
            user.setMfaLockedUntil(now.plusSeconds(900));
            clearChallenge(user);
        }
    }

    private void ensureNotLocked(User user, Instant now) {
        if (user.getMfaLockedUntil() != null && now.isBefore(user.getMfaLockedUntil()))
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many MFA attempts. Try again in 15 minutes");
        if (user.getMfaLockedUntil() != null) {
            user.setMfaLockedUntil(null);
            user.setMfaFailures(0);
        }
    }

    private void clearChallenge(User user) {
        user.setMfaChallengeHash(null);
        user.setMfaChallengeExpiresAt(null);
    }

    private User lockedCurrent() {
        return users.findLockedById(current.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
    }

    private SecretKeySpec key() {
        try {
            byte[] bytes = Base64.getDecoder().decode(encryptionKey);
            if (bytes.length == 32) return new SecretKeySpec(bytes, "AES");
        } catch (IllegalArgumentException ignored) {
            // Invalid or missing configuration is reported without revealing the value.
        }
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Authenticator MFA is not configured");
    }

    private String encrypt(String plain) {
        try {
            byte[] nonce = new byte[12];
            random.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, nonce));
            byte[] payload = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] joined = new byte[nonce.length + payload.length];
            System.arraycopy(nonce, 0, joined, 0, nonce.length);
            System.arraycopy(payload, 0, joined, nonce.length, payload.length);
            return Base64.getEncoder().encodeToString(joined);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Could not protect authenticator secret", e);
        }
    }

    private String decrypt(String encoded) {
        try {
            byte[] joined = Base64.getDecoder().decode(encoded);
            byte[] nonce = java.util.Arrays.copyOfRange(joined, 0, 12);
            byte[] payload = java.util.Arrays.copyOfRange(joined, 12, joined.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, nonce));
            return new String(cipher.doFinal(payload), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Could not read authenticator secret", e);
        }
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
