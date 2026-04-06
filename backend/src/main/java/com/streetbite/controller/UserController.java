package com.streetbite.controller;

import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id, Authentication authentication) {
        User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }

        return userService.getUserById(id)
                .map(user -> {
                    if (!user.getEmail().equals(currentUser.getEmail())
                            && !authenticatedUserService.isAdmin(currentUser)) {
                        return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                    }
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userUpdates,
            Authentication authentication) {
        User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }

        return userService.getUserById(id)
                .map(existingUser -> {
                    if (!existingUser.getEmail().equals(currentUser.getEmail())
                            && !authenticatedUserService.isAdmin(currentUser)) {
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
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Login required"));
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access only"));
        }

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> payload,
            Authentication authentication) {
        User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Login required"));
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
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
