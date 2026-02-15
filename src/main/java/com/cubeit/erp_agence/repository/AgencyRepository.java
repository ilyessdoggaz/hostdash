package com.cubeit.erp_agence.repository;

import com.cubeit.erp_agence.model.Agency;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyRepository extends MongoRepository<Agency, String> {

    // Pour vérifier si l'email existe déjà lors de l'inscription
    boolean existsByEmail(String email);

    // Pour vérifier si la matricule existe déjà
    boolean existsByMatriculeFiscale(String matriculeFiscale);

    // Utile pour le Login
    Optional<Agency> findByEmail(String email);

    // Utile pour la vérification OTP
    Optional<Agency> findByEmailAndOtpCode(String email, String otpCode);
}