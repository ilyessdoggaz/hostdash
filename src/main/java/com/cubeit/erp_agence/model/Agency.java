package com.cubeit.erp_agence.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "agencies")
public class Agency {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    @Indexed
    private String phoneNumber;

    @Indexed
    private String adminCin;

    @Indexed
    private String name;

    @Indexed(unique = true)
    private String rne;

    @Indexed
    private String taxId;

    // Champs pour la validation OTP par session
    private String otpCode;
    private LocalDateTime otpExpiration;

    @Indexed // Indexé pour retrouver rapidement l'agence durant la vérification
    private String verificationSessionId;

    @Indexed
    private String status = "PENDING_VERIFICATION";

    private String role = "ROLE_AGENCE";
}