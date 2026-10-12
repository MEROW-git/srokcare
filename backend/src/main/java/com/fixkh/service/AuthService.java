package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.Role;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.UserRepository;
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

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtEncoder encoder;
    private final ApiMapper mapper;
    private final CurrentUser current;
    public AuthService(UserRepository users, PasswordEncoder passwords, JwtEncoder encoder, ApiMapper mapper, CurrentUser current) {
        this.users = users; this.passwords = passwords; this.encoder = encoder; this.mapper = mapper; this.current = current;
    }
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String nickname = request.nickname().trim();
        if (nickname.length() < 2) throw new ApiException(HttpStatus.BAD_REQUEST, "Nickname must contain at least two characters");
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is too long for BCrypt");
        if (users.existsByEmailIgnoreCase(email)) throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        User user = new User();
        user.setNickname(nickname); user.setEmail(email);
        user.setPasswordHash(passwords.encode(request.password())); user.setRole(Role.CITIZEN);
        users.saveAndFlush(user);
        return response(user);
    }
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwords.matches(request.password(), user.getPasswordHash())) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        return response(user);
    }
    @Transactional(readOnly = true)
    public UserResponse me() { return mapper.user(current.user()); }
    private AuthResponse response(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("fixkh").subject(user.getId().toString())
                .issuedAt(now).expiresAt(now.plus(12, ChronoUnit.HOURS)).claim("role", user.getRole().name()).build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, mapper.user(user));
    }
}
