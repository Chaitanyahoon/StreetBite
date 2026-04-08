package com.streetbite.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtUtil.class);
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
            if (allowInsecureDefaults) {
                this.secretKey = DEFAULT_DEV_SECRET;
                LOGGER.warn("JWT_SECRET not set. Using local development fallback secret.");
            } else {
                this.secretKey = generateEphemeralSecret();
                LOGGER.error(
                        "JWT_SECRET not configured in production. Using ephemeral startup secret. "
                                + "Set JWT_SECRET in environment to keep sessions stable across restarts.");
            }
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
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            keyBytes = sha256(keyBytes);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String generateEphemeralSecret() {
        byte[] random = new byte[48];
        new SecureRandom().nextBytes(random);
        return Base64.getEncoder().encodeToString(random);
    }

    private byte[] sha256(byte[] source) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(source);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to initialize JWT signing key", e);
        }
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
