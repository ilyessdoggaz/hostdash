package com.cubeit.erp_agence.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@cubeit-corp.com");
        message.setTo(to);
        message.setSubject("Code de vérification Cube IT");
        message.setText("Votre code de validation est : " + otp);
        mailSender.send(message);
    }
}