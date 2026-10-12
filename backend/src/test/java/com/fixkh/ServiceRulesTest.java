package com.fixkh;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.*;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.*;
import com.fixkh.security.CurrentUser;
import com.fixkh.service.*;
import com.fixkh.storage.ImageStorage;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ServiceRulesTest {
    private final UUID id = UUID.randomUUID();
    private User citizen() { User u = new User(); u.setId(id); u.setRole(Role.CITIZEN); u.setNickname("សុខ Citizen"); return u; }
    @Test void registrationRejectsDuplicateEmail() {
        UserRepository users = mock(UserRepository.class);
        when(users.existsByEmailIgnoreCase("sok@example.com")).thenReturn(true);
        AuthService service = new AuthService(users, new BCryptPasswordEncoder(), mock(JwtEncoder.class), mock(ApiMapper.class), mock(CurrentUser.class));
        ApiException error = assertThrows(ApiException.class, () -> service.register(new RegisterRequest("SOK Citizen", "SOK@example.com", "StrongPassword123!")));
        assertEquals(HttpStatus.CONFLICT, error.getStatus()); verify(users, never()).save(any());
    }
    @Test void loginIssuesSignedJwtForCitizen() {
        String secret = "unit-test-secret-with-more-than-thirty-two-characters";
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        UserRepository users = mock(UserRepository.class); ApiMapper mapper = mock(ApiMapper.class);
        User user = citizen(); user.setEmail("sok@example.com"); user.setPasswordHash(new BCryptPasswordEncoder().encode("StrongPassword123!"));
        when(users.findByEmailIgnoreCase("sok@example.com")).thenReturn(Optional.of(user));
        when(mapper.user(user)).thenReturn(new UserResponse(id, user.getNickname(), user.getEmail(), Role.CITIZEN, null));
        AuthService service = new AuthService(users, new BCryptPasswordEncoder(), new NimbusJwtEncoder(new ImmutableSecret<>(key)), mapper, mock(CurrentUser.class));
        AuthResponse response = service.login(new LoginRequest("sok@example.com", "StrongPassword123!"));
        Jwt jwt = NimbusJwtDecoder.withSecretKey(key).build().decode(response.token());
        assertEquals(id.toString(), jwt.getSubject()); assertEquals("CITIZEN", jwt.getClaimAsString("role"));
        assertEquals(Role.CITIZEN, response.user().role());
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ApiException.class,
                () -> service.login(new LoginRequest("sok@example.com", "wrong"))).getStatus());
    }
    @Test void reportCreationUsesAuthenticatedAuthorAndReportedStatus() {
        ReportRepository reports = mock(ReportRepository.class); CurrentUser current = mock(CurrentUser.class); ApiMapper mapper = mock(ApiMapper.class);
        User user = citizen(); when(current.user()).thenReturn(user);
        when(reports.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        ReportService service = new ReportService(reports, current, mapper, mock(ImageService.class));
        service.create(new ReportRequest("Large pothole", "Dangerous for motorcycles", ReportCategory.ROAD_DAMAGE,
                11.55, 104.92, "Phnom Penh", null, null));
        org.mockito.ArgumentCaptor<Report> captured = org.mockito.ArgumentCaptor.forClass(Report.class);
        verify(reports).saveAndFlush(captured.capture());
        assertSame(user, captured.getValue().getAuthor());
        assertEquals(ReportStatus.REPORTED, captured.getValue().getStatus());
    }
    @Test void ownerCannotModifyModeratedReport() {
        CurrentUser current = mock(CurrentUser.class); when(current.user()).thenReturn(citizen());
        ReportService service = new ReportService(mock(ReportRepository.class), current, mock(ApiMapper.class), mock(ImageService.class));
        Report report = new Report(); report.setAuthor(citizen()); report.setStatus(ReportStatus.IN_PROGRESS);
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> service.assertCanModify(report)).getStatus());
        report.setStatus(ReportStatus.REPORTED); User other = citizen(); other.setId(UUID.randomUUID()); report.setAuthor(other);
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> service.assertCanModify(report)).getStatus());
    }
    @Test void duplicateSupportIsRejected() {
        ReportSupportRepository supports = mock(ReportSupportRepository.class);
        ReportRepository reports = mock(ReportRepository.class); CurrentUser current = mock(CurrentUser.class);
        when(reports.findById(id)).thenReturn(java.util.Optional.of(new Report()));
        when(current.id()).thenReturn(id); when(supports.existsByReportIdAndUserId(id, id)).thenReturn(true);
        SupportService service = new SupportService(supports, reports, current);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> service.add(id)).getStatus());
        verify(supports, never()).save(any());
    }
    @Test void imageRejectsInvalidContents() {
        ReportRepository reports = mock(ReportRepository.class); CurrentUser current = mock(CurrentUser.class);
        Report report = new Report(); report.setAuthor(citizen());
        when(reports.findLockedById(id)).thenReturn(java.util.Optional.of(report)); when(current.user()).thenReturn(citizen());
        ImageService service = new ImageService(mock(ReportImageRepository.class), reports, current, mock(ImageStorage.class), mock(ApiMapper.class));
        MockMultipartFile fake = new MockMultipartFile("files", "fake.jpg", "image/jpeg", "not really a JPEG".getBytes(StandardCharsets.UTF_8));
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class, () -> service.upload(id, new MockMultipartFile[] { fake })).getStatus());
        MockMultipartFile huge = new MockMultipartFile("files", "huge.jpg", "image/jpeg", new byte[5 * 1024 * 1024 + 1]);
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, assertThrows(ApiException.class,
                () -> service.upload(id, new MockMultipartFile[] { huge })).getStatus());
    }
}
