package com.cubeit.erp_agence.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Appliquer à toutes les routes API
                // Autoriser les origines du Frontend (ajoutez l'IP de votre pote si besoin)
                .allowedOrigins("http://localhost:4200", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Méthodes autorisées
                .allowedHeaders("*") // Tous les headers (Authorization, Content-Type...)
                .allowCredentials(true); // Autoriser les cookies/auth headers
    }
}