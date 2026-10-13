package com.fixkh.controller;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.service.AuthService;
import com.fixkh.service.MfaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth") @Tag(name = "Authentication")
public class AuthController {
    private final AuthService service;
    private final MfaService mfa;
    public AuthController(AuthService service, MfaService mfa) { this.service = service; this.mfa = mfa; }
    @PostMapping("/register") @ResponseStatus(HttpStatus.ACCEPTED) @Operation(summary = "Email a registration code to a new citizen")
    public RegistrationPendingResponse register(@Valid @RequestBody RegisterRequest request) { return service.register(request); }
    @PostMapping("/verify-registration") @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Verify email and create a citizen account")
    public AuthResponse verifyRegistration(@Valid @RequestBody VerifyRegistrationRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return service.verifyRegistration(request);
    }
    @PostMapping("/login") @Operation(summary = "Log in and receive a JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return service.login(request);
    }
    @GetMapping("/me") @Operation(summary = "Get private account profile", security = @SecurityRequirement(name = "bearerAuth"))
    public UserResponse me() { return service.me(); }
    @GetMapping("/mfa/status") @Operation(summary = "Check authenticator status", security = @SecurityRequirement(name = "bearerAuth"))
    public MfaStatusResponse mfaStatus() { return mfa.status(); }
    @PostMapping("/mfa/setup") @Operation(summary = "Start authenticator setup", security = @SecurityRequirement(name = "bearerAuth"))
    public MfaSetupResponse mfaSetup(@Valid @RequestBody MfaSetupRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return mfa.beginSetup(request);
    }
    @PostMapping("/mfa/confirm") @Operation(summary = "Confirm authenticator and get one-time recovery codes", security = @SecurityRequirement(name = "bearerAuth"))
    public MfaConfirmResponse mfaConfirm(@Valid @RequestBody MfaCodeRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        var confirmed = mfa.confirm(request);
        return new MfaConfirmResponse(service.response(confirmed.user()), confirmed.recoveryCodes());
    }
    @PostMapping("/mfa/verify-login") @Operation(summary = "Finish sign-in with authenticator or recovery code")
    public AuthResponse mfaVerifyLogin(@Valid @RequestBody MfaVerifyRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return service.response(mfa.verifyLogin(request));
    }
    @PostMapping("/mfa/disable") @Operation(summary = "Disable authenticator using password and code", security = @SecurityRequirement(name = "bearerAuth"))
    public AuthResponse mfaDisable(@Valid @RequestBody MfaDisableRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return service.response(mfa.disable(request));
    }
}
