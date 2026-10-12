package com.fixkh.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "report_images") @Getter @Setter
public class ReportImage {
    @Id private UUID id = UUID.randomUUID();
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "report_id") private Report report;
    @Column(name = "storage_key", nullable = false, unique = true, length = 100) private String storageKey;
    @Column(name = "content_type", nullable = false, length = 20) private String contentType;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @PrePersist void create() { createdAt = Instant.now(); }
}
