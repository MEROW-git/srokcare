package com.fixkh.service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.Locale;

/** RFC 6238 TOTP with SHA-1, six digits, and 30-second steps. */
public final class AuthenticatorCodes {
    private static final char[] BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();
    private AuthenticatorCodes() {}

    public static String encodeSecret(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        int buffer = 0, bits = 0;
        for (byte value : bytes) {
            buffer = (buffer << 8) | (value & 0xff);
            bits += 8;
            while (bits >= 5) {
                bits -= 5;
                result.append(BASE32[(buffer >> bits) & 31]);
            }
        }
        if (bits > 0) result.append(BASE32[(buffer << (5 - bits)) & 31]);
        return result.toString();
    }

    static byte[] decodeSecret(String text) {
        var out = new java.io.ByteArrayOutputStream();
        int buffer = 0, bits = 0;
        for (char c : text.toUpperCase(Locale.ROOT).toCharArray()) {
            int value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);
            if (value < 0) throw new IllegalArgumentException("Invalid authenticator secret");
            buffer = (buffer << 5) | value;
            bits += 5;
            if (bits >= 8) {
                bits -= 8;
                out.write((buffer >> bits) & 0xff);
            }
        }
        return out.toByteArray();
    }

    public static String code(String secret, long step) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(decodeSecret(secret), "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(8).putLong(step).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int value = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff);
            return String.format(Locale.ROOT, "%06d", value % 1_000_000);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Authenticator algorithm unavailable", e);
        }
    }

    public static long matchingStep(String secret, String candidate, long currentStep, Long lastUsedStep) {
        if (candidate == null || !candidate.matches("[0-9]{6}")) return -1;
        for (long step = currentStep - 1; step <= currentStep + 1; step++) {
            if (lastUsedStep != null && step <= lastUsedStep) continue;
            if (MessageDigest.isEqual(code(secret, step).getBytes(StandardCharsets.US_ASCII),
                    candidate.getBytes(StandardCharsets.US_ASCII))) return step;
        }
        return -1;
    }

    public static String uri(String email, String secret) {
        String label = URLEncoder.encode("FixKH:" + email, StandardCharsets.UTF_8).replace("+", "%20");
        return "otpauth://totp/" + label + "?secret=" + secret + "&issuer=FixKH&algorithm=SHA1&digits=6&period=30";
    }
}
