package com.fixkh.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name = "password_reset_codes") @Getter @Setter
public class PasswordResetCode {
    @Id @Column(length = 320) private String email;
    @Column(name = "code_hash", nullable = false, length = 100) private String codeHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "sent_at", nullable = false) private Instant sentAt;
    @Column(nullable = false) private int attempts;
    @Column(name = "sends_in_window", nullable = false) private int sendsInWindow;
    @Column(name = "window_started_at", nullable = false) private Instant windowStartedAt;
}
