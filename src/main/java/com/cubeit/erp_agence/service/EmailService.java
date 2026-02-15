package com.cubeit.erp_agence.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * Envoie le code de vérification OTP à l'adresse email de l'agence.
     * @param to L'adresse email de destination.
     * @param otpCode Le code à 6 chiffres généré.
     */
    public void sendOtpEmail(String to, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@navione.com");
        message.setTo(to);
        message.setSubject("Vérification de votre compte NaviOne");
        message.setText("Bienvenue sur NaviOne !\n\n" +
                "Merci de rejoindre notre plateforme de location de voitures.\n" +
                "Voici votre code de vérification : " + otpCode + "\n\n" +
                "Veuillez saisir ce code sur l'application pour activer votre compte.");

        mailSender.send(message);
    }
}