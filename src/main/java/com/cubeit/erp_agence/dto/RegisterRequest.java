package com.cubeit.erp_agence.dto;

import jakarta.validation.constraints.*;

/**
 * DTO pour la requête d'inscription d'une agence.
 * Aligné avec le formulaire d'inscription du PFE NaviOne.
 */
public record RegisterRequest(

        // --- SECTION : Agency Information ---

        @NotBlank(message = "Le nom de l'agence est obligatoire")
        String agencyName,

        @NotBlank(message = "La ville est obligatoire")
        String city,

        @NotBlank(message = "L'adresse complète est obligatoire")
        String address,

        @NotBlank(message = "Le code postal est obligatoire")
        @Pattern(regexp = "^\\d{4}$", message = "Le code postal doit contenir exactement 4 chiffres")
        String zipCode,

        @NotBlank(message = "La matricule fiscale est obligatoire")
        @Pattern(regexp = "^[0-9]{7}[A-Z][0-9]{3}$", message = "Format invalide (ex: 1234567A001)")
        String matriculeFiscale,

        // --- SECTION : Manager Information ---

        @NotBlank(message = "Le prénom du manager est obligatoire")
        String firstName,

        @NotBlank(message = "Le nom du manager est obligatoire")
        String lastName,

        @NotBlank(message = "Le CIN ou Passeport est obligatoire")
        String cinPassport,

        @NotBlank(message = "Le numéro de téléphone est obligatoire")
        @Pattern(regexp = "^\\d{8}$", message = "Le téléphone doit contenir exactement 8 chiffres")
        String phone,

        @Email(message = "Format d'email invalide")
        @NotBlank(message = "L'email est obligatoire")
        String email,

        // --- SECTION : Security ---

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre"
        )
        String password,

        @NotBlank(message = "La confirmation du mot de passe est obligatoire")
        String confirmPassword
) {
    /**
     * Méthode utilitaire pour vérifier si les mots de passe correspondent.
     * Peut être appelée dans le service avant le traitement.
     */
    public boolean passwordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
}