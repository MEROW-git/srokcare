package com.fixkh;

import com.fixkh.config.SecurityConfig;
import com.fixkh.controller.*;
import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.*;
import com.fixkh.exception.ApiException;
import com.fixkh.service.*;
import com.fixkh.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({HealthController.class, AuthController.class, ReportController.class, ImageController.class, SupportController.class, CommentController.class, AdminController.class})
@Import(SecurityConfig.class)
@org.springframework.test.context.TestPropertySource(properties = {"fixkh.jwt-secret=development-test-secret-at-least-thirty-two-bytes", "fixkh.cors-origins=http://localhost:5173"})
class ApiWebTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean AuthService auth;
    @MockitoBean MfaService mfa;
    @MockitoBean UserRepository users;
    @MockitoBean ReportService reports;
    @MockitoBean ImageService images;
    @MockitoBean SupportService supports;
    @MockitoBean CommentService comments;
    @MockitoBean AdminService admin;
    @MockitoBean JdbcTemplate jdbc;

    private static final UUID ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private ReportResponse report() {
        return new ReportResponse(ID, "Large pothole", "Dangerous for motorcycles", ReportCategory.ROAD_DAMAGE,
                ReportStatus.REPORTED, "SOK Citizen", 11.55, 104.92, "Phnom Penh", null, null,
                List.of(), 0, 0, false, Instant.now(), Instant.now());
    }
    @Test void registrationValidationAndDuplicateEmail() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType("application/json")
                .content("{\"email\":\"bad\"}"))
                .andExpect(status().isBadRequest());
        when(auth.register(any())).thenReturn(new RegistrationPendingResponse("Registration code sent. Check your email"));
        mvc.perform(post("/api/v1/auth/register").contentType("application/json")
                .content("{\"email\":\"sok@example.com\"}"))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.code").doesNotExist());
        when(auth.register(any())).thenThrow(new ApiException(HttpStatus.CONFLICT, "Email already registered"));
        mvc.perform(post("/api/v1/auth/register").contentType("application/json")
                .content("{\"email\":\"sok@example.com\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("Email already registered"));
        mvc.perform(post("/api/v1/auth/verify-registration").contentType("application/json")
                .content("{\"nickname\":\"SOK Citizen\",\"email\":\"sok@example.com\",\"password\":\"StrongPassword123!\",\"code\":\"bad\"}"))
                .andExpect(status().isBadRequest());
        when(auth.verifyRegistration(any())).thenReturn(new AuthResponse("signed-jwt",
                new UserResponse(ID, "SOK Citizen", "sok@example.com", Role.CITIZEN, Instant.now())));
        mvc.perform(post("/api/v1/auth/verify-registration").contentType("application/json")
                .content("{\"nickname\":\"SOK Citizen\",\"email\":\"sok@example.com\",\"password\":\"StrongPassword123!\",\"code\":\"123456\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.token").value("signed-jwt"));
    }
    @Test void jwtRequiredForMeAndLoginIsPublic() throws Exception {
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401));
        when(auth.me()).thenReturn(new UserResponse(ID, "SOK Citizen", "sok@example.com", Role.CITIZEN, Instant.now()));
        mvc.perform(get("/api/v1/auth/me").with(jwt().jwt(j -> j.subject(ID.toString()).claim("role", "CITIZEN"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("sok@example.com"));
        mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content("{\"email\":\"sok@example.com\",\"password\":\"StrongPassword123!\"}"))
                .andExpect(status().isOk());
    }
    @Test void mfaChallengeDoesNotGrantAccessAndVerificationIsPublic() throws Exception {
        when(auth.login(any())).thenReturn(AuthResponse.challenge("opaque-challenge"));
        mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content("{\"email\":\"sok@example.com\",\"password\":\"StrongPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mfaRequired").value(true))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.token").doesNotExist());
        mvc.perform(post("/api/v1/auth/mfa/setup").contentType("application/json")
                .content("{\"password\":\"StrongPassword123!\"}"))
                .andExpect(status().isUnauthorized());
        when(mfa.verifyLogin(any())).thenReturn(new User());
        when(auth.response(any())).thenReturn(new AuthResponse("signed-jwt",
                new UserResponse(ID, "SOK Citizen", "sok@example.com", Role.CITIZEN, Instant.now())));
        mvc.perform(post("/api/v1/auth/mfa/verify-login").contentType("application/json")
                .content("{\"challengeToken\":\"opaque-challenge\",\"code\":\"123456\"}"))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.token").value("signed-jwt"));
    }
    @Test void reportCreationAndPaginationFilter() throws Exception {
        when(reports.create(any())).thenReturn(report());
        String body = "{\"title\":\"Large pothole\",\"description\":\"Dangerous for motorcycles\",\"category\":\"ROAD_DAMAGE\",\"latitude\":11.55,\"longitude\":104.92,\"province\":\"Phnom Penh\"}";
        mvc.perform(post("/api/v1/reports").with(jwt()).contentType("application/json").content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.authorNickname").value("SOK Citizen"))
                .andExpect(jsonPath("$.authorId").doesNotExist());
        when(reports.list(eq(ReportCategory.ROAD_DAMAGE), eq(ReportStatus.REPORTED), eq("Phnom Penh"), eq("pothole"), eq("popular"), eq(1), eq(10)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(report()), org.springframework.data.domain.PageRequest.of(1, 10), 11));
        mvc.perform(get("/api/v1/reports").param("category", "ROAD_DAMAGE").param("status", "REPORTED")
                .param("province", "Phnom Penh").param("search", "pothole").param("sortBy", "popular").param("page", "1").param("size", "10"))
                .andExpect(status().isOk()).andExpect(header().string("X-Total-Count", "11"))
                .andExpect(jsonPath("$[0].title").value("Large pothole"));
    }
    @Test void commentCreationAndAdminAuthorization() throws Exception {
        when(comments.create(eq(ID), any())).thenReturn(new CommentResponse(ID, ID, "SOK Citizen", "Needs repair", Instant.now(), Instant.now()));
        mvc.perform(post("/api/v1/reports/{id}/comments", ID).with(jwt()).contentType("application/json").content("{\"content\":\"Needs repair\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.authorNickname").value("SOK Citizen"));
        mvc.perform(get("/api/v1/admin/stats").with(jwt().jwt(j -> j.claim("role", "CITIZEN"))))
                .andExpect(status().isForbidden());
        when(admin.stats()).thenReturn(new AdminStats(0,0,0,0,0,0,0,0));
        mvc.perform(get("/api/v1/admin/stats").with(jwt().jwt(j -> j.claim("role", "ADMIN")).authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalReports").value(0));
    }
    @Test void imageUploadRequiresAuth() throws Exception {
        mvc.perform(multipart("/api/v1/reports/{id}/images", ID).file("files", new byte[] {1,2,3}))
                .andExpect(status().isUnauthorized());
    }
    @Test void healthChecksDatabase() throws Exception {
        when(jdbc.queryForObject("SELECT 1", Integer.class)).thenReturn(1);
        mvc.perform(get("/api/v1/health")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("FixKH API"));
    }
}
