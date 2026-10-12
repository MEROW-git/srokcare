package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.ImageResponse;
import com.fixkh.service.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/reports/{id}/images") @Tag(name = "Images")
public class ImageController {
    private final ImageService service;
    public ImageController(ImageService service) { this.service = service; }
    @GetMapping @Operation(summary = "List report images")
    public List<ImageResponse> list(@PathVariable UUID id) { return service.list(id); }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload up to five JPEG or PNG images", security = @SecurityRequirement(name = "bearerAuth"))
    public List<ImageResponse> upload(@PathVariable UUID id, @RequestPart("files") MultipartFile[] files) { return service.upload(id, files); }
    @GetMapping("/{imageId}/content") @Operation(summary = "Get a processed image without original metadata")
    public ResponseEntity<byte[]> content(@PathVariable UUID id, @PathVariable UUID imageId) {
        var data = service.content(id, imageId);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(data.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header("X-Content-Type-Options", "nosniff")
                .body(data.bytes());
    }
    @DeleteMapping("/{imageId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an image", security = @SecurityRequirement(name = "bearerAuth"))
    public void delete(@PathVariable UUID id, @PathVariable UUID imageId) { service.delete(id, imageId); }
}
