package com.streetbite.controller;

import com.streetbite.model.UserDevice;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.NotificationService;
import com.streetbite.service.UserDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private UserDeviceService userDeviceService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    /**
     * Save FCM token for a user
     */
    @PostMapping("/token")
    public ResponseEntity<?> saveToken(@RequestBody Map<String, Object> payload, Authentication authentication) {
        try {
            User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
            }

            String fcmToken = (String) payload.get("fcmToken");
            String deviceType = (String) payload.getOrDefault("deviceType", "web");

            UserDevice device = userDeviceService.saveToken(user.getId(), fcmToken, deviceType);
            return ResponseEntity.ok(Map.of(
                    "message", "Token saved successfully",
                    "deviceId", device.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to save token: " + e.getMessage()));
        }
    }

    /**
     * Get all tokens for a user
     */
    @GetMapping("/tokens")
    public ResponseEntity<?> getUserTokens(Authentication authentication) {
        User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Login required"));
        }

        List<String> tokens = userDeviceService.getUserTokens(user.getId());
        return ResponseEntity.ok(Map.of("tokens", tokens));
    }

    /**
     * Delete a specific token
     */
    @DeleteMapping("/token")
    public ResponseEntity<?> deleteToken(@RequestBody Map<String, String> payload) {
        try {
            String fcmToken = payload.get("fcmToken");
            userDeviceService.deleteToken(fcmToken);
            return ResponseEntity.ok(Map.of("message", "Token deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to delete token: " + e.getMessage()));
        }
    }

    /**
     * Send test notification (for testing purposes)
     */
    @PostMapping("/test")
    public ResponseEntity<?> sendTestNotification(@RequestBody Map<String, String> payload) {
        try {
            String fcmToken = payload.get("fcmToken");
            String title = payload.getOrDefault("title", "Test Notification");
            String body = payload.getOrDefault("body", "This is a test notification from StreetBite!");

            notificationService.sendToToken(fcmToken, title, body, null);
            return ResponseEntity.ok(Map.of("message", "Test notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to send notification: " + e.getMessage()));
        }
    }
}
