package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.Role;
import com.fixkh.entity.User;
import com.fixkh.entity.PendingRegistration;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.UserRepository;
import com.fixkh.repository.PendingRegistrationRepository;
import com.fixkh.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Service
public class AuthService {
    private final UserRepository users;
    private final PendingRegistrationRepository pendingRegistrations;
    private final PasswordEncoder passwords;
    private final JwtEncoder encoder;
    private final ApiMapper mapper;
    private final CurrentUser current;
    private final RegistrationEmailSender emails;
    private final MfaService mfa;
    private final SecureRandom random = new SecureRandom();
    public AuthService(UserRepository users, PendingRegistrationRepository pendingRegistrations, PasswordEncoder passwords,
            JwtEncoder encoder, ApiMapper mapper, CurrentUser current, RegistrationEmailSender emails, MfaService mfa) {
        this.users = users; this.pendingRegistrations = pendingRegistrations; this.passwords = passwords;
        this.encoder = encoder; this.mapper = mapper; this.current = current; this.emails = emails; this.mfa = mfa;
    }
    @Transactional
    public RegistrationPendingResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        Instant now = Instant.now();
        PendingRegistration pending = pendingRegistrations.findLockedByEmail(email).orElseGet(PendingRegistration::new);
        if (pending.getSentAt() != null && now.isBefore(pending.getSentAt().plusSeconds(60)))
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Wait one minute before requesting another code");
        if (pending.getWindowStartedAt() == null || !now.isBefore(pending.getWindowStartedAt().plus(1, ChronoUnit.HOURS))) {
            pending.setWindowStartedAt(now);
            pending.setSendsInWindow(0);
        }
        if (pending.getSendsInWindow() >= 3)
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many codes requested. Try again later");
        String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        pending.setEmail(email);
        pending.setCodeHash(passwords.encode(code));
        pending.setExpiresAt(now.plus(10, ChronoUnit.MINUTES));
        pending.setSentAt(now);
        pending.setAttempts(0);
        pending.setSendsInWindow(pending.getSendsInWindow() + 1);
        pendingRegistrations.saveAndFlush(pending);
        emails.sendCode(email, code);
        return new RegistrationPendingResponse("Registration code sent. Check your email");
    }
    @Transactional(noRollbackFor = ApiException.class)
    public AuthResponse verifyRegistration(VerifyRegistrationRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        PendingRegistration pending = pendingRegistrations.findLockedByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired registration code"));
        Instant now = Instant.now();
        if (!now.isBefore(pending.getExpiresAt()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired registration code");
        if (pending.getAttempts() >= 5)
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many incorrect codes. Request a new code");
        if (!passwords.matches(request.code(), pending.getCodeHash())) {
            pending.setAttempts(pending.getAttempts() + 1);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired registration code");
        }
        String nickname = request.nickname().trim();
        if (nickname.length() < 2) throw new ApiException(HttpStatus.BAD_REQUEST, "Nickname must contain at least two characters");
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is too long for BCrypt");
        if (users.existsByEmailIgnoreCase(email)) throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        if (users.existsByNicknameIgnoreCase(nickname)) throw new ApiException(HttpStatus.CONFLICT, "Nickname is already in use");
        User user = new User();
        user.setNickname(nickname); user.setEmail(email);
        user.setPasswordHash(passwords.encode(request.password())); user.setRole(Role.CITIZEN);
        users.saveAndFlush(user);
        pendingRegistrations.delete(pending);
        return response(user);
    }
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = users.findLockedByEmail(request.email().trim()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwords.matches(request.password(), user.getPasswordHash())) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        if (user.isMfaEnabled()) return AuthResponse.challenge(mfa.startChallenge(user).challengeToken());
        return response(user);
    }
    @Transactional(readOnly = true)
    public UserResponse me() { return mapper.user(current.user()); }
    public AuthResponse response(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("fixkh").subject(user.getId().toString())
                .issuedAt(now).expiresAt(now.plus(12, ChronoUnit.HOURS)).claim("role", user.getRole().name())
                .claim("authVersion", user.getAuthVersion()).claim("mfa", user.isMfaEnabled()).build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, mapper.user(user));
    }
}
