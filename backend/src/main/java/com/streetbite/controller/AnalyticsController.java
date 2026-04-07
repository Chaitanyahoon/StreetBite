package com.streetbite.controller;

import com.streetbite.dto.analytics.AnalyticsEventRequest;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AuthenticatedUserService authenticatedUserService;
    private final com.streetbite.repository.VendorRepository vendorRepository;
    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService,
            AuthenticatedUserService authenticatedUserService,
            com.streetbite.repository.VendorRepository vendorRepository) {
        this.analyticsService = analyticsService;
        this.authenticatedUserService = authenticatedUserService;
        this.vendorRepository = vendorRepository;
    }

    @PostMapping("/event")
    public ResponseEntity<?> logEvent(@RequestBody AnalyticsEventRequest event, Authentication authentication) {
        try {
            User currentUser = resolveAuthenticatedUser(authentication);
            if (currentUser == null) {
                return unauthorized("Login required");
            }

            analyticsService.logEvent(event.getVendorId(), event.getEventType(), currentUser.getId(), event.getItemId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorAnalytics(@PathVariable Long vendorId, Authentication authentication) {
        try {
            User currentUser = resolveAuthenticatedUser(authentication);
            if (currentUser == null) {
                return unauthorized("Login required");
            }

            Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
            if (vendor == null) {
                return ResponseEntity.notFound().build();
            }

            boolean isAdmin = authenticatedUserService.isAdmin(currentUser);
            boolean isOwner = vendor.getOwner() != null
                    && Objects.equals(vendor.getOwner().getId(), currentUser.getId());

            if (!isAdmin && !isOwner) {
                return forbidden("Access denied");
            }

            return ResponseEntity.ok(analyticsService.getVendorAnalytics(vendorId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/platform")
    public ResponseEntity<?> getPlatformAnalytics(Authentication authentication) {
        try {
            User currentUser = resolveAuthenticatedUser(authentication);
            if (currentUser == null) {
                return unauthorized("Login required");
            }
            if (!authenticatedUserService.isAdmin(currentUser)) {
                return forbidden("Admin access only");
            }

            return ResponseEntity.ok(analyticsService.getPlatformAnalytics());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }
}
