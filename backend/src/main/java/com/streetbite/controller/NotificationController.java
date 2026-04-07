package com.streetbite.controller;

import com.streetbite.dto.notification.NotificationMessageResponse;
import com.streetbite.dto.notification.NotificationTestRequest;
import com.streetbite.dto.notification.NotificationTokenDeleteRequest;
import com.streetbite.dto.notification.NotificationTokenRequest;
import com.streetbite.dto.notification.NotificationTokenResponse;
import com.streetbite.dto.notification.NotificationTokensResponse;
import com.streetbite.model.User;
import com.streetbite.model.UserDevice;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.NotificationService;
import com.streetbite.service.UserDeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final UserDeviceService userDeviceService;
    private final NotificationService notificationService;
    private final AuthenticatedUserService authenticatedUserService;

    public NotificationController(
            UserDeviceService userDeviceService,
            NotificationService notificationService,
            AuthenticatedUserService authenticatedUserService) {
        this.userDeviceService = userDeviceService;
        this.notificationService = notificationService;
        this.authenticatedUserService = authenticatedUserService;
    }

    /**
     * Save FCM token for a user
     */
    @PostMapping("/token")
    public ResponseEntity<?> saveToken(@RequestBody NotificationTokenRequest request, Authentication authentication) {
        try {
            User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
            }

            String fcmToken = request.getFcmToken();
            String deviceType = request.getDeviceType() == null || request.getDeviceType().isBlank()
                    ? "web"
                    : request.getDeviceType();

            UserDevice device = userDeviceService.saveToken(user.getId(), fcmToken, deviceType);
            return ResponseEntity.ok(new NotificationTokenResponse("Token saved successfully", device.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
        return ResponseEntity.ok(new NotificationTokensResponse(tokens));
    }

    /**
     * Delete a specific token
     */
    @DeleteMapping("/token")
    public ResponseEntity<?> deleteToken(@RequestBody NotificationTokenDeleteRequest request, Authentication authentication) {
        try {
            User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
            }

            String fcmToken = request.getFcmToken();
            userDeviceService.deleteToken(fcmToken);
            return ResponseEntity.ok(new NotificationMessageResponse("Token deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to delete token: " + e.getMessage()));
        }
    }

    /**
     * Send test notification (for testing purposes)
     */
    @PostMapping("/test")
    public ResponseEntity<?> sendTestNotification(@RequestBody NotificationTestRequest request, Authentication authentication) {
        try {
            User user = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
            }

            String fcmToken = request.getFcmToken();
            if (fcmToken == null || fcmToken.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "FCM token is required"));
            }
            String title = request.getTitle() == null || request.getTitle().isBlank()
                    ? "Test Notification"
                    : request.getTitle();
            String body = request.getBody() == null || request.getBody().isBlank()
                    ? "This is a test notification from StreetBite!"
                    : request.getBody();

            notificationService.sendToToken(fcmToken, title, body, null);
            return ResponseEntity.ok(new NotificationMessageResponse("Test notification sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to send notification: " + e.getMessage()));
        }
    }
}
