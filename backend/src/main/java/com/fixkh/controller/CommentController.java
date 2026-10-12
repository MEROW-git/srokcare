package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1") @Tag(name = "Comments")
public class CommentController {
    private final CommentService service;
    public CommentController(CommentService service) { this.service = service; }
    @GetMapping("/reports/{id}/comments") @Operation(summary = "List visible comments")
    public List<CommentResponse> list(@PathVariable UUID id) { return service.list(id); }
    @PostMapping("/reports/{id}/comments") @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a comment", security = @SecurityRequirement(name = "bearerAuth"))
    public CommentResponse create(@PathVariable UUID id, @Valid @RequestBody CommentRequest request) { return service.create(id, request); }
    @DeleteMapping("/comments/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete my comment or moderate as administrator", security = @SecurityRequirement(name = "bearerAuth"))
    public void delete(@PathVariable UUID id) { service.delete(id); }
}
