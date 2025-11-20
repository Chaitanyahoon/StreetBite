package com.streetbite.controller;

import com.streetbite.model.User;
import com.streetbite.model.Vendor;
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
        System.out.println("Received register request: " + payload);
        try {
            String email = (String) payload.get("email");
            String displayName = (String) payload.get("displayName");
            String phoneNumber = (String) payload.get("phoneNumber");
            String role = (String) payload.getOrDefault("role", "CUSTOMER");
            String businessName = (String) payload.get("businessName");
            
            System.out.println("Parsed fields - Email: " + email + ", Role: " + role);

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

            System.out.println("Saving user to Firestore...");
            String userId = firestoreService.saveUser(user);
            System.out.println("User saved with ID: " + userId);
            
            user.setUserId(userId);

            // If user is a VENDOR, automatically create a Vendor profile
            if ("VENDOR".equalsIgnoreCase(role)) {
                System.out.println("Creating vendor profile...");
                Vendor vendor = new Vendor();
                // Use same ID as User for easy 1:1 mapping
                vendor.setId(userId); 
                vendor.setName(businessName != null && !businessName.isEmpty() ? businessName : displayName + "'s Stall");
                vendor.setCuisine("Street Food"); // Default
                vendor.setDescription("New vendor");
                vendor.setPhone(phoneNumber);
                
                // Set location if available, otherwise default
                boolean locSet = false;
                if (location != null) {
                    Object latObj = location.get("latitude");
                    Object lngObj = location.get("longitude");
                    if (latObj instanceof Number && lngObj instanceof Number) {
                        vendor.setLatitude(((Number) latObj).doubleValue());
                        vendor.setLongitude(((Number) lngObj).doubleValue());
                        locSet = true;
                    }
                }
                
                if (!locSet) {
                    // Default location (Nashik)
                    vendor.setLatitude(19.9975);
                    vendor.setLongitude(73.7898);
                }
                
                System.out.println("Saving vendor to Firestore with ID: " + userId);
                // Use userId as vendorId for 1:1 mapping
                firestoreService.saveVendor(vendor, userId);
                System.out.println("Vendor saved successfully");
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "userId", userId,
                "user", user
            ));
        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage();
            if (msg == null) msg = e.getClass().getName();
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + msg));
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

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> updates) {
        try {
            // Verify user exists
            User user = firestoreService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Update user
            firestoreService.updateUser(userId, updates);
            
            // Return updated user
            User updatedUser = firestoreService.getUserById(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", updatedUser
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }
}

