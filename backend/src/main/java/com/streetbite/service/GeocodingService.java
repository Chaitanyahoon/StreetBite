package com.streetbite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Geocoding service with multi-layer caching strategy
 * 
 * Caching layers (in order):
 * 1. In-memory cache (Caffeine) - 24 hours TTL
 * 2. Firestore cache (permanent) - Never expires
 * 3. Google Geocoding API (only if not in cache)
 * 
 * Cost optimization:
 * - Same address is NEVER geocoded twice
 * - Results stored permanently in Firestore
 * - In-memory cache for fast access
 */
@Service
public class GeocodingService {

    private final FirestoreService firestoreService;
    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${google.geocoding.api.key:}")
    private String googleApiKey;

    public GeocodingService(FirestoreService firestoreService, RestTemplate restTemplate) {
        this.firestoreService = firestoreService;
        this.rest = restTemplate;
    }

    /**
     * Geocode an address with guaranteed single API call per unique address
     * 
     * Flow:
     * 1. Check in-memory cache (Caffeine) - fastest
     * 2. Check Firestore cache (permanent) - no API call
     * 3. Call Google API ONLY if not found in cache
     * 4. Store result in both caches for future use
     * 
     * @param address The address to geocode
     * @return LatLng coordinates
     * @throws ExecutionException If Firestore operation fails
     * @throws InterruptedException If operation is interrupted
     */
    @Cacheable(value = "geocodingCache", key = "#address.toLowerCase().trim()")
    public LatLng geocodeAddressOnce(String address) throws ExecutionException, InterruptedException {
        // Normalize address for consistent caching
        String normalizedAddress = address.toLowerCase().trim();
        
        // Step 1: Check Firestore cache (permanent storage)
        // This is checked first because it's the source of truth
        Map<String, Object> firestoreCache = firestoreService.findGeocodeForAddress(normalizedAddress);
        if (firestoreCache != null) {
            Object lat = firestoreCache.get("lat");
            Object lng = firestoreCache.get("lng");
            if (lat instanceof Number && lng instanceof Number) {
                double latValue = ((Number) lat).doubleValue();
                double lngValue = ((Number) lng).doubleValue();
                // Return from Firestore cache - NO API call
                return new LatLng(latValue, lngValue);
            }
        }

        // Step 2: Not in cache - call Google Geocoding API ONCE
        if (googleApiKey == null || googleApiKey.isEmpty()) {
            throw new IllegalStateException("Google geocoding API key not configured");
        }

        // Make API call
        String url = "https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={key}";
        ResponseEntity<String> resp = rest.getForEntity(url, String.class, normalizedAddress, googleApiKey);
        
        try {
            JsonNode root = mapper.readTree(resp.getBody());
            JsonNode status = root.get("status");
            
            // Check API response status
            if (status != null && !"OK".equals(status.asText())) {
                throw new RuntimeException("Geocoding API error: " + status.asText() + " for address: " + address);
            }
            
            JsonNode results = root.get("results");
            if (results != null && results.isArray() && results.size() > 0) {
                JsonNode loc = results.get(0).path("geometry").path("location");
                double lat = loc.path("lat").asDouble();
                double lng = loc.path("lng").asDouble();
                
                // Step 3: Store in Firestore cache (permanent) - prevents future API calls
                firestoreService.saveGeocode(normalizedAddress, lat, lng);
                
                // Return result (also cached in-memory by @Cacheable)
                return new LatLng(lat, lng);
            } else {
                throw new RuntimeException("No geocoding result for address: " + address);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse geocoding response for address: " + address, ex);
        }
    }

    /**
     * Data class for latitude/longitude coordinates
     */
    public static class LatLng {
        public final double lat;
        public final double lng;
        
        public LatLng(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
        
        @Override
        public String toString() {
            return String.format("LatLng{lat=%.6f, lng=%.6f}", lat, lng);
        }
    }
}
