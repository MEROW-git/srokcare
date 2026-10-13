package com.fixkh.service;

import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class AuthenticatorCodesTest {
    @Test void matchesRfc6238VectorAndRejectsReplay() {
        String secret = AuthenticatorCodes.encodeSecret("12345678901234567890".getBytes(StandardCharsets.US_ASCII));
        assertEquals("287082", AuthenticatorCodes.code(secret, 1));
        assertEquals(1, AuthenticatorCodes.matchingStep(secret, "287082", 1, null));
        assertEquals(-1, AuthenticatorCodes.matchingStep(secret, "287082", 1, 1L));
        assertEquals(-1, AuthenticatorCodes.matchingStep(secret, "not-a-code", 1, null));
    }

    @Test void provisioningUriContainsAccountAndStandardParameters() {
        String uri = AuthenticatorCodes.uri("sok@example.com", "ABCDEF");
        assertTrue(uri.startsWith("otpauth://totp/FixKH%3Asok%40example.com?"));
        assertTrue(uri.contains("secret=ABCDEF"));
        assertTrue(uri.contains("period=30"));
    }
}
