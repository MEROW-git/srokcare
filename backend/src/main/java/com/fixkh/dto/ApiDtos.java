package com.fixkh.dto;

import com.fixkh.entity.ReportCategory;
import com.fixkh.entity.ReportStatus;
import com.fixkh.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ApiDtos {
    private ApiDtos() {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 50) @Schema(example = "SOK Citizen") String nickname,
            @NotBlank @Email @Size(max = 320) @Schema(example = "sok@example.com") String email,
            @NotBlank @Size(min = 8, max = 72) @Schema(example = "StrongPassword123!") String password) {}
    public record LoginRequest(@NotBlank @Email @Schema(example = "sok@example.com") String email,
            @NotBlank @Schema(example = "StrongPassword123!") String password) {}
    public record UserResponse(@Schema(example = "bb5fc6f1-64c2-4f0f-bec8-a4f3d85d81f4") UUID id,
            @Schema(example = "SOK Citizen") String nickname, String email, Role role, Instant createdAt) {}
    public record AuthResponse(@Schema(example = "eyJhbGciOiJIUzI1NiJ9...") String token, UserResponse user) {}

    public record ReportRequest(
            @NotBlank @Size(min = 5, max = 120) @Schema(example = "Large pothole on the road") String title,
            @NotBlank @Size(min = 15, max = 2000) @Schema(example = "This road is dangerous for motorcycles.") String description,
            @NotNull ReportCategory category,
            @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") @Schema(example = "11.5564") Double latitude,
            @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") @Schema(example = "104.9282") Double longitude,
            @NotBlank @Size(max = 100) @Schema(example = "Phnom Penh") String province,
            @Size(max = 100) @Schema(example = "Daun Penh") String district,
            @Size(max = 255) String address) {}
    public record ReportUpdateRequest(
            @Size(min = 5, max = 120) String title,
            @Size(min = 15, max = 2000) String description,
            ReportCategory category,
            @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 100) String province,
            @Size(max = 100) String district,
            @Size(max = 255) String address) {}
    public record ReportResponse(@Schema(example = "8428c621-c708-4204-bcd8-f82dcc3a5093") UUID id,
            @Schema(example = "Large pothole on the road") String title,
            @Schema(example = "This road is dangerous for motorcycles.") String description,
            ReportCategory category, ReportStatus status, @Schema(example = "SOK Citizen") String authorNickname,
            Double latitude, Double longitude, String province, String district, String address, List<String> images,
            @Schema(example = "34") int supportCount, @Schema(example = "6") long commentCount,
            boolean supportedByMe, Instant createdAt, Instant updatedAt) {}
    public record ImageResponse(UUID id,
            @Schema(example = "http://localhost:8080/api/v1/reports/8428c621-c708-4204-bcd8-f82dcc3a5093/images/53f456b5-3b38-40f0-9564-091e5a19c410/content") String url,
            Instant createdAt) {}
    public record SupportResponse(@Schema(example = "35") int supportCount, boolean supportedByMe) {}
    public record CommentRequest(@NotBlank @Size(min = 1, max = 2000)
            @Schema(example = "Neighbors put a temporary warning sign here.") String content) {}
    public record CommentResponse(UUID id, UUID reportId, @Schema(example = "SOK Citizen") String authorNickname,
            @Schema(example = "Neighbors put a temporary warning sign here.") String content, Instant createdAt, Instant updatedAt) {}
    public record StatusRequest(@NotNull @Schema(example = "UNDER_REVIEW") ReportStatus status,
            @Size(max = 2000) String adminNote) {}
    public record AdminStats(long totalReports, long reported, long underReview, long inProgress,
            long resolved, long rejected, long totalSupports, long totalComments) {}
    public record HealthResponse(String status, String application, String message) {}
    public record ErrorResponse(Instant timestamp, int status, String error, String message, String path) {}
}
