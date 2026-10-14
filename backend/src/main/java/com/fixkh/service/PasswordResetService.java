package com.fixkh.service;

import com.fixkh.dto.ApiDtos.ForgotPasswordRequest;
import com.fixkh.dto.ApiDtos.ResetPasswordRequest;
import com.fixkh.entity.PasswordResetCode;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.repository.PasswordResetCodeRepository;
import com.fixkh.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
public class PasswordResetService {
    public record ResetCodeEmail(String recipient, String code) {}
    public record PasswordChangedEmail(String recipient) {}

    private final UserRepository users;
    private final PasswordResetCodeRepository resets;
    private final PasswordEncoder passwords;
    private final ApplicationEventPublisher events;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(UserRepository users, PasswordResetCodeRepository resets,
            PasswordEncoder passwords, ApplicationEventPublisher events) {
        this.users = users;
        this.resets = resets;
        this.passwords = passwords;
        this.events = events;
    }

    @Transactional
    public void request(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Instant now = Instant.now();
        // Give every address the same response, including addresses without an account.
        if (!users.existsByEmailIgnoreCase(email)) {
            passwords.encode(String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000)));
            return;
        }
        PasswordResetCode reset = resets.findLockedByEmail(email).orElseGet(PasswordResetCode::new);
        if (reset.getSentAt() != null && now.isBefore(reset.getSentAt().plusSeconds(60))) return;
        if (reset.getWindowStartedAt() == null || !now.isBefore(reset.getWindowStartedAt().plus(1, ChronoUnit.HOURS))) {
            reset.setWindowStartedAt(now);
            reset.setSendsInWindow(0);
        }
        if (reset.getSendsInWindow() >= 3) return;

        String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        reset.setEmail(email);
        reset.setCodeHash(passwords.encode(code));
        reset.setExpiresAt(now.plus(10, ChronoUnit.MINUTES));
        reset.setSentAt(now);
        reset.setAttempts(0);
        reset.setSendsInWindow(reset.getSendsInWindow() + 1);
        resets.saveAndFlush(reset);
        events.publishEvent(new ResetCodeEmail(email, code));
    }

    @Transactional(noRollbackFor = ApiException.class)
    public void reset(ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        PasswordResetCode reset = resets.findLockedByEmail(email)
                .orElseThrow(() -> invalidCode());
        if (!Instant.now().isBefore(reset.getExpiresAt())) throw invalidCode();
        if (reset.getAttempts() >= 5) throw invalidCode();
        if (!passwords.matches(request.code(), reset.getCodeHash())) {
            reset.setAttempts(reset.getAttempts() + 1);
            throw invalidCode();
        }
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is too long for BCrypt");
        User user = users.findLockedByEmail(email).orElseThrow(() -> invalidCode());
        user.setPasswordHash(passwords.encode(request.password()));
        user.setAuthVersion(user.getAuthVersion() + 1);
        user.setMfaChallengeHash(null);
        user.setMfaChallengeExpiresAt(null);
        resets.delete(reset);
        events.publishEvent(new PasswordChangedEmail(email));
    }

    private ApiException invalidCode() {
        return new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired password reset code");
    }
}
