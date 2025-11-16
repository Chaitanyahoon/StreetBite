package com.streetbite.controller;

import com.streetbite.model.User;
import com.streetbite.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Authentication endpoints:
 * - POST /api/auth/register - Register new user (creates user profile in Firestore)
 * - POST /api/auth/login - Login (returns user profile, actual auth handled by Firebase client SDK)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final FirestoreService firestoreService;

    public AuthController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            String displayName = (String) payload.get("displayName");
            String phoneNumber = (String) payload.get("phoneNumber");
            String role = (String) payload.getOrDefault("role", "CUSTOMER");
            @SuppressWarnings("unchecked")
            Map<String, Object> location = (Map<String, Object>) payload.get("location");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            // Create user profile in Firestore
            User user = new User();
            user.setEmail(email);
            user.setDisplayName(displayName);
            user.setPhoneNumber(phoneNumber);
            user.setRole(role.toUpperCase());
            user.setLocation(location);
            user.setActive(true);
            user.setCreatedAt(Instant.now().toString());
            user.setUpdatedAt(Instant.now().toString());

            String userId = firestoreService.saveUser(user);
            user.setUserId(userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "userId", userId,
                "user", user
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to register user: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            // Find user by email in Firestore
            User user = firestoreService.getUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            if (!user.isActive()) {
                return ResponseEntity.status(403).body(Map.of("error", "User account is inactive"));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to login: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        try {
            User user = firestoreService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            return ResponseEntity.ok(user);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

