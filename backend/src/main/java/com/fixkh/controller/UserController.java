package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.service.ImageService;
import com.fixkh.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users and Profiles")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PutMapping("/me/profile")
    @Operation(summary = "Update personal profile (nickname and bio)", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return service.updateProfile(request);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace avatar photo", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse uploadAvatar(@RequestParam("file") MultipartFile file) {
        return service.uploadAvatar(file);
    }

    @DeleteMapping("/me/avatar")
    @Operation(summary = "Remove personal avatar", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse removeAvatar() {
        return service.removeAvatar();
    }

    @PostMapping(value = "/me/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace profile cover photo", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse uploadCover(@RequestParam("file") MultipartFile file) {
        return service.uploadCover(file);
    }

    @DeleteMapping("/me/cover")
    @Operation(summary = "Remove personal cover photo", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse removeCover() {
        return service.removeCover();
    }

    @GetMapping("/{identifier}/public-profile")
    @Operation(summary = "Get public citizen profile by nickname or ID (no private data exposed)")
    public PublicProfileResponse getPublicProfile(@PathVariable String identifier) {
        return service.getPublicProfile(identifier);
    }

    @GetMapping("/{identifier}/reports")
    @Operation(summary = "Get public reports authored by citizen")
    public ResponseEntity<List<ReportResponse>> getPublicReports(
            @PathVariable String identifier,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ReportController.page(service.getPublicReports(identifier, page, size));
    }

    @GetMapping("/{identifier}/avatar")
    @Operation(summary = "Get user avatar image")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String identifier) {
        ImageService.ImageData data = service.getAvatarData(identifier);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(data.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofHours(24)).cachePublic())
                .body(data.bytes());
    }

    @GetMapping("/{identifier}/cover")
    @Operation(summary = "Get user cover image")
    public ResponseEntity<byte[]> getCover(@PathVariable String identifier) {
        ImageService.ImageData data = service.getCoverData(identifier);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(data.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofHours(24)).cachePublic())
                .body(data.bytes());
    }
}
