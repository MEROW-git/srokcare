package com.fixkh.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "report_supports", uniqueConstraints = @UniqueConstraint(name = "ux_report_support", columnNames = {"report_id", "user_id"})) @Getter @Setter
public class ReportSupport {
    @Id private UUID id = UUID.randomUUID();
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "report_id") private Report report;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @PrePersist void create() { createdAt = Instant.now(); }
}
