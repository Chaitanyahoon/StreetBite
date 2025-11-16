package com.streetbite.controller;

import com.streetbite.model.MenuItem;
import com.streetbite.model.Vendor;
import com.streetbite.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Analytics endpoints:
 * - GET /api/analytics/vendor/{vendorId} - Get vendor analytics
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final FirestoreService firestoreService;

    public AnalyticsController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorAnalytics(@PathVariable String vendorId) {
        try {
            Vendor vendor = firestoreService.getVendorById(vendorId);
            if (vendor == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Vendor not found"));
            }

            List<MenuItem> menuItems = firestoreService.getMenuItemsByVendor(vendorId);

            // Calculate analytics
            double totalRevenue = menuItems.stream()
                    .filter(item -> item.getTotalOrders() != null && item.getPrice() != null)
                    .mapToDouble(item -> item.getTotalOrders() * item.getPrice())
                    .sum();

            int totalOrders = menuItems.stream()
                    .filter(item -> item.getTotalOrders() != null)
                    .mapToInt(MenuItem::getTotalOrders)
                    .sum();

            double avgRating = menuItems.stream()
                    .filter(item -> item.getRating() != null && item.getRating() > 0)
                    .mapToDouble(MenuItem::getRating)
                    .average()
                    .orElse(0.0);

            // Top items by orders
            List<Map<String, Object>> topItems = menuItems.stream()
                    .filter(item -> item.getTotalOrders() != null && item.getTotalOrders() > 0)
                    .sorted((a, b) -> Integer.compare(
                            b.getTotalOrders() != null ? b.getTotalOrders() : 0,
                            a.getTotalOrders() != null ? a.getTotalOrders() : 0
                    ))
                    .limit(5)
                    .map(item -> {
                        Map<String, Object> itemData = new HashMap<>();
                        itemData.put("name", item.getName());
                        itemData.put("sales", item.getTotalOrders());
                        itemData.put("revenue", item.getTotalOrders() * (item.getPrice() != null ? item.getPrice() : 0));
                        return itemData;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalRevenue", totalRevenue);
            analytics.put("totalOrders", totalOrders);
            analytics.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            analytics.put("activeCustomers", Math.max(1, totalOrders / 3)); // Estimate
            analytics.put("topItems", topItems);
            analytics.put("menuItemCount", menuItems.size());

            return ResponseEntity.ok(analytics);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

