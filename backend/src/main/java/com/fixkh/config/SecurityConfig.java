package com.fixkh.config;

import com.fixkh.dto.ApiDtos.ErrorResponse;
import com.fixkh.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean JwtEncoder jwtEncoder(@Value("${fixkh.jwt-secret}") String secret) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(key(secret)));
    }
    @Bean JwtDecoder jwtDecoder(@Value("${fixkh.jwt-secret}") String secret, UserRepository users) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key(secret)).build();
        OAuth2TokenValidator<Jwt> accountValidator = jwt -> {
            try {
                var user = users.findById(UUID.fromString(jwt.getSubject()));
                Object version = jwt.getClaims().get("authVersion");
                if (user.isPresent() && version instanceof Number number
                        && number.intValue() == user.get().getAuthVersion()
                        && (!user.get().isMfaEnabled() || Boolean.TRUE.equals(jwt.getClaim("mfa"))))
                    return OAuth2TokenValidatorResult.success();
            } catch (RuntimeException ignored) {
                // Invalid account identity or missing account.
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Account session expired", null));
        };
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), accountValidator));
        return decoder;
    }
    private SecretKeySpec key(String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalStateException("JWT_SECRET must contain at least 32 UTF-8 bytes");
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
    @Bean CorsConfigurationSource corsConfigurationSource(@Value("${fixkh.cors-origins}") String origins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("X-Total-Count", "X-Page", "X-Page-Size"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    @Bean JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            return role == null ? List.of() : List.of(new SimpleGrantedAuthority("ROLE_" + role));
        });
        return converter;
    }
    @Bean SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationConverter converter, ObjectMapper mapper) throws Exception {
        return http.csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/ws/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/health", "/api/v1/reports", "/api/v1/reports/*",
                                "/api/v1/reports/*/comments", "/api/v1/reports/*/images", "/api/v1/reports/*/images/*/content",
                                "/api/v1/users/*/public-profile", "/api/v1/users/*/reports", "/api/v1/users/*/avatar", "/api/v1/users/*/cover").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/verify-registration",
                                "/api/v1/auth/login", "/api/v1/auth/mfa/verify-login").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o
                        .authenticationEntryPoint((req, res, ex) -> securityError(mapper, req.getRequestURI(), res, 401, "Invalid or expired token"))
                        .jwt(j -> j.jwtAuthenticationConverter(converter)))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) -> securityError(mapper, req.getRequestURI(), res, 401, "Authentication required"))
                        .accessDeniedHandler((req, res, ex) -> securityError(mapper, req.getRequestURI(), res, 403, "Access denied")))
                .build();
    }
    private void securityError(ObjectMapper mapper, String path, HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), new ErrorResponse(Instant.now(), status,
                status == 401 ? "Unauthorized" : "Forbidden", message, path));
    }
}
