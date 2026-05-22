package com.streetbite.controller;

import com.streetbite.config.CookieSettings;
import com.streetbite.dto.user.UserResponse;
import com.streetbite.dto.user.UserStatusUpdateRequest;
import com.streetbite.dto.user.UserUpdateRequest;
import com.streetbite.dto.user.UpgradeToVendorRequest;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.AuthService;
import com.streetbite.service.UserService;
import com.streetbite.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthenticatedUserService authenticatedUserService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final CookieSettings cookieSettings;

    public UserController(
            UserService userService,
            AuthenticatedUserService authenticatedUserService,
            AuthService authService,
            JwtUtil jwtUtil,
            CookieSettings cookieSettings) {
        this.userService = userService;
        this.authenticatedUserService = authenticatedUserService;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.cookieSettings = cookieSettings;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session");
        }

        return userService.getUserById(id)
                .map(user -> hasAccessToUser(currentUser, user)
                        ? ResponseEntity.ok(UserResponse.from(user))
                        : forbidden("Access denied"))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}") 
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest userUpdates,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session");
        }

        return userService.getUserById(id)
                .map(existingUser -> {
                    if (!hasAccessToUser(currentUser, existingUser)) {
                        return forbidden("Permission denied");
                    }

                    User saved = userService.updateProfile(existingUser, userUpdates);
                    return ResponseEntity.ok(UserResponse.from(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(UserResponse::from)
                .toList();

        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id,
            @RequestBody UserStatusUpdateRequest request,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Only admins can change account status");
        }

        Boolean isActive = request.getIsActive();
        if (isActive == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "isActive is required"));
        }

        return userService.getUserById(id)
                .map(user -> {
                    User updatedUser = userService.updateActiveStatus(user, isActive);
                    return ResponseEntity.ok(UserResponse.from(updatedUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private boolean hasAccessToUser(User currentUser, User targetUser) {
        return targetUser.getEmail().equals(currentUser.getEmail()) || authenticatedUserService.isAdmin(currentUser);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }

    @PostMapping("/upgrade-to-vendor")
    public ResponseEntity<?> upgradeToVendor(
            @RequestBody UpgradeToVendorRequest request,
            Authentication authentication,
            HttpServletResponse response) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session");
        }

        if (currentUser.getRole() != User.Role.USER) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only Customers can upgrade to Vendor"));
        }

        if (request.getBusinessName() == null || request.getBusinessName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Business Name is required"));
        }

        // Update role
        currentUser.setRole(User.Role.VENDOR);
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            currentUser.setPhoneNumber(request.getPhoneNumber().trim());
        }
        User savedUser = userService.saveUser(currentUser);

        // Create default vendor profile
        authService.createDefaultVendorProfile(savedUser, request.getBusinessName());

        // Regenerate JWT token containing VENDOR role
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole().name());

        // Write the cookie
        StringBuilder header = new StringBuilder()
                .append("sb_token")
                .append("=")
                .append(token)
                .append("; Max-Age=")
                .append(24 * 60 * 60)
                .append("; Path=/; HttpOnly; SameSite=")
                .append(cookieSettings.getSameSite());

        if (cookieSettings.isSecure()) {
            header.append("; Secure");
        }

        response.setHeader("Set-Cookie", header.toString());

        return ResponseEntity.ok(UserResponse.from(savedUser));
    }
}
