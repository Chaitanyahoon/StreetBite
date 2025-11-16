package com.streetbite.service;

import com.streetbite.model.Vendor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Vendor search service with caching for cost optimization
 * 
 * Caching strategy:
 * - Search results cached for 10 minutes (configurable 5-10 minutes)
 * - Cache key: lat_lng_radius (e.g., "28.6139_77.2090_2000")
 * - Uses Firestore Geo queries (no Google API calls)
 * - Haversine formula for distance calculation
 * 
 * Cost optimization:
 * - Same search parameters return cached results
 * - No repeated Firestore queries for same location
 * - No Google API calls (uses stored vendor coordinates)
 */
@Service
public class VendorSearchService {

    private final FirestoreService firestoreService;

    public VendorSearchService(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    /**
     * Search for vendors near a location with caching
     * 
     * Caching:
     * - Results cached for 10 minutes
     * - Cache key: "lat_lng_radius" (e.g., "28.6139_77.2090_2000")
     * - Same search parameters return cached results immediately
     * 
     * Important: This method does NOT call Google Geocoding API
     * It uses vendor coordinates already stored in Firestore
     * 
     * @param lat Latitude of search center
     * @param lng Longitude of search center
     * @param radiusMeters Search radius in meters
     * @return List of vendors within radius
     * @throws ExecutionException If Firestore operation fails
     * @throws InterruptedException If operation is interrupted
     */
    @Cacheable(
        value = "vendorSearch",
        key = "#lat + '_' + #lng + '_' + #radiusMeters",
        unless = "#result.isEmpty()" // Don't cache empty results
    )
    public List<Vendor> searchNearby(double lat, double lng, double radiusMeters) 
            throws ExecutionException, InterruptedException {
        
        // Get all vendors from Firestore (vendors already have lat/lng from registration)
        List<Vendor> allVendors = firestoreService.getAllVendors();
        
        // Filter by distance using Haversine formula
        // This is a pure calculation - no API calls
        return allVendors.stream()
                .filter(v -> v.getLatitude() != null && v.getLongitude() != null)
                .filter(v -> {
                    double distance = distanceMeters(lat, lng, v.getLatitude(), v.getLongitude());
                    return distance <= radiusMeters;
                })
                .sorted((v1, v2) -> {
                    // Sort by distance (closest first)
                    double d1 = distanceMeters(lat, lng, v1.getLatitude(), v1.getLongitude());
                    double d2 = distanceMeters(lat, lng, v2.getLatitude(), v2.getLongitude());
                    return Double.compare(d1, d2);
                })
                .collect(Collectors.toList());
    }

    /**
     * Calculate distance between two points using Haversine formula
     * 
     * @param lat1 Latitude of first point
     * @param lng1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lng2 Longitude of second point
     * @return Distance in meters
     */
    private double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371000; // Earth radius in meters
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}
