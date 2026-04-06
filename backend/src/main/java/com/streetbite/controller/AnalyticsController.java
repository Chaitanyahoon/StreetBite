package com.streetbite.controller;

import com.streetbite.model.AnalyticsEvent;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AuthenticatedUserService authenticatedUserService;
    private final com.streetbite.repository.UserRepository userRepository;
    private final com.streetbite.repository.VendorRepository vendorRepository;
    private final com.streetbite.repository.ReviewRepository reviewRepository;
    private final com.streetbite.repository.FavoriteRepository favoriteRepository;
    private final AnalyticsService analyticsService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService,
            AuthenticatedUserService authenticatedUserService,
            com.streetbite.repository.UserRepository userRepository,
            com.streetbite.repository.VendorRepository vendorRepository,
            com.streetbite.repository.ReviewRepository reviewRepository,
            com.streetbite.repository.FavoriteRepository favoriteRepository) {
        this.analyticsService = analyticsService;
        this.authenticatedUserService = authenticatedUserService;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
    }

    @PostMapping("/event")
    public ResponseEntity<?> logEvent(@RequestBody AnalyticsEvent event, Authentication authentication) {
        try {
            User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
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
            User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
            }

            Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
            if (vendor == null) {
                return ResponseEntity.notFound().build();
            }

            boolean isAdmin = authenticatedUserService.isAdmin(currentUser);
            boolean isOwner = vendor.getOwner() != null
                    && vendor.getOwner().getEmail().equals(currentUser.getEmail());

            if (!isAdmin && !isOwner) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Map<String, Object> analytics = analyticsService.getVendorAnalytics(vendorId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/platform")
    public ResponseEntity<?> getPlatformAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        try {
            // Main Try-Catch for overall safety

            // 1. Basic Counts
            // Use strict CUSTOMER filter for Total Users to align with Dashboard context
            // (excluding Admins/Vendors)
            long totalUsers = userRepository.countByRole(com.streetbite.model.User.Role.USER);
            long totalVendors = vendorRepository.count();
            long totalReviews = reviewRepository.count();
            long totalFavorites = favoriteRepository.count();

            stats.put("totalUsers", totalUsers);
            stats.put("totalVendors", totalVendors);
            stats.put("totalReviews", totalReviews);
            stats.put("totalFavorites", totalFavorites);

            // 1a. Growth Metrics (Last 7 Days)
            java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
            stats.put("usersGrowth",
                    userRepository.countByRoleAndCreatedAtAfter(com.streetbite.model.User.Role.USER, sevenDaysAgo));
            stats.put("vendorsGrowth", vendorRepository.countByCreatedAtAfter(sevenDaysAgo));
            stats.put("reviewsGrowth", reviewRepository.countByCreatedAtAfter(sevenDaysAgo));
            stats.put("favoritesGrowth", favoriteRepository.countByCreatedAtAfter(sevenDaysAgo));

            // 2. Average Platform Rating
            Double avgRating = 0.0;
            try {
                avgRating = reviewRepository.findAveragePlatformRating();
                if (avgRating == null)
                    avgRating = 0.0;
            } catch (Exception e) {
                logger.error("Error calculating avg rating", e);
            }
            stats.put("avgPlatformRating", avgRating);

            // 3. Most Reviewed Vendors
            try {
                List<Object[]> topReviewedRaw = reviewRepository.findMostReviewedVendors();
                List<Map<String, Object>> topReviewed = topReviewedRaw.stream()
                        .limit(5)
                        .map(obj -> {
                            Map<String, Object> item = new HashMap<>();
                            item.put("name", obj[0]);
                            item.put("reviews", obj[1]);
                            return item;
                        })
                        .collect(Collectors.toList());
                stats.put("mostReviewedVendors", topReviewed);
            } catch (Exception e) {
                logger.error("Error fetching most reviewed vendors", e);
                stats.put("mostReviewedVendors", new ArrayList<>());
            }

            // 4. Engagement Trends (Mocked for Demo purposes based on User Growth)
            // Real implementation would require 'createdAt' on Favorites/Reviews and
            // grouping by date
            // Here we reuse user growth to show activity
            try {
                java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
                List<com.streetbite.model.User> newUsers = userRepository.findByCreatedAtAfter(thirtyDaysAgo);

                Map<String, Long> usersByDate = newUsers.stream()
                        .filter(u -> u.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(
                                u -> u.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE),
                                Collectors.counting()));

                List<Map<String, Object>> engagementTrends = new ArrayList<>();
                java.time.LocalDate today = java.time.LocalDate.now();
                for (int i = 29; i >= 0; i--) {
                    java.time.LocalDate date = today.minusDays(i);
                    String dateKey = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", dateKey);
                    // Mocking engagement as proportional to user growth + some randomness for the
                    // demo
                    long growth = usersByDate.getOrDefault(dateKey, 0L);
                    dayData.put("interactions", growth * 2 + (growth > 0 ? 1 : 0));
                    engagementTrends.add(dayData);
                }
                stats.put("engagementTrends", engagementTrends);
            } catch (Exception e) {
                logger.error("Error calculating engagement trends", e);
                stats.put("engagementTrends", new ArrayList<>());
            }

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
