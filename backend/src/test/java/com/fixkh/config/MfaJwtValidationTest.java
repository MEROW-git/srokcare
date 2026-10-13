package com.fixkh.config;

import com.fixkh.entity.User;
import com.fixkh.repository.UserRepository;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MfaJwtValidationTest {
    @Test void enablingMfaRejectsOldAndPasswordOnlyTokens() {
        String secret = "unit-test-secret-with-more-than-thirty-two-characters";
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setMfaEnabled(true);
        user.setAuthVersion(1);
        UserRepository users = mock(UserRepository.class);
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        SecurityConfig config = new SecurityConfig();
        JwtDecoder decoder = config.jwtDecoder(secret, users);
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(
                new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256")));

        assertThrows(JwtException.class, () -> decoder.decode(token(encoder, user, 0, false)));
        assertThrows(JwtException.class, () -> decoder.decode(token(encoder, user, 1, false)));
        assertEquals(user.getId().toString(), decoder.decode(token(encoder, user, 1, true)).getSubject());
        user.setAuthVersion(2);
        assertThrows(JwtException.class, () -> decoder.decode(token(encoder, user, 1, true)));
    }

    private String token(JwtEncoder encoder, User user, int version, boolean mfa) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("fixkh").subject(user.getId().toString())
                .issuedAt(now).expiresAt(now.plusSeconds(3600))
                .claim("role", "CITIZEN").claim("authVersion", version).claim("mfa", mfa).build();
        return encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }
}
