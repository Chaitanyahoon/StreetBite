package com.streetbite.controller;

import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.service.UserService;
import com.streetbite.service.VendorService;
import com.streetbite.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.streetbite.service.EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        try {

            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            String displayName = (String) payload.get("displayName");
            String phoneNumber = (String) payload.get("phoneNumber");
            String roleStr = (String) payload.getOrDefault("role", "USER");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            if (userService.getUserByEmail(email).isPresent()) {

                return ResponseEntity.status(409).body(Map.of("error", "User already exists"));
            }

            // Hash password with BCrypt
            String passwordHash = passwordEncoder.encode(password);

            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(passwordHash);
            user.setDisplayName(displayName);
            user.setPhoneNumber(phoneNumber);
            user.setRole(User.Role.valueOf(roleStr.toUpperCase()));

            User savedUser = userService.saveUser(user);

            // Create vendor profile if role is VENDOR
            if (user.getRole() == User.Role.VENDOR) {

                Vendor vendor = new Vendor();
                vendor.setOwner(savedUser);
                vendor.setName((String) payload.getOrDefault("businessName", displayName + "'s Stall"));
                vendor.setPhone(phoneNumber);
                vendor.setDescription("New vendor");
                vendor.setCuisine("Street Food");

                // Handle location if present
                @SuppressWarnings("unchecked")
                Map<String, Object> location = (Map<String, Object>) payload.get("location");
                if (location != null) {
                    Object lat = location.get("latitude");
                    Object lng = location.get("longitude");
                    if (lat instanceof Number)
                        vendor.setLatitude(((Number) lat).doubleValue());
                    if (lng instanceof Number)
                        vendor.setLongitude(((Number) lng).doubleValue());
                }

                vendorService.saveVendor(vendor);

            }

            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole().name());

            Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("email", savedUser.getEmail());
            userData.put("displayName", savedUser.getDisplayName());
            userData.put("phoneNumber", savedUser.getPhoneNumber());
            userData.put("profilePicture", savedUser.getProfilePicture());
            userData.put("role", savedUser.getRole().name());

            // If user is a vendor, include the vendorId (we just created it)
            if (savedUser.getRole() == User.Role.VENDOR) {
                // We need to fetch it because we didn't keep the reference to the saved vendor
                // object with ID
                java.util.List<Vendor> vendors = vendorService.getVendorsByOwner(savedUser.getId());
                if (!vendors.isEmpty()) {
                    userData.put("vendorId", vendors.get(0).getId());
                }
            }

            // Return user data without password hash
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "user", userData));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> payload) {
        try {

            String email = (String) payload.get("email");
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

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

            Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("displayName", user.getDisplayName());
            userData.put("phoneNumber", user.getPhoneNumber());
            userData.put("profilePicture", user.getProfilePicture());
            userData.put("role", user.getRole().name());

            // If user is a vendor, fetch and include vendorId
            if (user.getRole() == User.Role.VENDOR) {
                java.util.List<Vendor> vendors = vendorService.getVendorsByOwner(user.getId());
                if (!vendors.isEmpty()) {
                    userData.put("vendorId", vendors.get(0).getId());
                }
            }

            // Return user data without password hash
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "user", userData));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Optional<User> userOpt = userService.getUserByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal that user doesn't exist
            return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
        }

        User user = userOpt.get();
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userService.saveUser(user);

        emailService.sendPasswordResetEmail(email, token);

        return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
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

    @GetMapping("/debug/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
