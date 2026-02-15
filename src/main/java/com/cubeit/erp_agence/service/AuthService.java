package com.cubeit.erp_agence.service;

import com.cubeit.erp_agence.model.Agency;
import com.cubeit.erp_agence.repository.AgencyRepository;
import com.cubeit.erp_agence.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AgencyRepository agencyRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    public String register(Agency agency) {
        if (agencyRepository.existsByEmail(agency.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        agency.setPassword(passwordEncoder.encode(agency.getPassword()));

        // Génération OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        agency.setOtpCode(otp);
        agency.setOtpExpiration(LocalDateTime.now().plusMinutes(10));

        // Création de la session de vérification
        String sessionId = UUID.randomUUID().toString();
        agency.setVerificationSessionId(sessionId);

        agencyRepository.save(agency);
        emailService.sendOtp(agency.getEmail(), otp);

        return sessionId;
    }

    public void verifyOtp(String sessionId, String code) {
        Agency agency = agencyRepository.findByVerificationSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session de vérification invalide"));

        if (agency.getOtpExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le code a expiré");
        }
        if (!agency.getOtpCode().equals(code)) {
            throw new RuntimeException("Code incorrect");
        }

        agency.setOtpCode(null);
        agency.setVerificationSessionId(null); // Session terminée
        agency.setStatus("PENDING_DOCS");
        agencyRepository.save(agency);
    }

    public String login(String email, String rawPassword) {
        Agency agency = agencyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Identifiants incorrects"));

        if (!passwordEncoder.matches(rawPassword, agency.getPassword())) {
            throw new RuntimeException("Identifiants incorrects");
        }

        if ("PENDING_VERIFICATION".equals(agency.getStatus())) {
            throw new RuntimeException("Veuillez d'abord vérifier votre email");
        }

        return jwtUtils.generateToken(agency.getEmail(), agency.getRole(), agency.getStatus());
    }
}