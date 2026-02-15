package com.cubeit.erp_agence.service;

import com.cubeit.erp_agence.dto.RegisterRequest;
import com.cubeit.erp_agence.model.Agency;
import com.cubeit.erp_agence.repository.AgencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AgencyRepository agencyRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {
        if (agencyRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Erreur : Cet email est déjà utilisé !");
        }
        if (agencyRepository.existsByMatriculeFiscale(request.matriculeFiscale())) {
            throw new RuntimeException("Erreur : Cette matricule fiscale existe déjà !");
        }

        Agency agency = Agency.builder()
                .agencyName(request.agencyName())
                .city(request.city())
                .address(request.address())
                .zipCode(request.zipCode())
                .matriculeFiscale(request.matriculeFiscale())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .cinPassport(request.cinPassport())
                .phone(request.phone())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .isVerified(false)
                .otpCode(generateOTP())
                .build();

        agencyRepository.save(agency);
        emailService.sendOtpEmail(agency.getEmail(), agency.getOtpCode());
        return "Inscription réussie. Code OTP envoyé.";
    }

    public void verifyOtp(String email, String code) {
        Agency agency = agencyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Agence non trouvée."));

        if (agency.getOtpCode() != null && agency.getOtpCode().equals(code)) {
            agency.setVerified(true);
            agency.setOtpCode(null);
            agencyRepository.save(agency);
        } else {
            throw new RuntimeException("Code OTP invalide.");
        }
    }

    public String login(String email, String password) {
        Agency agency = agencyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Identifiants incorrects."));

        if (!agency.isVerified()) {
            throw new RuntimeException("Compte non vérifié. Veuillez valider votre OTP.");
        }

        if (passwordEncoder.matches(password, agency.getPassword())) {
            return jwtService.generateToken(agency.getEmail());
        } else {
            throw new RuntimeException("Identifiants incorrects.");
        }
    }

    private String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}