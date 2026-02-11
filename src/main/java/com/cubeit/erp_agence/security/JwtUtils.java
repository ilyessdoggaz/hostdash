package com.cubeit.erp_agence.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtils {

    @Value("${cubeit.app.jwtSecret}")
    private String jwtSecret;

    @Value("${cubeit.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String generateToken(String email, String role, String status) {
        return Jwts.builder()
                .setSubject(email)
                .addClaims(Map.of("role", role, "status", status)) // Ajout du statut pour le front
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}