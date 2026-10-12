package com.fixkh.security;

import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Optional;
import java.util.UUID;

@Component
public class CurrentUser {
    private final UserRepository users;
    public CurrentUser(UserRepository users) { this.users = users; }
    public Optional<UUID> optionalId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) return Optional.empty();
        try { return Optional.of(UUID.fromString(auth.getName())); }
        catch (IllegalArgumentException e) { return Optional.empty(); }
    }
    public UUID id() { return optionalId().orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required")); }
    public User user() { return users.findById(id()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account no longer exists")); }
}
