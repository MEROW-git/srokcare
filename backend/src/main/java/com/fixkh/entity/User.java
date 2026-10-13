package com.fixkh.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "users") @Getter @Setter
public class User {
    @Id private UUID id = UUID.randomUUID();
    @Column(nullable = false, length = 50) private String nickname;
    @Column(nullable = false, length = 320) private String email;
    @Column(name = "password_hash", nullable = false, length = 100) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Role role = Role.CITIZEN;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "mfa_enabled", nullable = false) private boolean mfaEnabled;
    @Column(name = "mfa_secret_ciphertext", length = 512) private String mfaSecretCiphertext;
    @Column(name = "mfa_pending_ciphertext", length = 512) private String mfaPendingCiphertext;
    @Column(name = "mfa_pending_expires_at") private Instant mfaPendingExpiresAt;
    @Column(name = "mfa_pending_attempts", nullable = false) private int mfaPendingAttempts;
    @Column(name = "mfa_last_step") private Long mfaLastStep;
    @Column(name = "mfa_recovery_hashes", columnDefinition = "text") private String mfaRecoveryHashes;
    @Column(name = "mfa_challenge_hash", length = 64) private String mfaChallengeHash;
    @Column(name = "mfa_challenge_expires_at") private Instant mfaChallengeExpiresAt;
    @Column(name = "mfa_failures", nullable = false) private int mfaFailures;
    @Column(name = "mfa_locked_until") private Instant mfaLockedUntil;
    @Column(name = "auth_version", nullable = false) private int authVersion;
    @PrePersist void create() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate void update() { updatedAt = Instant.now(); }
}
