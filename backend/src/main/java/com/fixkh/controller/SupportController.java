package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.SupportResponse;
import com.fixkh.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/reports/{id}/support") @Tag(name = "Support") @SecurityRequirement(name = "bearerAuth")
public class SupportController {
    private final SupportService service;
    public SupportController(SupportService service) { this.service = service; }
    @PostMapping @Operation(summary = "Support a report once")
    public SupportResponse add(@PathVariable UUID id) { return service.add(id); }
    @DeleteMapping @Operation(summary = "Remove my support")
    public SupportResponse remove(@PathVariable UUID id) { return service.remove(id); }
}
