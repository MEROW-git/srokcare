package com.fixkh.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Internal Spring application domain event published by mutating services.
 */
public record ReportDomainEvent(
    String eventType,
    UUID reportId,
    Instant timestamp
) {}
