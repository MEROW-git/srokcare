package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/api/v1") @Tag(name = "Health")
public class HealthController {
    private final JdbcTemplate jdbc;
    public HealthController(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @GetMapping("/health") @Operation(summary = "Check API and database health")
    @ApiResponse(responseCode = "503", description = "Database unavailable; response status is DOWN")
    public ResponseEntity<HealthResponse> health() {
        try { jdbc.queryForObject("SELECT 1", Integer.class); return ResponseEntity.ok(new HealthResponse("UP", "FixKH API", "Backend is running")); }
        catch (Exception e) { return ResponseEntity.status(503).body(new HealthResponse("DOWN", "FixKH API", "Database unavailable")); }
    }
}
