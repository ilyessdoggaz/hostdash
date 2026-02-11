package com.cubeit.erp_agence.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank @Email
    @Schema(example = "contact@cubeit-corp.com")
    private String email;

    @NotBlank
    @Schema(example = "123456")
    private String code;
}