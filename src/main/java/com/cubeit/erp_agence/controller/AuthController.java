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
@Tag(name = "1. Authentification Agence", description = "Endpoints pour l'inscription, l'OTP et le Login JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Inscription initiale", description = "Crée le compte et envoie l'OTP via Mailtrap.")
    public ResponseEntity<?> register(@RequestBody Agency agency) {
        authService.register(agency);
        return ResponseEntity.ok("Agence créée. Vérifiez Mailtrap pour l'OTP.");
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Vérification Email", description = "Valide le code OTP.")
    public ResponseEntity<?> verify(@RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request.getEmail(), request.getCode());
        return ResponseEntity.ok("Email vérifié.");
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion JWT", description = "Retourne un token Bearer si vérifié.")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }
}