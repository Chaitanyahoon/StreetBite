package com.streetbite.controller;

import com.streetbite.dto.vendor.VendorCreateRequest;
import com.streetbite.dto.vendor.VendorResponse;
import com.streetbite.dto.vendor.VendorStatusUpdateRequest;
import com.streetbite.dto.vendor.VendorUpdateRequest;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final AuthenticatedUserService authenticatedUserService;
    private final VendorService vendorService;
    private final com.streetbite.service.VendorSearchService vendorSearchService;

    public VendorController(
            AuthenticatedUserService authenticatedUserService,
            VendorService vendorService,
            com.streetbite.service.VendorSearchService vendorSearchService) {
        this.authenticatedUserService = authenticatedUserService;
        this.vendorService = vendorService;
        this.vendorSearchService = vendorSearchService;
    }

    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        if (url.startsWith("data:image/")) {
            return true;
        }

        if (url.length() > 2048) {
            return false;
        }

        try {
            URI uri = new URI(url);
            String protocol = uri.getScheme();
            return "http".equals(protocol) || "https".equals(protocol);
        } catch (URISyntaxException e) {
            return false;
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<VendorResponse>> searchVendors(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "2000") double radius) {
        return ResponseEntity.ok(vendorSearchService.searchNearby(lat, lng, radius).stream()
                .map(VendorResponse::from)
                .toList());
    }

    @GetMapping
    public ResponseEntity<List<VendorResponse>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getActiveVendors().stream().map(VendorResponse::from).toList());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllVendorsForAdmin(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        return ResponseEntity.ok(vendorService.getAllVendors().stream().map(VendorResponse::from).toList());
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<?> getVendor(@PathVariable String idOrSlug) {
        if (idOrSlug.matches("\\d+")) {
            Long id = Long.parseLong(idOrSlug);
            return vendorService.getVendorById(id)
                    .map(VendorResponse::from)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        return vendorService.getVendorBySlug(idOrSlug)
                .map(VendorResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getVendorBySlug(@PathVariable String slug) {
        return vendorService.getVendorBySlug(slug)
                .map(VendorResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVendor(@RequestBody VendorCreateRequest request, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        try {
            validateCoordinateRange(request.getLatitude(), request.getLongitude());
            validateOptionalImageUrl(request.getBannerImageUrl(), "Invalid banner image URL");
            validateOptionalImageUrl(request.getDisplayImageUrl(), "Invalid display image URL");

            Vendor savedVendor = vendorService.createVendor(request);
            return ResponseEntity.ok(VendorResponse.from(savedVendor));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVendor(
            @PathVariable Long id,
            @RequestBody VendorUpdateRequest updates,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        return vendorService.getVendorById(id)
                .map(existingVendor -> {
                    boolean isOwner = existingVendor.getOwner() != null
                            && Objects.equals(existingVendor.getOwner().getId(), currentUser.getId());
                    boolean isAdmin = authenticatedUserService.isAdmin(currentUser);

                    if (!isOwner && !isAdmin) {
                        return forbidden("You do not have permission to update this vendor");
                    }

                    try {
                        validateCoordinateRange(updates.getLatitude(), updates.getLongitude());
                        validateOptionalImageUrl(updates.getBannerImageUrl(), "Invalid banner image URL");
                        validateOptionalImageUrl(updates.getDisplayImageUrl(), "Invalid display image URL");

                        if (updates.getStatus() != null) {
                            VendorStatus.valueOf(updates.getStatus());
                        }

                        Vendor updated = vendorService.updateVendor(existingVendor, updates);
                        return ResponseEntity.ok(VendorResponse.from(updated));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateVendorStatus(
            @PathVariable Long id,
            @RequestBody VendorStatusUpdateRequest payload,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session");
        }

        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Only admins can perform this action");
        }

        try {
            String statusStr = payload.getStatus();
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            VendorStatus status = VendorStatus.valueOf(statusStr);

            return vendorService.getVendorById(id)
                    .map(vendor -> {
                        vendorService.applyStatusChange(vendor, status);
                        return ResponseEntity.ok(VendorResponse.from(vendorService.saveVendor(vendor)));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVendor(@PathVariable Long id, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        try {
            vendorService.deleteVendor(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete vendor"));
        }
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private void validateOptionalImageUrl(String url, String errorMessage) {
        if (url != null && !isValidUrl(url)) {
            throw new IllegalArgumentException(errorMessage);
        }
    }

    private void validateCoordinateRange(Double latitude, Double longitude) {
        if (latitude != null && (latitude < -90 || latitude > 90)) {
            throw new IllegalArgumentException("Invalid latitude: must be between -90 and 90");
        }
        if (longitude != null && (longitude < -180 || longitude > 180)) {
            throw new IllegalArgumentException("Invalid longitude: must be between -180 and 180");
        }
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }
}
