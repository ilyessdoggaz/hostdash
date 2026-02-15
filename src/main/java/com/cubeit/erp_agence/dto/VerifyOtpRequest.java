package com.cubeit.erp_agence.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank
    @Schema(
            description = "L'identifiant unique de session reçu en réponse de l'endpoint /register",
            example = "550e8400-e29b-41d4-a716-446655440000"
    )
    private String sessionId;

    @NotBlank
    @Schema(
            description = "Le code à 6 chiffres reçu par email via Mailtrap",
            example = "123456"
    )
    private String code;
}