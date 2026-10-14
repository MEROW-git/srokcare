package com.fixkh.service;

import com.fixkh.dto.ApiDtos.ForgotPasswordRequest;
import com.fixkh.dto.ApiDtos.ResetPasswordRequest;
import com.fixkh.entity.PasswordResetCode;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.repository.PasswordResetCodeRepository;
import com.fixkh.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PasswordResetServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final PasswordResetCodeRepository resets = mock(PasswordResetCodeRepository.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();
    private PasswordResetService service;

    @BeforeEach void setup() {
        service = new PasswordResetService(users, resets, passwords, events);
    }

    @Test void unknownEmailHasGenericOutcomeAndSendsNothing() {
        assertDoesNotThrow(() -> service.request(new ForgotPasswordRequest("unknown@example.com")));
        verifyNoInteractions(resets, events);
    }

    @Test void codeIsHashedAndRequestsAreThrottled() {
        when(users.existsByEmailIgnoreCase("citizen@example.com")).thenReturn(true);
        PasswordResetCode record = new PasswordResetCode();
        when(resets.findLockedByEmail("citizen@example.com")).thenReturn(Optional.of(record));
        service.request(new ForgotPasswordRequest("Citizen@Example.com"));
        var event = org.mockito.ArgumentCaptor.forClass(PasswordResetService.ResetCodeEmail.class);
        verify(events).publishEvent(event.capture());
        assertTrue(event.getValue().code().matches("[0-9]{6}"));
        assertTrue(passwords.matches(event.getValue().code(), record.getCodeHash()));
        assertEquals(1, record.getSendsInWindow());
        service.request(new ForgotPasswordRequest("citizen@example.com"));
        verifyNoMoreInteractions(events);
    }

    @Test void wrongCodeConsumesAttemptsAndExpiredCodeCannotReset() {
        PasswordResetCode record = new PasswordResetCode();
        record.setCodeHash(passwords.encode("123456"));
        record.setExpiresAt(Instant.now().plusSeconds(600));
        when(resets.findLockedByEmail("citizen@example.com")).thenReturn(Optional.of(record));
        ResetPasswordRequest request = new ResetPasswordRequest("citizen@example.com", "000000", "NewPassword123!");
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class, () -> service.reset(request)).getStatus());
        assertEquals(1, record.getAttempts());
        record.setExpiresAt(Instant.now().minusSeconds(1));
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                () -> service.reset(new ResetPasswordRequest("citizen@example.com", "123456", "NewPassword123!"))).getStatus());
        verifyNoInteractions(users, events);
    }

    @Test void validCodeChangesPasswordOnlyOnceAndRevokesExistingJwtVersions() {
        PasswordResetCode record = new PasswordResetCode();
        record.setCodeHash(passwords.encode("123456"));
        record.setExpiresAt(Instant.now().plusSeconds(600));
        User user = new User();
        user.setPasswordHash(passwords.encode("OldPassword123!"));
        user.setAuthVersion(2);
        user.setMfaEnabled(true);
        user.setMfaChallengeHash("old-challenge");
        when(resets.findLockedByEmail("citizen@example.com")).thenReturn(Optional.of(record));
        when(users.findLockedByEmail("citizen@example.com")).thenReturn(Optional.of(user));
        service.reset(new ResetPasswordRequest("Citizen@Example.com", "123456", "NewPassword123!"));
        assertTrue(passwords.matches("NewPassword123!", user.getPasswordHash()));
        assertFalse(passwords.matches("OldPassword123!", user.getPasswordHash()));
        assertEquals(3, user.getAuthVersion());
        assertTrue(user.isMfaEnabled());
        assertNull(user.getMfaChallengeHash());
        verify(resets).delete(record);
        verify(events).publishEvent(any(PasswordResetService.PasswordChangedEmail.class));
    }
}
