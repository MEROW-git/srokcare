package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.ReportCategory;
import com.fixkh.entity.ReportStatus;
import com.fixkh.exception.ApiException;
import com.fixkh.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/reports") @Tag(name = "Reports")
public class ReportController {
    private final ReportService service;
    public ReportController(ReportService service) { this.service = service; }
    @GetMapping @Operation(summary = "Browse public reports", description = "Returns an array. Pagination metadata is in X-Total-Count, X-Page and X-Page-Size headers.")
    public ResponseEntity<List<ReportResponse>> list(@RequestParam(required = false) String category,
            @RequestParam(required = false) String status, @RequestParam(required = false) String province,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return page(service.list(category(category), status(status), province, search, sortBy, page, size));
    }
    @GetMapping("/my") @Operation(summary = "Browse my reports", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<ReportResponse>> mine(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return page(service.mine(page, size));
    }
    @GetMapping("/{id}") @Operation(summary = "Get a report")
    public ReportResponse get(@PathVariable UUID id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Create a report", security = @SecurityRequirement(name = "bearerAuth"))
    public ReportResponse create(@Valid @RequestBody ReportRequest request) { return service.create(request); }
    @PutMapping("/{id}") @Operation(summary = "Update my reported issue", security = @SecurityRequirement(name = "bearerAuth"))
    public ReportResponse update(@PathVariable UUID id, @Valid @RequestBody ReportUpdateRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Delete my reported issue", security = @SecurityRequirement(name = "bearerAuth"))
    public void delete(@PathVariable UUID id) { service.delete(id); }
    public static <T> ResponseEntity<List<T>> page(Page<T> page) {
        return ResponseEntity.ok().header("X-Total-Count", Long.toString(page.getTotalElements()))
                .header("X-Page", Integer.toString(page.getNumber()))
                .header("X-Page-Size", Integer.toString(page.getSize())).body(page.getContent());
    }
    public static ReportCategory category(String value) {
        if (value == null || value.equalsIgnoreCase("ALL")) return null;
        try { return ReportCategory.valueOf(value); }
        catch (IllegalArgumentException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid category"); }
    }
    public static ReportStatus status(String value) {
        if (value == null || value.equalsIgnoreCase("ALL")) return null;
        try { return ReportStatus.valueOf(value); }
        catch (IllegalArgumentException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status"); }
    }
}
