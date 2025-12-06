package com.streetbite.controller;

import com.streetbite.model.AnalyticsEvent;
import com.streetbite.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*") // For development
public class AnalyticsController {

    private final com.streetbite.repository.UserRepository userRepository;
    private final com.streetbite.repository.VendorRepository vendorRepository;
    private final com.streetbite.repository.OrderRepository orderRepository;
    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService,
            com.streetbite.repository.UserRepository userRepository,
            com.streetbite.repository.VendorRepository vendorRepository,
            com.streetbite.repository.OrderRepository orderRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/event")
    public ResponseEntity<?> logEvent(@RequestBody AnalyticsEvent event) {
        try {
            analyticsService.logEvent(event.getVendorId(), event.getEventType(), event.getUserId(), event.getItemId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorAnalytics(@PathVariable Long vendorId) {
        try {
            Map<String, Object> analytics = analyticsService.getVendorAnalytics(vendorId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/platform")
    public ResponseEntity<?> getPlatformAnalytics() {
        try {
            long totalUsers = userRepository.count();
            long totalVendors = vendorRepository.count();
            long totalOrders = orderRepository.count();

            // Calculate total revenue (mock calculation based on orders for now, or sum
            // order totals if available)
            // Assuming average order value of ₹150 for estimation if no total field
            double estimatedRevenue = totalOrders * 150.0;

            Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalVendors", totalVendors);
            stats.put("totalOrders", totalOrders);
            stats.put("totalRevenue", estimatedRevenue);

            // Add some mock trend data for charts until we have historical data aggregation
            stats.put("recentActivity", java.util.List.of(
                    Map.of("date", "Mon", "orders", 12, "users", 5),
                    Map.of("date", "Tue", "orders", 19, "users", 8),
                    Map.of("date", "Wed", "orders", 15, "users", 12),
                    Map.of("date", "Thu", "orders", 22, "users", 15),
                    Map.of("date", "Fri", "orders", 30, "users", 20),
                    Map.of("date", "Sat", "orders", 45, "users", 25),
                    Map.of("date", "Sun", "orders", 38, "users", 18)));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
