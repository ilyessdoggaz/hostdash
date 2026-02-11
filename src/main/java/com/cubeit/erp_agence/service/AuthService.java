package com.cubeit.erp_agence.service;

import com.cubeit.erp_agence.model.Agency;
import com.cubeit.erp_agence.repository.AgencyRepository;
import com.cubeit.erp_agence.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AgencyRepository agencyRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    // 1. Inscription
    public void register(Agency agency) {
        if (agencyRepository.existsByEmail(agency.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Hashage mot de passe & OTP
        agency.setPassword(passwordEncoder.encode(agency.getPassword()));
        String otp = String.format("%06d", new Random().nextInt(999999));
        agency.setOtpCode(otp);
        agency.setOtpExpiration(LocalDateTime.now().plusMinutes(10));
        agency.setStatus("PENDING_VERIFICATION");

        agencyRepository.save(agency);
        emailService.sendOtp(agency.getEmail(), otp);
    }

    // 2. Validation OTP
    public void verifyOtp(String email, String code) {
        Agency agency = agencyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Agence inconnue"));

        if (agency.getOtpExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code expiré");
        }
        if (!agency.getOtpCode().equals(code)) {
            throw new RuntimeException("Code invalide");
        }

        // Passage au statut suivant : En attente des documents
        agency.setOtpCode(null);
        agency.setStatus("PENDING_DOCS"); // [cite: 34]
        agencyRepository.save(agency);
    }

    // 3. Login (Retourne le Token)
    public String login(String email, String rawPassword) {
        Agency agency = agencyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Agence inconnue"));

        if (!passwordEncoder.matches(rawPassword, agency.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // Empêcher le login si l'email n'est pas vérifié
        if ("PENDING_VERIFICATION".equals(agency.getStatus())) {
            throw new RuntimeException("Veuillez vérifier votre email d'abord.");
        }

        return jwtUtils.generateToken(agency.getEmail(), agency.getRole(), agency.getStatus());
    }
}