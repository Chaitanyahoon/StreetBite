package com.streetbite.controller;

import com.streetbite.config.CookieSettings;
import com.streetbite.dto.auth.AuthSuccessResponse;
import com.streetbite.dto.auth.AuthUserResponse;
import com.streetbite.dto.auth.EmailRequest;
import com.streetbite.dto.auth.LoginRequest;
import com.streetbite.dto.auth.RegisterRequest;
import com.streetbite.dto.auth.ResetPasswordRequest;
import com.streetbite.dto.auth.VerifyEmailRequest;
import com.streetbite.model.User;
import com.streetbite.service.AuthService;
import com.streetbite.service.AuthRateLimitService;
import com.streetbite.service.UserService;
import com.streetbite.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final String COOKIE_NAME = "sb_token";
    private static final int COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours
    private final UserService userService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final CookieSettings cookieSettings;
    private final AuthRateLimitService authRateLimitService;

    private static final Duration LOGIN_WINDOW = Duration.ofMinutes(10);
    private static final Duration LOGIN_BLOCK = Duration.ofMinutes(15);
    private static final Duration VERIFY_WINDOW = Duration.ofMinutes(10);
    private static final Duration VERIFY_BLOCK = Duration.ofMinutes(10);
    private static final Duration RESET_WINDOW = Duration.ofMinutes(15);
    private static final Duration RESET_BLOCK = Duration.ofMinutes(15);
    private static final Duration REGISTER_WINDOW = Duration.ofMinutes(15);
    private static final Duration REGISTER_BLOCK = Duration.ofMinutes(20);
    private static final Duration RESEND_COOLDOWN = Duration.ofMinutes(2);
    private static final Duration FORGOT_PASSWORD_COOLDOWN = Duration.ofMinutes(2);

    public AuthController(
            UserService userService,
            AuthService authService,
            JwtUtil jwtUtil,
            CookieSettings cookieSettings,
            AuthRateLimitService authRateLimitService) {
        this.userService = userService;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.cookieSettings = cookieSettings;
        this.authRateLimitService = authRateLimitService;
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

    private String extractClientAddress(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private ResponseEntity<Map<String, String>> tooManyRequests(String message) {
        return ResponseEntity.status(429).body(Map.of("error", message));
    }

    private Optional<ResponseEntity<Map<String, String>>> checkRateLimit(
            String bucket,
            String identifier) {
        return authRateLimitService.check(bucket, identifier).map(this::tooManyRequests);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest payload, HttpServletRequest request) {
        try {
            String email = authService.normalizeEmail(payload.getEmail());
            String password = payload.getPassword();

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            String identifier = extractClientAddress(request) + "::" + email;
            Optional<ResponseEntity<Map<String, String>>> registerLimit = checkRateLimit("register", identifier);
            if (registerLimit.isPresent()) {
                return registerLimit.get();
            }

            User savedUser;
            try {
                savedUser = authService.registerOrRefreshPendingUser(payload);
            } catch (IllegalStateException exception) {
                if ("USER_ALREADY_EXISTS".equals(exception.getMessage())) {
                    return ResponseEntity.status(409).body(Map.of("error", "User already exists"));
                }
                throw exception;
            }

            boolean emailSent = authService.prepareAndSendEmailVerification(savedUser);
            if (!emailSent) {
                authRateLimitService.recordFailure("register", identifier, 3, REGISTER_WINDOW, REGISTER_BLOCK);
                return ResponseEntity.status(503).body(Map.of(
                        "error", "Email verification is unavailable right now: " + authService.getLastEmailErrorMessage()));
            }

            authRateLimitService.reset("register", identifier);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "requiresEmailVerification", true,
                    "email", savedUser.getEmail(),
                    "message", "Verification code sent"));
        } catch (Exception e) {
            logger.error("Error during user registration", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest payload,
            HttpServletResponse response,
            HttpServletRequest request) {
        try {
            String email = authService.normalizeEmail(payload.getEmail());
            String password = payload.getPassword();

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            String identifier = extractClientAddress(request) + "::" + email;
            Optional<ResponseEntity<Map<String, String>>> loginLimit = checkRateLimit("login", identifier);
            if (loginLimit.isPresent()) {
                return loginLimit.get();
            }

            Optional<User> userOpt = authService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                authRateLimitService.recordFailure("login", identifier, 5, LOGIN_WINDOW, LOGIN_BLOCK);
                return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
            }

            User user = userOpt.get();

            // Verify password with BCrypt
            if (!authService.passwordMatches(user, password)) {
                authRateLimitService.recordFailure("login", identifier, 5, LOGIN_WINDOW, LOGIN_BLOCK);
                return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
            }

            if (!user.getActive()) {
                return ResponseEntity.status(403).body(Map.of("error", "Account is banned or inactive"));
            }

            if (!user.getEmailVerified()) {
                if (authService.isVerificationExpired(user)) {
                    boolean emailSent = authService.prepareAndSendEmailVerification(user);
                    if (!emailSent) {
                        authRateLimitService.recordFailure("login", identifier, 5, LOGIN_WINDOW, LOGIN_BLOCK);
                        return ResponseEntity.status(503).body(Map.of(
                                "error", "Email verification is unavailable right now: " + authService.getLastEmailErrorMessage()));
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
            authRateLimitService.reset("login", identifier);

            AuthUserResponse userData = authService.buildUserData(user);

            // Token is issued via HttpOnly cookie.
            return ResponseEntity.ok(new AuthSuccessResponse(true, userData));
        } catch (Exception e) {
            logger.error("Error during user login", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestBody VerifyEmailRequest payload,
            HttpServletResponse response,
            HttpServletRequest request) {
        try {
            String email = authService.normalizeEmail(payload.getEmail());
            String code = payload.getCode() != null ? payload.getCode().trim() : null;

            if (email == null || email.isBlank() || code == null || code.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and code are required"));
            }

            String identifier = extractClientAddress(request) + "::" + email;
            Optional<ResponseEntity<Map<String, String>>> verifyLimit = checkRateLimit("verify-email", identifier);
            if (verifyLimit.isPresent()) {
                return verifyLimit.get();
            }

            Optional<User> userOpt = authService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                authRateLimitService.recordFailure("verify-email", identifier, 5, VERIFY_WINDOW, VERIFY_BLOCK);
                return ResponseEntity.status(401).body(Map.of("error", "Invalid verification request"));
            }

            User user = userOpt.get();
            if (!user.getActive()) {
                return ResponseEntity.status(403).body(Map.of("error", "Account is banned or inactive"));
            }

            if (authService.isVerificationExpired(user)) {
                authService.clearEmailVerification(user);
                userService.saveUser(user);
                authRateLimitService.recordFailure("verify-email", identifier, 5, VERIFY_WINDOW, VERIFY_BLOCK);
                return ResponseEntity.status(401).body(Map.of("error", "Verification code expired"));
            }

            if (!authService.matchesVerificationCode(user, code)) {
                authRateLimitService.recordFailure("verify-email", identifier, 5, VERIFY_WINDOW, VERIFY_BLOCK);
                return ResponseEntity.status(401).body(Map.of("error", "Invalid verification code"));
            }

            user = authService.markEmailVerified(user);

            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
            setTokenCookie(response, token);
            authRateLimitService.reset("verify-email", identifier);

            AuthUserResponse userData = authService.buildUserData(user);
            return ResponseEntity.ok(new AuthSuccessResponse(true, userData));
        } catch (Exception e) {
            logger.error("Error during email verification", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody EmailRequest payload, HttpServletRequest request) {
        try {
            String email = authService.normalizeEmail(payload.getEmail());
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            String identifier = extractClientAddress(request) + "::" + email;
            Optional<ResponseEntity<Map<String, String>>> resendLimit = checkRateLimit("resend-verification", identifier);
            if (resendLimit.isPresent()) {
                return resendLimit.get();
            }

            Optional<User> userOpt = authService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                authRateLimitService.throttle("resend-verification", identifier, RESEND_COOLDOWN);
                return ResponseEntity.ok(Map.of("success", true, "message", "If the account exists, a code was sent."));
            }

            User user = userOpt.get();
            if (user.getEmailVerified()) {
                authRateLimitService.throttle("resend-verification", identifier, RESEND_COOLDOWN);
                return ResponseEntity.ok(Map.of("success", true, "message", "Email is already verified."));
            }

            boolean emailSent = authService.prepareAndSendEmailVerification(user);
            if (!emailSent) {
                authRateLimitService.recordFailure("resend-verification", identifier, 3, VERIFY_WINDOW, VERIFY_BLOCK);
                return ResponseEntity.status(503).body(Map.of(
                        "error", "Email verification is unavailable right now: " + authService.getLastEmailErrorMessage()));
            }

            authRateLimitService.throttle("resend-verification", identifier, RESEND_COOLDOWN);

            return ResponseEntity.ok(Map.of("success", true, "message", "Verification code sent."));
        } catch (Exception e) {
            logger.error("Error during resend verification", e);
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

            Optional<User> userOpt = authService.getUserByEmail(email);
            if (userOpt.isEmpty() || !userOpt.get().getActive()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found or inactive"));
            }

            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.status(401).body(Map.of("error", "Token expired"));
            }

            AuthUserResponse userData = authService.buildUserData(userOpt.get());
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
    public ResponseEntity<?> forgotPassword(@RequestBody EmailRequest payload, HttpServletRequest request) {
        String email = authService.normalizeEmail(payload.getEmail());
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        String identifier = extractClientAddress(request) + "::" + email;
        Optional<ResponseEntity<Map<String, String>>> forgotLimit = checkRateLimit("forgot-password", identifier);
        if (forgotLimit.isPresent()) {
            return forgotLimit.get();
        }

        Optional<User> userOpt = authService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            authRateLimitService.throttle("forgot-password", identifier, FORGOT_PASSWORD_COOLDOWN);
            // Don't reveal that user doesn't exist - return same response
            return ResponseEntity.ok(Map.of(
                    "message", "If an account exists, a reset link has been sent."
            ));
        }

        User user = userOpt.get();
        String token = authService.issuePasswordResetToken(user);

        boolean emailSent = authService.sendPasswordResetEmail(email, token);
        if (!emailSent) {
            authRateLimitService.recordFailure("forgot-password", identifier, 3, RESET_WINDOW, RESET_BLOCK);
            return ResponseEntity.status(503).body(Map.of(
                    "error", "Password reset email is unavailable right now: " + authService.getLastEmailErrorMessage()));
        }

        authRateLimitService.throttle("forgot-password", identifier, FORGOT_PASSWORD_COOLDOWN);

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

        Optional<User> userOpt = authService.getUserByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Invalid or already used token"));
        }

        User user = userOpt.get();
        java.time.LocalDateTime expiry = user.getResetPasswordTokenExpiry();
        if (authService.isResetTokenExpired(user)) {
            // Token expired — clear it
            authService.clearExpiredResetToken(user);
            return ResponseEntity.ok(Map.of("valid", false, "error", "Token has expired"));
        }

        long remainingSeconds = java.time.Duration.between(java.time.LocalDateTime.now(), expiry).getSeconds();
        return ResponseEntity.ok(Map.of("valid", true, "remainingSeconds", remainingSeconds));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest payload, HttpServletRequest request) {
        String token = payload.getToken();
        String newPassword = payload.getNewPassword();

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and new password are required"));
        }

        String identifier = extractClientAddress(request) + "::" + token;
        Optional<ResponseEntity<Map<String, String>>> resetLimit = checkRateLimit("reset-password", identifier);
        if (resetLimit.isPresent()) {
            return resetLimit.get();
        }

        Optional<User> userOpt = authService.getUserByResetPasswordToken(token);
        if (userOpt.isEmpty()) {
            authRateLimitService.recordFailure("reset-password", identifier, 5, RESET_WINDOW, RESET_BLOCK);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        User user = userOpt.get();
        if (authService.isResetTokenExpired(user)) {
            authRateLimitService.recordFailure("reset-password", identifier, 5, RESET_WINDOW, RESET_BLOCK);
            return ResponseEntity.badRequest().body(Map.of("error", "Token has expired"));
        }

        authService.resetPassword(user, newPassword);
        authRateLimitService.reset("reset-password", identifier);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
