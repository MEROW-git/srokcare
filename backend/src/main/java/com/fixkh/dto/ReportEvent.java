package com.fixkh.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Public real-time event payload broadcasted to STOMP subscribers.
 * Deliberately minimal: contains only eventType, reportId, and timestamp.
 * Never includes email, tokens, OTPs, MFA secrets, or sensitive user fields.
 */
public record ReportEvent(
    String eventType,
    UUID reportId,
    Instant timestamp
) {}
