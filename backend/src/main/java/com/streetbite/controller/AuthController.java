package com.streetbite.controller;

import com.streetbite.config.CookieSettings;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.service.UserService;
import com.streetbite.service.VendorService;
import com.streetbite.service.EmailService;
import com.streetbite.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String COOKIE_NAME = "sb_token";
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours
    private static final int VERIFICATION_EXPIRY_MINUTES = 10;

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CookieSettings cookieSettings;

    @Autowired
    private EmailService emailService;

    /**
     * Helper: build the user data map (without password hash).
     */
    private Map<String, Object> buildUserData(User user) {
        java.util.Map<String, Object> userData = new java.util.HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("displayName", user.getDisplayName());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("profilePicture", user.getProfilePicture());
        userData.put("role", user.getRole().name());
        userData.put("emailVerified", user.getEmailVerified());

        if (user.getRole() == User.Role.VENDOR) {
            java.util.List<Vendor> vendors = vendorService.getVendorsByOwner(user.getId());
            if (!vendors.isEmpty()) {
                userData.put("vendorId", vendors.get(0).getId());
            }
        }
        return userData;
    }

    /**
     * Helper: set the HttpOnly JWT cookie on the response.
     */
    private void setTokenCookie(HttpServletResponse response, String token) {
        response.setHeader("Set-Cookie", buildCookieHeader(token, COOKIE_MAX_AGE));
    }

    /**
     * Helper: clear the JWT cookie.
     */
    private void clearTokenCookie(HttpServletResponse response) {
        response.setHeader("Set-Cookie", buildCookieHeader("", 0));
    }

    private String buildCookieHeader(String token, int maxAge) {
        StringBuilder header = new StringBuilder()
                .append(COOKIE_NAME)
                .append("=")
                .append(token)
                .append("; Max-Age=")
                .append(maxAge)
                .append("; Path=/; HttpOnly; SameSite=")
                .append(cookieSettings.getSameSite());

        if (cookieSettings.isSecure()) {
            header.append("; Secure");
        }

        return header.toString();
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private String generateSixDigitCode() {
        return String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
    }

    private boolean prepareAndSendEmailVerification(User user) {
        String code = generateSixDigitCode();
        user.setEmailVerificationCodeHash(passwordEncoder.encode(code));
        user.setEmailVerificationCodeExpiry(java.time.LocalDateTime.now().plusMinutes(VERIFICATION_EXPIRY_MINUTES));
        userService.saveUser(user);
        boolean emailSent = emailService.sendVerificationCodeEmail(user.getEmail(), code);
        if (!emailSent) {
            clearEmailVerification(user);
            userService.saveUser(user);
        }
        return emailSent;
    }

    private void clearEmailVerification(User user) {
        user.setEmailVerificationCodeHash(null);
        user.setEmailVerificationCodeExpiry(null);
    }

    private void upsertPendingVendorProfile(User user, Map<String, Object> payload, String displayName, String phoneNumber) {
        if (user.getRole() != User.Role.VENDOR) {
            return;
        }

        java.util.List<Vendor> existingVendors = vendorService.getVendorsByOwner(user.getId());
        Vendor vendor = existingVendors.isEmpty() ? new Vendor() : existingVendors.get(0);
        vendor.setOwner(user);
        vendor.setName((String) payload.getOrDefault("businessName", displayName + "'s Stall"));
        vendor.setPhone(phoneNumber);
        vendor.setDescription(vendor.getDescription() != null ? vendor.getDescription() : "New vendor");
        vendor.setCuisine(vendor.getCuisine() != null ? vendor.getCuisine() : "Street Food");

        @SuppressWarnings("unchecked")
        Map<String, Object> location = (Map<String, Object>) payload.get("location");
        if (location != null) {
            Object lat = location.get("latitude");
            Object lng = location.get("longitude");
            if (lat instanceof Number) {
                vendor.setLatitude(((Number) lat).doubleValue());
            }
            if (lng instanceof Number) {
                vendor.setLongitude(((Number) lng).doubleValue());
            }
        }

        vendorService.saveVendor(vendor);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        try {

            String email = payload.get("email") != null ? payload.get("email").toString().trim().toLowerCase() : null;
            String password = (String) payload.get("password");
            String displayName = (String) payload.get("displayName");
            String phoneNumber = (String) payload.get("phoneNumber");
            String roleStr = (String) payload.getOrDefault("role", "USER");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            Optional<User> existingUserOpt = userService.getUserByEmail(email);
            User savedUser;

            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                if (existingUser.getEmailVerified()) {
                    return ResponseEntity.status(409).body(Map.of("error", "User already exists"));
                }

                existingUser.setPasswordHash(passwordEncoder.encode(password));
                existingUser.setDisplayName(displayName);
                existingUser.setPhoneNumber(phoneNumber);
                existingUser.setRole(User.Role.valueOf(roleStr.toUpperCase()));
                existingUser.setActive(true);
                existingUser.setEmailVerified(false);
                clearEmailVerification(existingUser);
                savedUser = userService.saveUser(existingUser);
                upsertPendingVendorProfile(savedUser, payload, displayName, phoneNumber);
            } else {
                // Hash password with BCrypt
                String passwordHash = passwordEncoder.encode(password);

                User user = new User();
                user.setEmail(email);
                user.setPasswordHash(passwordHash);
                user.setDisplayName(displayName);
                user.setPhoneNumber(phoneNumber);
                user.setRole(User.Role.valueOf(roleStr.toUpperCase()));
                user.setEmailVerified(false);

                savedUser = userService.saveUser(user);
                upsertPendingVendorProfile(savedUser, payload, displayName, phoneNumber);
            }

            boolean emailSent = prepareAndSendEmailVerification(savedUser);
            if (!emailSent) {
                return ResponseEntity.status(503).body(Map.of(
                        "error", "Email verification is unavailable right now: " + emailService.getLastErrorMessage()));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "requiresEmailVerification", true,
                    "email", savedUser.getEmail(),
                    "message", "Verification code sent"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> payload, HttpServletResponse response) {
        try {

            String email = payload.get("email") != null ? payload.get("email").toString().trim().toLowerCase() : null;
            String password = (String) payload.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {

                return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
            }

            User user = userOpt.get();

            // Verify password with BCrypt
            if (!passwordEncoder.matches(password, user.getPasswordHash())) {

                return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
            }

            if (!user.getActive()) {
                return ResponseEntity.status(403).body(Map.of("error", "Account is banned or inactive"));
            }

            if (!user.getEmailVerified()) {
                if (user.getEmailVerificationCodeExpiry() == null
                        || user.getEmailVerificationCodeExpiry().isBefore(java.time.LocalDateTime.now())) {
                    boolean emailSent = prepareAndSendEmailVerification(user);
                    if (!emailSent) {
                        return ResponseEntity.status(503).body(Map.of(
                                "error", "Email verification is unavailable right now: " + emailService.getLastErrorMessage()));
                    }
                }

                return ResponseEntity.status(403).body(Map.of(
                        "error", "Please verify your email before signing in.",
                        "requiresEmailVerification", true,
                        "email", user.getEmail()));
            }

            // Generate JWT token and set as HttpOnly cookie
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
            setTokenCookie(response, token);

            Map<String, Object> userData = buildUserData(user);

            // Token is issued via HttpOnly cookie.
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", userData));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, Object> payload, HttpServletResponse response) {
        try {
            String email = payload.get("email") != null ? payload.get("email").toString().trim().toLowerCase() : null;
            String code = payload.get("code") != null ? payload.get("code").toString().trim() : null;

            if (email == null || email.isBlank() || code == null || code.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and code are required"));
            }

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid verification request"));
            }

            User user = userOpt.get();
            if (!user.getActive()) {
                return ResponseEntity.status(403).body(Map.of("error", "Account is banned or inactive"));
            }

            if (user.getEmailVerificationCodeExpiry() == null
                    || user.getEmailVerificationCodeExpiry().isBefore(java.time.LocalDateTime.now())) {
                clearEmailVerification(user);
                userService.saveUser(user);
                return ResponseEntity.status(401).body(Map.of("error", "Verification code expired"));
            }

            if (user.getEmailVerificationCodeHash() == null
                    || !passwordEncoder.matches(code, user.getEmailVerificationCodeHash())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid verification code"));
            }

            user.setEmailVerified(true);
            clearEmailVerification(user);
            userService.saveUser(user);

            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
            setTokenCookie(response, token);

            Map<String, Object> userData = buildUserData(user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", userData));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, Object> payload) {
        try {
            String email = payload.get("email") != null ? payload.get("email").toString().trim().toLowerCase() : null;
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("success", true, "message", "If the account exists, a code was sent."));
            }

            User user = userOpt.get();
            if (user.getEmailVerified()) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Email is already verified."));
            }

            boolean emailSent = prepareAndSendEmailVerification(user);
            if (!emailSent) {
                return ResponseEntity.status(503).body(Map.of(
                        "error", "Email verification is unavailable right now: " + emailService.getLastErrorMessage()));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Verification code sent."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /auth/me — Returns current user data from the JWT cookie.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String token = extractTokenFromCookie(request);

        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication cookie is missing"));
        }

        try {
            String email = jwtUtil.extractEmail(token);
            if (email == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
            }

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty() || !userOpt.get().getActive()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found or inactive"));
            }

            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.status(401).body(Map.of("error", "Token expired"));
            }

            Map<String, Object> userData = buildUserData(userOpt.get());
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    /**
     * POST /auth/logout — Clears the JWT cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        clearTokenCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal that user doesn't exist - return same response
            return ResponseEntity.ok(Map.of(
                    "message", "If an account exists, a reset link has been sent."
            ));
        }

        User user = userOpt.get();
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userService.saveUser(user);

        boolean emailSent = emailService.sendPasswordResetEmail(email, token);
        if (!emailSent) {
            return ResponseEntity.status(503).body(Map.of(
                    "error", "Password reset email is unavailable right now: " + emailService.getLastErrorMessage()));
        }

        return ResponseEntity.ok(Map.of(
                "message", "If an account exists, a reset link has been sent."));
    }

    /**
     * GET /auth/validate-reset-token — Check if a reset token is still valid.
     * Returns remaining seconds if valid, or error if expired/invalid.
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Token is required"));
        }

        Optional<User> userOpt = userService.getUserByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Invalid or already used token"));
        }

        User user = userOpt.get();
        java.time.LocalDateTime expiry = user.getResetPasswordTokenExpiry();
        if (expiry == null || expiry.isBefore(java.time.LocalDateTime.now())) {
            // Token expired — clear it
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiry(null);
            userService.saveUser(user);
            return ResponseEntity.ok(Map.of("valid", false, "error", "Token has expired"));
        }

        long remainingSeconds = java.time.Duration.between(java.time.LocalDateTime.now(), expiry).getSeconds();
        return ResponseEntity.ok(Map.of("valid", true, "remainingSeconds", remainingSeconds));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
        }

        Optional<User> userOpt = userService.getUserByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        User user = userOpt.get();
        if (user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token has expired"));
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userService.saveUser(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
