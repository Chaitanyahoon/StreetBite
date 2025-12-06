package com.streetbite.controller;

import com.streetbite.model.Vendor;
import com.streetbite.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:4000" }, allowCredentials = "true")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private com.streetbite.service.VendorSearchService vendorSearchService;

    /**
     * Validates if a string is a valid URL
     * 
     * @param url The URL string to validate
     * @return true if valid, false otherwise
     */
    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        // Allow data URLs for base64 encoded images (no length limit)
        if (url.startsWith("data:image/")) {
            return true;
        }

        // Check length constraint for regular URLs
        if (url.length() > 2048) {
            return false;
        }

        // Validate HTTP/HTTPS URLs
        try {
            java.net.URI uri = new java.net.URI(url);
            String protocol = uri.getScheme();
            return "http".equals(protocol) || "https".equals(protocol);
        } catch (java.net.URISyntaxException e) {
            return false;
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Vendor>> searchVendors(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "2000") double radius) {
        return ResponseEntity.ok(vendorSearchService.searchNearby(lat, lng, radius));
    }

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVendor(@PathVariable Long id) {
        return vendorService.getVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVendor(@RequestBody Vendor vendor) {
        try {
            // Validate image URLs before creating
            if (vendor.getBannerImageUrl() != null && !isValidUrl(vendor.getBannerImageUrl())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid banner image URL"));
            }
            if (vendor.getDisplayImageUrl() != null && !isValidUrl(vendor.getDisplayImageUrl())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid display image URL"));
            }

            Vendor savedVendor = vendorService.saveVendor(vendor);
            return ResponseEntity.ok(savedVendor);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @Autowired
    private com.streetbite.service.RealTimeSyncService realTimeSyncService;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVendor(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return vendorService.getVendorById(id)
                .map(existingVendor -> {
                    if (updates.containsKey("name"))
                        existingVendor.setName((String) updates.get("name"));
                    if (updates.containsKey("description"))
                        existingVendor.setDescription((String) updates.get("description"));
                    if (updates.containsKey("cuisine"))
                        existingVendor.setCuisine((String) updates.get("cuisine"));
                    if (updates.containsKey("phone"))
                        existingVendor.setPhone((String) updates.get("phone"));
                    if (updates.containsKey("address"))
                        existingVendor.setAddress((String) updates.get("address"));
                    if (updates.containsKey("hours"))
                        existingVendor.setHours((String) updates.get("hours"));

                    if (updates.containsKey("status")) {
                        try {
                            String statusStr = (String) updates.get("status");
                            com.streetbite.model.VendorStatus status = com.streetbite.model.VendorStatus
                                    .valueOf(statusStr);
                            existingVendor.setStatus(status);
                            // Sync to Firebase
                            realTimeSyncService.updateVendorStatus(existingVendor.getId(), status);
                        } catch (IllegalArgumentException e) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
                        }
                    }

                    if (updates.containsKey("latitude")) {
                        Double lat = Double.valueOf(updates.get("latitude").toString());
                        if (lat < -90 || lat > 90) {
                            return ResponseEntity.badRequest()
                                    .body(Map.of("error", "Invalid latitude: must be between -90 and 90"));
                        }
                        existingVendor.setLatitude(lat);
                    }
                    if (updates.containsKey("longitude")) {
                        Double lng = Double.valueOf(updates.get("longitude").toString());
                        if (lng < -180 || lng > 180) {
                            return ResponseEntity.badRequest()
                                    .body(Map.of("error", "Invalid longitude: must be between -180 and 180"));
                        }
                        existingVendor.setLongitude(lng);
                    }

                    // Validate and update banner image URL
                    if (updates.containsKey("bannerImageUrl")) {
                        String url = (String) updates.get("bannerImageUrl");
                        if (isValidUrl(url)) {
                            existingVendor.setBannerImageUrl(url);
                        } else {
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid banner image URL"));
                        }
                    }

                    // Validate and update display image URL
                    if (updates.containsKey("displayImageUrl")) {
                        String url = (String) updates.get("displayImageUrl");
                        if (isValidUrl(url)) {
                            existingVendor.setDisplayImageUrl(url);
                        } else {
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid display image URL"));
                        }
                    }

                    Vendor updated = vendorService.saveVendor(existingVendor);

                    // Sync location to Firebase if lat/lng changed
                    if (updates.containsKey("latitude") || updates.containsKey("longitude")) {
                        realTimeSyncService.updateVendorLocation(
                                updated.getId(),
                                updated.getLatitude(),
                                updated.getLongitude(),
                                updated.getAddress());
                    }

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.streetbite.service.UserService userService;

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateVendorStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String statusStr = payload.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            com.streetbite.model.VendorStatus status = com.streetbite.model.VendorStatus.valueOf(statusStr);

            return vendorService.getVendorById(id)
                    .map(vendor -> {
                        vendor.setStatus(status);
                        // If approved, ensure it's active
                        if (status == com.streetbite.model.VendorStatus.APPROVED
                                || status == com.streetbite.model.VendorStatus.AVAILABLE) {
                            vendor.setActive(true);
                            // Also reactivate the owner user if they exist
                            if (vendor.getOwner() != null) {
                                vendor.getOwner().setActive(true);
                                userService.saveUser(vendor.getOwner());
                            }
                        }
                        vendorService.saveVendor(vendor);
                        return ResponseEntity.ok(vendor);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVendor(@PathVariable Long id) {
        try {
            vendorService.deleteVendor(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete vendor"));
        }
    }
}
