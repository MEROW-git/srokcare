package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.repository.UserRepository;
import com.fixkh.security.CurrentUser;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class MfaServiceTest {
    private static final String KEY = Base64.getEncoder().encodeToString(new byte[32]);

    @Test void enrollmentRequiresPasswordThenCreatesRecoveryCodesAndOneTimeChallenge() {
        User user = new User();
        user.setEmail("sok@example.com");
        user.setPasswordHash(new BCryptPasswordEncoder().encode("StrongPassword123!"));
        UserRepository users = mock(UserRepository.class);
        CurrentUser current = mock(CurrentUser.class);
        when(current.id()).thenReturn(user.getId());
        when(users.findLockedById(user.getId())).thenReturn(Optional.of(user));
        when(users.findLockedByMfaChallengeHash(anyString())).thenReturn(Optional.of(user));
        MfaService service = new MfaService(users, current, new BCryptPasswordEncoder(), KEY);

        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ApiException.class,
                () -> service.beginSetup(new MfaSetupRequest("wrong"))).getStatus());
        MfaSetupResponse setup = service.beginSetup(new MfaSetupRequest("StrongPassword123!"));
        assertFalse(setup.secret().isBlank());
        assertNotEquals(setup.secret(), user.getMfaPendingCiphertext());
        String code = AuthenticatorCodes.code(setup.secret(), Instant.now().getEpochSecond() / 30);
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                () -> service.confirm(new MfaCodeRequest("000xyz"))).getStatus());
        MfaService.Confirmation confirmation = service.confirm(new MfaCodeRequest(code));
        assertTrue(user.isMfaEnabled());
        assertEquals(1, user.getAuthVersion());
        assertEquals(8, confirmation.recoveryCodes().size());
        assertFalse(user.getMfaRecoveryHashes().contains(confirmation.recoveryCodes().get(0)));

        MfaChallengeResponse challenge = service.startChallenge(user);
        assertTrue(challenge.mfaRequired());
        assertNotEquals(challenge.challengeToken(), user.getMfaChallengeHash());
        assertSame(user, service.verifyLogin(new MfaVerifyRequest(challenge.challengeToken(), confirmation.recoveryCodes().get(0))));
        assertNull(user.getMfaChallengeHash());
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ApiException.class,
                () -> service.verifyLogin(new MfaVerifyRequest(challenge.challengeToken(), code))).getStatus());

        MfaChallengeResponse next = service.startChallenge(user);
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ApiException.class,
                () -> service.verifyLogin(new MfaVerifyRequest(next.challengeToken(), confirmation.recoveryCodes().get(0)))).getStatus());
        assertSame(user, service.disable(new MfaDisableRequest("StrongPassword123!", confirmation.recoveryCodes().get(1))));
        assertFalse(user.isMfaEnabled());
        assertEquals(2, user.getAuthVersion());
        assertNull(user.getMfaSecretCiphertext());
    }

    @Test void missingEncryptionKeyFailsClosed() {
        User user = new User();
        user.setMfaEnabled(true);
        MfaService service = new MfaService(mock(UserRepository.class), mock(CurrentUser.class),
                new BCryptPasswordEncoder(), "");
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ApiException.class, () -> service.startChallenge(user)).getStatus());
    }
}
