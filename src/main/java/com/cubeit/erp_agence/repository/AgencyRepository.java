package com.cubeit.erp_agence.repository;

import com.cubeit.erp_agence.model.Agency;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AgencyRepository extends MongoRepository<Agency, String> {

    // Utilisé pour le Login et la vérification d'existence
    Optional<Agency> findByEmail(String email);

    // Utilisé pour éviter les doublons à l'inscription
    boolean existsByEmail(String email);

    // LA LIGNE MANQUANTE : Utilisée pour retrouver l'agence via le token de session OTP
    Optional<Agency> findByVerificationSessionId(String verificationSessionId);
}