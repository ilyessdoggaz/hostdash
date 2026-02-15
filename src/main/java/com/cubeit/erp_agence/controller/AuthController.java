package com.cubeit.erp_agence.controller;

import com.cubeit.erp_agence.model.Agency;
import com.cubeit.erp_agence.dto.LoginRequest;
import com.cubeit.erp_agence.dto.VerifyOtpRequest;
import com.cubeit.erp_agence.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/agence")
@RequiredArgsConstructor
@Tag(name = "1. Authentification Agence")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Inscription", description = "Retourne un verificationSessionId à utiliser pour l'OTP.")
    public ResponseEntity<?> register(@RequestBody Agency agency) {
        String sessionId = authService.register(agency);
        return ResponseEntity.ok(Map.of(
                "message", "Agence créée. Vérifiez vos emails.",
                "verificationSessionId", sessionId
        ));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Vérification OTP", description = "Utilise le sessionId reçu lors du register.")
    public ResponseEntity<?> verify(@RequestBody VerifyOtpRequest request) {
        // Note: Assurez-vous que votre DTO VerifyOtpRequest contient 'sessionId' au lieu de 'email'
        authService.verifyOtp(request.getSessionId(), request.getCode());
        return ResponseEntity.ok("Email vérifié avec succès.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }
}