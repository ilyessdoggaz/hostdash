package com.cubeit.erp_agence.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${cubeit.app.jwtSecret}")
    private String jwtSecret;

    @Value("${cubeit.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // 1. Générer le token (Login)
    public String generateToken(String email, String role, String status) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("status", status)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Obtenir la clé de chiffrement
    private Key key() {
        // On utilise getBytes en UTF-8 pour accepter n'importe quelle chaîne de caractères comme secret
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // 3. Extraire l'email du token (Utilisé par le filtre)
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // 4. Valider le token (La méthode qui vous manquait !)
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT invalide: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("La chaîne claims JWT est vide: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.error("Signature JWT invalide: {}", e.getMessage());
        }

        return false;
    }
}