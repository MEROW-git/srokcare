package com.fixkh.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "reports") @Getter @Setter @org.hibernate.annotations.DynamicUpdate
public class Report {
    @Id private UUID id = UUID.randomUUID();
    @Column(nullable = false, length = 120) private String title;
    @Column(nullable = false, length = 2000) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private ReportCategory category;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private ReportStatus status = ReportStatus.REPORTED;
    @Column(name = "admin_note", length = 2000) private String adminNote;
    @Column(nullable = false) private Double latitude;
    @Column(nullable = false) private Double longitude;
    @Column(nullable = false, length = 100) private String province;
    @Column(length = 100) private String district;
    @Column(length = 255) private String address;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "author_id") private User author;
    @Column(name = "support_count", nullable = false) private int supportCount;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @PrePersist void create() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate void update() { updatedAt = Instant.now(); }
}
