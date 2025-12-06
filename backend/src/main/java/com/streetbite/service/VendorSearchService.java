package com.streetbite.service;

import com.streetbite.model.Vendor;
import com.streetbite.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorSearchService {

    @Autowired
    private VendorRepository vendorRepository;

    @Cacheable(value = "vendorSearch", key = "#lat + '_' + #lng + '_' + #radiusMeters", unless = "#result.isEmpty()")
    public List<Vendor> searchNearby(double lat, double lng, double radiusMeters) {

        // Get all active vendors
        List<Vendor> allVendors = vendorRepository.findByIsActiveTrue();

        // Filter by distance using Haversine formula
        return allVendors.stream()
                .filter(v -> {
                    // Filter by status: Only show APPROVED, AVAILABLE, or BUSY
                    com.streetbite.model.VendorStatus status = v.getStatus();
                    return status == com.streetbite.model.VendorStatus.APPROVED ||
                            status == com.streetbite.model.VendorStatus.AVAILABLE ||
                            status == com.streetbite.model.VendorStatus.BUSY;
                })
                .filter(v -> {
                    // Assuming Vendor entity has latitude and longitude fields (primitive double or
                    // Double)
                    // If they are Double objects, check for nulls
                    return v.getLatitude() != null && v.getLongitude() != null;
                })
                .filter(v -> {
                    double distance = distanceMeters(lat, lng, v.getLatitude(), v.getLongitude());
                    return distance <= radiusMeters;
                })
                .sorted((v1, v2) -> {
                    double d1 = distanceMeters(lat, lng, v1.getLatitude(), v1.getLongitude());
                    double d2 = distanceMeters(lat, lng, v2.getLatitude(), v2.getLongitude());
                    return Double.compare(d1, d2);
                })
                .collect(Collectors.toList());
    }

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
