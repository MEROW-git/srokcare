package com.fixkh.mapper;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.*;
import com.fixkh.repository.CommentRepository;
import com.fixkh.repository.ReportImageRepository;
import com.fixkh.repository.ReportSupportRepository;
import com.fixkh.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ApiMapper {
    private final ReportImageRepository images;
    private final CommentRepository comments;
    private final ReportSupportRepository supports;
    private final CurrentUser current;
    private final String publicBaseUrl;
    public ApiMapper(ReportImageRepository images, CommentRepository comments, ReportSupportRepository supports,
            CurrentUser current, @Value("${fixkh.public-base-url}") String publicBaseUrl) {
        this.images = images; this.comments = comments; this.supports = supports; this.current = current;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }
    public UserResponse user(User user) {
        String avatarUrl = user.getAvatarKey() != null
                ? profileImageUrl(user, "avatar", user.getAvatarKey())
                : null;
        String coverUrl = user.getCoverKey() != null
                ? profileImageUrl(user, "cover", user.getCoverKey())
                : null;
        return new UserResponse(user.getId(), user.getNickname(), user.getEmail(), user.getRole(), user.getCreatedAt(), user.getBio(), avatarUrl, coverUrl);
    }
    public PublicProfileResponse publicProfile(User user, long totalReports, long resolvedReports, long activeReports) {
        String avatarUrl = user.getAvatarKey() != null
                ? profileImageUrl(user, "avatar", user.getAvatarKey())
                : null;
        String coverUrl = user.getCoverKey() != null
                ? profileImageUrl(user, "cover", user.getCoverKey())
                : null;
        return new PublicProfileResponse(user.getNickname(), user.getRole(), user.getCreatedAt(), user.getBio(), avatarUrl, coverUrl, totalReports, resolvedReports, activeReports);
    }
    public ReportResponse report(Report report) {
        var urls = images.findByReportIdOrderByCreatedAt(report.getId()).stream()
                .map(image -> imageUrl(report.getId(), image.getId())).toList();
        boolean mine = current.optionalId().map(id -> supports.existsByReportIdAndUserId(report.getId(), id)).orElse(false);
        return new ReportResponse(report.getId(), report.getTitle(), report.getDescription(), report.getCategory(),
                report.getStatus(), report.getAuthor().getNickname(), report.getLatitude(), report.getLongitude(),
                report.getProvince(), report.getDistrict(), report.getAddress(), urls, report.getSupportCount(),
                comments.countByReportId(report.getId()), mine, report.getCreatedAt(), report.getUpdatedAt());
    }
    public CommentResponse comment(Comment comment) { return new CommentResponse(comment.getId(), comment.getReport().getId(),
            comment.getAuthor().getNickname(), comment.getContent(), comment.getCreatedAt(), comment.getUpdatedAt()); }
    public ImageResponse image(ReportImage image) { return new ImageResponse(image.getId(),
            imageUrl(image.getReport().getId(), image.getId()), image.getCreatedAt()); }
    private String imageUrl(java.util.UUID reportId, java.util.UUID imageId) {
        return publicBaseUrl + "/api/v1/reports/" + reportId + "/images/" + imageId + "/content";
    }
    private String profileImageUrl(User user, String kind, String key) {
        return publicBaseUrl + "/api/v1/users/" + user.getId() + "/" + kind + "?v=" + key;
    }
}
