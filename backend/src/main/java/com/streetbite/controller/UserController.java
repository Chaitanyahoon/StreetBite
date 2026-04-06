package com.streetbite.controller;

import com.streetbite.model.User;
import com.streetbite.service.UserService;
import com.streetbite.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id,
            @CookieValue(value = "sb_token", required = false) String jwtToken) {
        // 1. Validate session
        if (jwtToken == null || !jwtToken.contains(".") || jwtToken.split("\\.").length != 3) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }

        String email = jwtUtil.extractEmail(jwtToken);
        String role = jwtUtil.extractRole(jwtToken);

        return userService.getUserById(id)
                .map(user -> {
                    // 2. Ownership or Admin check
                    if (!user.getEmail().equals(email) && !"ADMIN".equalsIgnoreCase(role)) {
                        return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                    }
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userUpdates,
            @CookieValue(value = "sb_token", required = false) String jwtToken) {
        // 1. Validate session
        if (jwtToken == null || !jwtToken.contains(".") || jwtToken.split("\\.").length != 3) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }

        String email = jwtUtil.extractEmail(jwtToken);
        String role = jwtUtil.extractRole(jwtToken);

        return userService.getUserById(id)
                .map(existingUser -> {
                    // 2. Ownership or Admin check
                    if (!existingUser.getEmail().equals(email) && !"ADMIN".equalsIgnoreCase(role)) {
                        return ResponseEntity.status(403).body(Map.of("error", "Permission denied"));
                    }
                    if (userUpdates.getDisplayName() != null)
                        existingUser.setDisplayName(userUpdates.getDisplayName());
                    if (userUpdates.getPhoneNumber() != null)
                        existingUser.setPhoneNumber(userUpdates.getPhoneNumber());
                    if (userUpdates.getProfilePicture() != null)
                        existingUser.setProfilePicture(userUpdates.getProfilePicture());

                    User saved = userService.saveUser(existingUser);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@CookieValue(value = "sb_token", required = false) String jwtToken) {
        // 1. Admin only
        if (jwtToken == null)
            return ResponseEntity.status(401).body(Map.of("error", "Login required"));

        String role = jwtUtil.extractRole(jwtToken);
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access only"));
        }

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> payload,
            @CookieValue(value = "sb_token", required = false) String jwtToken) {

        // 1. Admin only
        if (jwtToken == null)
            return ResponseEntity.status(401).body(Map.of("error", "Login required"));

        String role = jwtUtil.extractRole(jwtToken);
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only admins can change account status"));
        }

        Boolean isActive = payload.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "isActive is required"));
        }

        return userService.getUserById(id)
                .map(user -> {
                    user.setActive(isActive);
                    userService.saveUser(user);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
