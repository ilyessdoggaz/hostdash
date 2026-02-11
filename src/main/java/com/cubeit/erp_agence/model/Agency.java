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

    // --- Admin Info ---
    @Indexed(unique = true)
    private String email;          // Email pro [cite: 29]
    private String password;
    private String phoneNumber;    // [cite: 30]
    private String adminCin;       // [cite: 28]

    // --- Agence Info (Juridique) ---
    private String name;
    @Indexed(unique = true)
    private String rne;            // [cite: 24]
    private String taxId;          // Patente [cite: 25]

    // --- Statut & Sécurité ---
    private String otpCode;
    private LocalDateTime otpExpiration;

    // PENDING_VERIFICATION (Email non validé) -> PENDING_APPROVAL (Attente admin) -> ACTIVE
    private String status = "PENDING_VERIFICATION";
    private String role = "ROLE_AGENCE";
}