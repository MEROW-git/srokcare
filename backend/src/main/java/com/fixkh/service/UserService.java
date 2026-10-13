package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.ReportStatus;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.ReportRepository;
import com.fixkh.repository.UserRepository;
import com.fixkh.security.CurrentUser;
import com.fixkh.storage.ImageStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URLDecoder;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository users;
    private final ReportRepository reports;
    private final CurrentUser current;
    private final ApiMapper mapper;
    private final ImageStorage storage;
    private final ImageService images;

    public UserService(UserRepository users, ReportRepository reports, CurrentUser current,
                       ApiMapper mapper, ImageStorage storage, ImageService images) {
        this.users = users;
        this.reports = reports;
        this.current = current;
        this.mapper = mapper;
        this.storage = storage;
        this.images = images;
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = current.user();
        String newNickname = request.nickname().trim();
        if (newNickname.length() < 2 || newNickname.length() > 50) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nickname must be between 2 and 50 characters");
        }
        if (!user.getNickname().equalsIgnoreCase(newNickname) && users.existsByNicknameIgnoreCase(newNickname)) {
            throw new ApiException(HttpStatus.CONFLICT, "Nickname is already in use by another citizen");
        }
        user.setNickname(newNickname);
        if (request.bio() != null) {
            String trimmedBio = request.bio().trim();
            if (trimmedBio.length() > 500) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Bio must be at most 500 characters");
            }
            user.setBio(trimmedBio.isEmpty() ? null : trimmedBio);
        } else {
            user.setBio(null);
        }
        User saved = users.saveAndFlush(user);
        return mapper.user(saved);
    }

    @Transactional
    public UserResponse uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Avatar file cannot be empty");
        }
        ImageService.Processed processed = images.process(file);
        User user = current.user();
        String oldKey = user.getAvatarKey();
        String newKey = UUID.randomUUID() + processed.extension();
        try {
            storage.save(newKey, processed.bytes());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save avatar image");
        }
        user.setAvatarKey(newKey);
        user.setAvatarContentType(processed.contentType());
        User saved = users.saveAndFlush(user);
        if (oldKey != null) {
            deleteQuietly(oldKey);
        }
        return mapper.user(saved);
    }

    @Transactional
    public UserResponse removeAvatar() {
        User user = current.user();
        String oldKey = user.getAvatarKey();
        user.setAvatarKey(null);
        user.setAvatarContentType(null);
        User saved = users.saveAndFlush(user);
        if (oldKey != null) {
            deleteQuietly(oldKey);
        }
        return mapper.user(saved);
    }

    @Transactional
    public UserResponse uploadCover(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cover file cannot be empty");
        }
        ImageService.Processed processed = images.process(file);
        User user = current.user();
        String oldKey = user.getCoverKey();
        String newKey = UUID.randomUUID() + processed.extension();
        try {
            storage.save(newKey, processed.bytes());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save cover image");
        }
        user.setCoverKey(newKey);
        user.setCoverContentType(processed.contentType());
        User saved = users.saveAndFlush(user);
        if (oldKey != null) {
            deleteQuietly(oldKey);
        }
        return mapper.user(saved);
    }

    @Transactional
    public UserResponse removeCover() {
        User user = current.user();
        String oldKey = user.getCoverKey();
        user.setCoverKey(null);
        user.setCoverContentType(null);
        User saved = users.saveAndFlush(user);
        if (oldKey != null) {
            deleteQuietly(oldKey);
        }
        return mapper.user(saved);
    }

    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(String identifier) {
        User user = findUserByIdentifier(identifier);
        long totalReports = reports.countByAuthorId(user.getId());
        long resolvedReports = reports.countByAuthorIdAndStatus(user.getId(), ReportStatus.RESOLVED);
        return mapper.publicProfile(user, totalReports, resolvedReports);
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getPublicReports(String identifier, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "page must be >= 0 and size must be 1..100");
        }
        User user = findUserByIdentifier(identifier);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return reports.findByAuthorId(user.getId(), pageable).map(mapper::report);
    }

    @Transactional(readOnly = true)
    public ImageService.ImageData getAvatarData(String identifier) {
        User user = findUserByIdentifier(identifier);
        if (user.getAvatarKey() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Avatar not found");
        }
        try {
            return new ImageService.ImageData(storage.read(user.getAvatarKey()), user.getAvatarContentType());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Avatar content not found");
        }
    }

    @Transactional(readOnly = true)
    public ImageService.ImageData getCoverData(String identifier) {
        User user = findUserByIdentifier(identifier);
        if (user.getCoverKey() == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Cover image not found");
        }
        try {
            return new ImageService.ImageData(storage.read(user.getCoverKey()), user.getCoverContentType());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Cover content not found");
        }
    }

    public User findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User identifier required");
        }
        String decoded = URLDecoder.decode(identifier, StandardCharsets.UTF_8).trim();
        return users.findByNicknameIgnoreCase(decoded)
                .or(() -> {
                    try {
                        UUID id = UUID.fromString(decoded);
                        return users.findById(id);
                    } catch (IllegalArgumentException e) {
                        return Optional.empty();
                    }
                })
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User profile not found"));
    }

    private void deleteQuietly(String key) {
        try {
            storage.delete(key);
        } catch (IOException ignored) {}
    }
}
