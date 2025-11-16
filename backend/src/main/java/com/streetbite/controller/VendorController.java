package com.streetbite.controller;

import com.streetbite.model.Vendor;
import com.streetbite.service.FirestoreService;
import com.streetbite.service.GeocodingService;
import com.streetbite.service.VendorSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Vendor REST Controller with cost-optimized geolocation
 * 
 * Cost Optimization Strategy:
 * 1. Vendor Registration: Geocodes address ONCE, stores permanently in Firestore
 * 2. Vendor Search: Uses cached search results (10 min TTL), NO Google API calls
 * 3. Address Updates: Geocodes only if address changed, uses cache
 * 
 * Endpoints:
 * - POST /api/vendors/register - Register vendor (geocodes address once)
 * - GET /api/vendors/search - Search nearby (cached, no API calls)
 * - GET /api/vendors/all - Get all vendors
 * - GET /api/vendors/{vendorId} - Get vendor by ID
 * - PUT /api/vendors/{vendorId} - Update vendor (geocodes only if address changed)
 */
@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final GeocodingService geocodingService;
    private final FirestoreService firestoreService;
    private final VendorSearchService searchService;

    public VendorController(GeocodingService geocodingService, FirestoreService firestoreService, VendorSearchService searchService) {
        this.geocodingService = geocodingService;
        this.firestoreService = firestoreService;
        this.searchService = searchService;
    }

    /**
     * Register a new vendor
     * 
     * Cost optimization:
     * - Geocodes address ONCE (checks cache first)
     * - Stores lat/lng permanently in Firestore
     * - Same address will never be geocoded again
     * 
     * Request body:
     * {
     *   "name": "Vendor Name",
     *   "address": "Street Address, City",
     *   "cuisine": "Indian",
     *   "phone": "+91-1234567890",
     *   "hours": "10:00 AM - 10:00 PM",
     *   "description": "Description"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerVendor(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String address = (String) payload.get("address");
            if (name == null || address == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "name and address required"));
            }

            // Geocode address ONCE (checks cache → Firestore → API if needed)
            // This is the ONLY place we geocode during registration
            GeocodingService.LatLng ll = geocodingService.geocodeAddressOnce(address);

            // Build vendor with geocoded coordinates
            Vendor v = new Vendor();
            v.setName(name);
            v.setAddress(address);
            v.setLatitude(ll.lat);  // Stored permanently
            v.setLongitude(ll.lng); // Stored permanently
            v.setCuisine((String) payload.get("cuisine"));
            v.setPhone((String) payload.get("phone"));
            v.setHours((String) payload.get("hours"));
            v.setDescription((String) payload.get("description"));

            // Save to Firestore (coordinates are permanent)
            String id = firestoreService.saveVendor(v);
            return ResponseEntity.ok(Map.of(
                "ok", true,
                "id", id,
                "location", Map.of("lat", ll.lat, "lng", ll.lng)
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save vendor: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Search for vendors near a location
     * 
     * Cost optimization:
     * - NO Google API calls (uses stored vendor coordinates)
     * - Results cached for 10 minutes
     * - Same search parameters return cached results immediately
     * 
     * Query parameters:
     * - lat: Latitude of search center
     * - lng: Longitude of search center
     * - radius: Search radius in meters (default: 2000)
     * 
     * Example:
     * GET /api/vendors/search?lat=28.6139&lng=77.2090&radius=2000
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "2000") double radius) {
        try {
            // This uses cached search results (10 min TTL)
            // NO Google API calls - uses vendor coordinates from Firestore
            List<Vendor> result = searchService.searchNearby(lat, lng, radius);
            return ResponseEntity.ok(Map.of(
                "vendors", result,
                "count", result.size(),
                "searchParams", Map.of("lat", lat, "lng", lng, "radius", radius)
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllVendors() {
        try {
            List<Vendor> vendors = firestoreService.getAllVendors();
            return ResponseEntity.ok(vendors);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<?> getVendor(@PathVariable String vendorId) {
        try {
            Vendor vendor = firestoreService.getVendorById(vendorId);
            if (vendor == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Vendor not found"));
            }
            return ResponseEntity.ok(vendor);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<?> updateVendor(@PathVariable String vendorId, @RequestBody Map<String, Object> payload) {
        try {
            // If address is provided, geocode it
            if (payload.containsKey("address")) {
                String address = (String) payload.get("address");
                GeocodingService.LatLng ll = geocodingService.geocodeAddressOnce(address);
                payload.put("latitude", ll.lat);
                payload.put("longitude", ll.lng);
            }
            firestoreService.updateVendor(vendorId, payload);
            return ResponseEntity.ok(Map.of("success", true, "message", "Vendor updated successfully"));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update vendor: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }
}
