package com.fixkh.config;

import com.fixkh.entity.Role;
import com.fixkh.entity.User;
import com.fixkh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Locale;

@Configuration @Profile("dev")
public class DevAdminBootstrap {
    @Bean ApplicationRunner bootstrapAdmin(UserRepository users, PasswordEncoder encoder,
            @Value("${fixkh.dev-admin.email}") String email,
            @Value("${fixkh.dev-admin.password}") String password,
            @Value("${fixkh.dev-admin.nickname}") String nickname) {
        return args -> {
            if (email.isBlank() && password.isBlank()) return;
            if (email.isBlank() || password.length() < 12 || nickname.isBlank())
                throw new IllegalStateException("Development admin requires email, nickname and password of at least 12 characters");
            if (users.findByEmailIgnoreCase(email).isPresent()) {
                if (users.findByEmailIgnoreCase(email).orElseThrow().getRole() != Role.ADMIN)
                    throw new IllegalStateException("Development admin email already belongs to a citizen account");
                return;
            }
            User admin = new User(); admin.setEmail(email.trim().toLowerCase(Locale.ROOT)); admin.setNickname(nickname.trim());
            admin.setPasswordHash(encoder.encode(password)); admin.setRole(Role.ADMIN); users.save(admin);
        };
    }
}
