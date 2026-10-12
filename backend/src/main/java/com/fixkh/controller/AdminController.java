package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.service.AdminService;
import com.fixkh.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/admin") @Tag(name = "Admin") @SecurityRequirement(name = "bearerAuth")
public class AdminController {
    private final AdminService admin;
    private final ReportService reports;
    public AdminController(AdminService admin, ReportService reports) { this.admin = admin; this.reports = reports; }
    @GetMapping("/reports") @Operation(summary = "Browse reports for moderation")
    public ResponseEntity<List<ReportResponse>> list(@RequestParam(required = false) String category,
            @RequestParam(required = false) String status, @RequestParam(required = false) String province,
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ReportController.page(reports.list(ReportController.category(category), ReportController.status(status), province, search, sortBy, page, size));
    }
    @PatchMapping("/reports/{id}/status") @Operation(summary = "Update moderation status")
    public ReportResponse status(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) { return admin.status(id, request); }
    @GetMapping("/stats") @Operation(summary = "Get platform statistics")
    public AdminStats stats() { return admin.stats(); }
}
