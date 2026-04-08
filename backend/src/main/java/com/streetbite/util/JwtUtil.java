package com.streetbite.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String DEFAULT_DEV_SECRET =
            "StreetBiteDevSecretKeyForLocalAndTestOnlyMustBe256BitsLong!!";
    private static final long DEFAULT_TOKEN_VALIDITY_MS = 24 * 60 * 60 * 1000L;

    private final String secretKey;
    private final long jwtTokenValidity;

    public JwtUtil(Environment environment) {
        String configuredSecret = environment.getProperty("JWT_SECRET");
        boolean allowInsecureDefaults =
                environment.getProperty("streetbite.allow-insecure-defaults", Boolean.class, false);

        if (configuredSecret == null || configuredSecret.isBlank()) {
            if (!allowInsecureDefaults) {
                throw new IllegalStateException(
                        "JWT_SECRET must be configured when streetbite.allow-insecure-defaults=false");
            }
            this.secretKey = DEFAULT_DEV_SECRET;
        } else {
            this.secretKey = configuredSecret;
        }

        String expirationMs = environment.getProperty("JWT_EXPIRATION_MS");
        this.jwtTokenValidity = resolveTokenValidity(expirationMs);
    }

    private long resolveTokenValidity(String expirationMs) {
        if (expirationMs == null || expirationMs.isBlank()) {
            return DEFAULT_TOKEN_VALIDITY_MS;
        }

        try {
            return Long.parseLong(expirationMs);
        } catch (NumberFormatException ignored) {
            return DEFAULT_TOKEN_VALIDITY_MS;
        }
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, Long userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        return createToken(claims, email);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtTokenValidity))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, String email) {
        String extractedEmail = extractEmail(token);
        return extractedEmail.equals(email) && !isTokenExpired(token);
    }
}
