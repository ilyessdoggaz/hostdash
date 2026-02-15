package com.cubeit.erp_agence.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "agencies")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Agency {
    @Id
    private String id;

    // --- Agency Information ---
    @Indexed // Accélère la recherche par nom d'agence
    private String agencyName;

    @Indexed // Crucial pour permettre aux clients de filtrer les agences par ville
    private String city;

    private String address;
    private String zipCode;

    @Indexed(unique = true) // Sécurité métier : empêche les doublons de matricule fiscale
    private String matriculeFiscale;

    // --- Manager Information ---
    private String firstName;
    private String lastName;
    private String cinPassport;
    private String phone;

    @Indexed(unique = true) // Identifiant unique pour le login (Indispensable)
    private String email;

    // --- Security & Status ---
    private String password;
    private boolean isVerified = false;
    private String otpCode;
}