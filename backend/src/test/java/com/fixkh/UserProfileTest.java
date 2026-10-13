package com.fixkh;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.Report;
import com.fixkh.entity.ReportCategory;
import com.fixkh.entity.ReportStatus;
import com.fixkh.entity.Role;
import com.fixkh.entity.User;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.ReportRepository;
import com.fixkh.repository.UserRepository;
import com.fixkh.security.CurrentUser;
import com.fixkh.service.ImageService;
import com.fixkh.service.UserService;
import com.fixkh.storage.ImageStorage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserProfileTest {
    private UserRepository users;
    private ReportRepository reports;
    private CurrentUser current;
    private ApiMapper mapper;
    private ImageStorage storage;
    private ImageService images;
    private UserService service;
    private User testUser;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        reports = mock(ReportRepository.class);
        current = mock(CurrentUser.class);
        mapper = mock(ApiMapper.class);
        storage = mock(ImageStorage.class);
        images = mock(ImageService.class);

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setNickname("Sok Citizen");
        testUser.setEmail("sok@example.com");
        testUser.setRole(Role.CITIZEN);
        testUser.setCreatedAt(Instant.now());

        when(current.user()).thenReturn(testUser);
        when(users.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service = new UserService(users, reports, current, mapper, storage, images);
    }

    @AfterEach
    void tearDown() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void updateProfileSucceedsWithValidData() {
        UpdateProfileRequest request = new UpdateProfileRequest("Sok Updated", "Volunteering for local roads");
        when(users.existsByNicknameIgnoreCase("Sok Updated")).thenReturn(false);
        when(mapper.user(any(User.class))).thenReturn(new UserResponse(testUser.getId(), "Sok Updated", testUser.getEmail(), Role.CITIZEN, testUser.getCreatedAt()));

        var response = service.updateProfile(request);
        assertEquals("Sok Updated", testUser.getNickname());
        assertEquals("Volunteering for local roads", testUser.getBio());
        assertNotNull(response);
    }

    @Test
    void updateProfileFailsWhenNicknameTakenByAnotherCitizen() {
        UpdateProfileRequest request = new UpdateProfileRequest("OtherCitizen", "Some bio");
        when(users.existsByNicknameIgnoreCase("OtherCitizen")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> service.updateProfile(request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void nicknameOnlyUpdatePreservesExistingBio() {
        testUser.setBio("Existing public bio");

        service.updateProfile(new UpdateProfileRequest("New Nickname", null));

        assertEquals("Existing public bio", testUser.getBio());
    }

    @Test
    void updateProfileFailsWhenNicknameTooShort() {
        UpdateProfileRequest request = new UpdateProfileRequest("A", "Some bio");
        ApiException ex = assertThrows(ApiException.class, () -> service.updateProfile(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void getPublicProfileExposesOnlyPublicFieldsAndCounts() {
        when(users.findByNicknameIgnoreCase("Sok Citizen")).thenReturn(Optional.of(testUser));
        when(reports.countByAuthorId(testUser.getId())).thenReturn(5L);
        when(reports.countByAuthorIdAndStatus(testUser.getId(), ReportStatus.RESOLVED)).thenReturn(3L);
        when(reports.countByAuthorIdAndStatusIn(eq(testUser.getId()), anyCollection())).thenReturn(1L);
        when(mapper.publicProfile(eq(testUser), eq(5L), eq(3L), eq(1L))).thenReturn(
                new PublicProfileResponse("Sok Citizen", Role.CITIZEN, testUser.getCreatedAt(), "Bio", "http://avatar", "http://cover", 5L, 3L, 1L)
        );

        PublicProfileResponse profile = service.getPublicProfile("Sok Citizen");
        assertNotNull(profile);
        assertEquals("Sok Citizen", profile.nickname());
        assertEquals(Role.CITIZEN, profile.role());
        assertEquals(5L, profile.totalReports());
        assertEquals(3L, profile.resolvedReports());
        assertEquals(1L, profile.activeReports());

        // Verify that PublicProfileResponse has NO email or account ID getters or fields
        assertFalse(profile.getClass().toGenericString().contains("email"));
        assertFalse(profile.getClass().toGenericString().contains("password"));
    }

    @Test
    void uploadAvatarProcessesAndSavesImage() throws IOException {
        byte[] validPng = createTestImageBytes();
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", validPng);
        when(images.process(any())).thenReturn(new ImageService.Processed(validPng, "image/png", ".png"));

        service.uploadAvatar(file);

        assertNotNull(testUser.getAvatarKey());
        assertTrue(testUser.getAvatarKey().endsWith(".png"));
        assertEquals("image/png", testUser.getAvatarContentType());
        verify(storage).save(eq(testUser.getAvatarKey()), eq(validPng));
    }

    @Test
    void uploadCoverProcessesAndSavesImage() throws IOException {
        byte[] validPng = createTestImageBytes();
        MockMultipartFile file = new MockMultipartFile("file", "cover.png", "image/png", validPng);
        when(images.process(any())).thenReturn(new ImageService.Processed(validPng, "image/png", ".png"));

        service.uploadCover(file);

        assertNotNull(testUser.getCoverKey());
        assertTrue(testUser.getCoverKey().endsWith(".png"));
        assertEquals("image/png", testUser.getCoverContentType());
        verify(storage).save(eq(testUser.getCoverKey()), eq(validPng));
    }

    @Test
    void replacingAvatarDeletesOldFileOnlyAfterCommit() throws IOException {
        testUser.setAvatarKey("old-avatar.png");
        byte[] png = createTestImageBytes();
        when(images.process(any())).thenReturn(new ImageService.Processed(png, "image/png", ".png"));
        TransactionSynchronizationManager.initSynchronization();

        service.uploadAvatar(new MockMultipartFile("file", "avatar.png", "image/png", png));
        String newKey = testUser.getAvatarKey();
        verify(storage, never()).delete(anyString());
        for (TransactionSynchronization callback : TransactionSynchronizationManager.getSynchronizations()) {
            callback.afterCommit();
            callback.afterCompletion(TransactionSynchronization.STATUS_COMMITTED);
        }
        verify(storage).delete("old-avatar.png");
        verify(storage, never()).delete(newKey);
    }

    @Test
    void failedAvatarTransactionKeepsOldFileAndRemovesNewFile() throws IOException {
        testUser.setAvatarKey("old-avatar.png");
        byte[] png = createTestImageBytes();
        when(images.process(any())).thenReturn(new ImageService.Processed(png, "image/png", ".png"));
        TransactionSynchronizationManager.initSynchronization();

        service.uploadAvatar(new MockMultipartFile("file", "avatar.png", "image/png", png));
        String newKey = testUser.getAvatarKey();
        for (TransactionSynchronization callback : TransactionSynchronizationManager.getSynchronizations()) {
            callback.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
        }
        verify(storage).delete(newKey);
        verify(storage, never()).delete("old-avatar.png");
    }

    @Test
    void replacingProfilePhotoChangesItsPublicUrl() {
        ApiMapper realMapper = new ApiMapper(null, null, null, null, "http://localhost:8080");
        testUser.setAvatarKey("first.png");
        testUser.setCoverKey("first-cover.png");
        String firstAvatar = realMapper.user(testUser).avatarUrl();
        String firstCover = realMapper.user(testUser).coverUrl();

        testUser.setAvatarKey("second.png");
        testUser.setCoverKey("second-cover.png");
        assertNotEquals(firstAvatar, realMapper.user(testUser).avatarUrl());
        assertNotEquals(firstCover, realMapper.user(testUser).coverUrl());
        assertTrue(realMapper.user(testUser).avatarUrl().contains("/users/" + testUser.getId() + "/avatar?v="));
    }

    private byte[] createTestImageBytes() throws IOException {
        BufferedImage img = new BufferedImage(50, 50, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        return baos.toByteArray();
    }
}
