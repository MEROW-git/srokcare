package com.fixkh.service;

import com.fixkh.dto.ApiDtos.ImageResponse;
import com.fixkh.entity.*;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.ReportImageRepository;
import com.fixkh.repository.ReportRepository;
import com.fixkh.security.CurrentUser;
import com.fixkh.storage.ImageStorage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.*;
import javax.imageio.stream.ImageInputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.List;

import com.fixkh.event.ReportDomainEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.time.Instant;

@Service
public class ImageService {
    private final ReportImageRepository images;
    private final ReportRepository reports;
    private final CurrentUser current;
    private final ImageStorage storage;
    private final ApiMapper mapper;
    private final ApplicationEventPublisher events;
    public ImageService(ReportImageRepository images, ReportRepository reports, CurrentUser current, ImageStorage storage, ApiMapper mapper, ApplicationEventPublisher events) {
        this.images = images; this.reports = reports; this.current = current; this.storage = storage; this.mapper = mapper; this.events = events;
    }
    private Report report(UUID id) { return reports.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found")); }
    private void allowEdit(Report report) {
        User user = current.user();
        if (user.getRole() == Role.ADMIN) return;
        if (!report.getAuthor().getId().equals(user.getId()) || report.getStatus() != ReportStatus.REPORTED)
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the owner can change images on a reported issue");
    }
    @Transactional(readOnly = true)
    public List<ImageResponse> list(UUID reportId) { report(reportId); return images.findByReportIdOrderByCreatedAt(reportId).stream().map(mapper::image).toList(); }
    @Transactional
    public List<ImageResponse> upload(UUID reportId, MultipartFile[] files) {
        Report report = reports.findLockedById(reportId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found"));
        allowEdit(report);
        if (files == null || files.length < 1 || files.length > 5 || images.countByReportId(reportId) + files.length > 5)
            throw new ApiException(HttpStatus.BAD_REQUEST, "A report can have at most five images");
        List<ImageResponse> result = new ArrayList<>();
        for (MultipartFile file : files) {
            Processed processed = process(file);
            String key = UUID.randomUUID() + processed.extension();
            try { storage.save(key, processed.bytes()); }
            catch (IOException e) { throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save image"); }
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCompletion(int status) { if (status != STATUS_COMMITTED) deleteQuietly(key); }
            });
            ReportImage image = new ReportImage(); image.setReport(report); image.setStorageKey(key); image.setContentType(processed.contentType());
            result.add(mapper.image(images.saveAndFlush(image)));
        }
        events.publishEvent(new ReportDomainEvent("REPORT_UPDATED", reportId, Instant.now()));
        return result;
    }
    @Transactional(readOnly = true)
    public ImageData content(UUID reportId, UUID imageId) {
        ReportImage image = image(reportId, imageId);
        try { return new ImageData(storage.read(image.getStorageKey()), image.getContentType()); }
        catch (IOException e) { throw new ApiException(HttpStatus.NOT_FOUND, "Image content not found"); }
    }
    @Transactional
    public void delete(UUID reportId, UUID imageId) {
        Report report = report(reportId); allowEdit(report);
        ReportImage image = image(reportId, imageId); images.delete(image);
        afterCommitDelete(image.getStorageKey());
        events.publishEvent(new ReportDomainEvent("REPORT_UPDATED", reportId, Instant.now()));
    }
    public void removeFilesAfterCommit(UUID reportId) {
        images.findByReportIdOrderByCreatedAt(reportId).forEach(i -> afterCommitDelete(i.getStorageKey()));
    }
    private ReportImage image(UUID reportId, UUID imageId) {
        ReportImage image = images.findById(imageId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));
        if (!image.getReport().getId().equals(reportId)) throw new ApiException(HttpStatus.NOT_FOUND, "Image not found");
        return image;
    }
    private void afterCommitDelete(String key) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { deleteQuietly(key); }
        });
    }
    private void deleteQuietly(String key) { try { storage.delete(key); } catch (IOException ignored) {} }
    public record ImageData(byte[] bytes, String contentType) {}
    private record Processed(byte[] bytes, String contentType, String extension) {}
    private Processed process(MultipartFile file) {
        if (file.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Empty image");
        if (file.getSize() > 5L * 1024 * 1024) throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Each image must be at most 5 MB");
        try {
            byte[] original = file.getBytes();
            boolean jpeg = original.length > 3 && (original[0] & 255) == 255 && (original[1] & 255) == 216 && (original[2] & 255) == 255;
            boolean png = original.length > 8 && (original[0] & 255) == 137 && original[1] == 80 && original[2] == 78 && original[3] == 71;
            if (!jpeg && !png) throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPEG and PNG images are accepted");
            try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(original))) {
                Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
                if (!readers.hasNext()) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid image data");
                ImageReader reader = readers.next();
                try {
                    reader.setInput(input, true, true);
                    int width = reader.getWidth(0), height = reader.getHeight(0);
                    if (width < 1 || height < 1 || (long) width * height > 25_000_000L)
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Image dimensions are too large");
                    BufferedImage decoded = reader.read(0);
                    int type = jpeg ? BufferedImage.TYPE_INT_RGB : BufferedImage.TYPE_INT_ARGB;
                    BufferedImage clean = new BufferedImage(width, height, type);
                    Graphics2D graphics = clean.createGraphics();
                    try { graphics.drawImage(decoded, 0, 0, null); } finally { graphics.dispose(); }
                    ByteArrayOutputStream output = new ByteArrayOutputStream();
                    if (!ImageIO.write(clean, jpeg ? "jpeg" : "png", output)) throw new IOException("No image writer");
                    byte[] cleaned = output.toByteArray();
                    if (cleaned.length > 5L * 1024 * 1024)
                        throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Processed image exceeds 5 MB");
                    return new Processed(cleaned, jpeg ? "image/jpeg" : "image/png", jpeg ? ".jpg" : ".png");
                } finally { reader.dispose(); }
            }
        } catch (ApiException e) { throw e; }
        catch (IOException | RuntimeException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid image data"); }
    }
}
