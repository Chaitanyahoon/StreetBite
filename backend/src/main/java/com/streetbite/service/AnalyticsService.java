package com.streetbite.service;

import com.streetbite.dto.analytics.AnalyticsEngagementPointResponse;
import com.streetbite.dto.analytics.AnalyticsTopItemResponse;
import com.streetbite.dto.analytics.PlatformAnalyticsResponse;
import com.streetbite.dto.analytics.PlatformEngagementTrendPointResponse;
import com.streetbite.dto.analytics.PlatformMostReviewedVendorResponse;
import com.streetbite.dto.analytics.VendorAnalyticsResponse;
import com.streetbite.model.AnalyticsEvent;
import com.streetbite.repository.AnalyticsRepository;
import com.streetbite.repository.MenuItemRepository;
import com.streetbite.repository.UserRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final MenuItemRepository menuItemRepository;
    private final com.streetbite.repository.ReviewRepository reviewRepository;
    private final com.streetbite.repository.FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public AnalyticsService(
            AnalyticsRepository analyticsRepository,
            MenuItemRepository menuItemRepository,
            com.streetbite.repository.ReviewRepository reviewRepository,
            com.streetbite.repository.FavoriteRepository favoriteRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository) {
        this.analyticsRepository = analyticsRepository;
        this.menuItemRepository = menuItemRepository;
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    public void logEvent(Long vendorId, String eventType, Long userId, Long itemId) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setVendorId(vendorId);
        event.setEventType(eventType);
        event.setUserId(userId);
        event.setItemId(itemId);
        analyticsRepository.save(event);
    }

    public VendorAnalyticsResponse getVendorAnalytics(Long vendorId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        long profileViews = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "VIEW_PROFILE", sevenDaysAgo);
        long directionClicks = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "CLICK_DIRECTION",
                sevenDaysAgo);
        long menuInteractions = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "VIEW_MENU", sevenDaysAgo)
                +
                analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "CLICK_MENU_ITEM", sevenDaysAgo);
        long callClicks = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "CLICK_CALL", sevenDaysAgo);

        List<Map<String, Object>> dailyViews = analyticsRepository.getDailyEventCounts(vendorId, "VIEW_PROFILE",
                sevenDaysAgo);
        List<Map<String, Object>> dailyDirections = analyticsRepository.getDailyEventCounts(vendorId, "CLICK_DIRECTION",
                sevenDaysAgo);
        List<Map<String, Object>> dailyCalls = analyticsRepository.getDailyEventCounts(vendorId, "CLICK_CALL",
                sevenDaysAgo);

        List<AnalyticsEngagementPointResponse> engagementData = new ArrayList<>();
        LocalDate current = LocalDate.now().minusDays(6);
        LocalDate end = LocalDate.now();

        while (!current.isAfter(end)) {
            String dateStr = current.toString();
            AnalyticsEngagementPointResponse dayData = new AnalyticsEngagementPointResponse();
            dayData.setDate(current.getDayOfWeek().toString().substring(0, 3));
            dayData.setFullDate(dateStr);
            dayData.setViews(getCountForDate(dailyViews, dateStr));
            dayData.setDirections(getCountForDate(dailyDirections, dateStr));
            dayData.setCalls(getCountForDate(dailyCalls, dateStr));
            engagementData.add(dayData);
            current = current.plusDays(1);
        }

        List<Object[]> topItemsRaw = analyticsRepository.getTopItems(vendorId, sevenDaysAgo);
        List<AnalyticsTopItemResponse> topItems = topItemsRaw.stream().limit(5).map(row -> {
            Long itemId = (Long) row[0];
            Long count = (Long) row[1];
            String itemName = menuItemRepository.findById(itemId).map(item -> item.getName()).orElse("Unknown Item");
            return new AnalyticsTopItemResponse(itemName, count * 3, count);
        }).collect(Collectors.toList());

        Double averageRating = reviewRepository.findAverageRatingByVendorId(vendorId);
        Long totalReviews = reviewRepository.countByVendorId(vendorId);

        VendorAnalyticsResponse result = new VendorAnalyticsResponse();
        result.setProfileViews(profileViews);
        result.setDirectionClicks(directionClicks);
        result.setMenuInteractions(menuInteractions);
        result.setCallClicks(callClicks);
        result.setEngagementData(engagementData);
        result.setTopItems(topItems);
        result.setTotalRevenue(java.math.BigDecimal.ZERO);
        result.setTotalOrders(0L);
        result.setActiveCustomers(0L);
        result.setAverageRating(averageRating != null ? averageRating : 0.0);
        result.setTotalReviews(totalReviews != null ? totalReviews : 0L);
        return result;
    }

    public PlatformAnalyticsResponse getPlatformAnalytics() {
        PlatformAnalyticsResponse stats = new PlatformAnalyticsResponse();

        long totalUsers = userRepository.countByRole(com.streetbite.model.User.Role.USER);
        long totalVendors = vendorRepository.count();
        long totalReviews = reviewRepository.count();
        long totalFavorites = favoriteRepository.count();

        stats.setTotalUsers(totalUsers);
        stats.setTotalVendors(totalVendors);
        stats.setTotalReviews(totalReviews);
        stats.setTotalFavorites(totalFavorites);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        stats.setUsersGrowth(userRepository.countByRoleAndCreatedAtAfter(com.streetbite.model.User.Role.USER, sevenDaysAgo));
        stats.setVendorsGrowth(vendorRepository.countByCreatedAtAfter(sevenDaysAgo));
        stats.setReviewsGrowth(reviewRepository.countByCreatedAtAfter(sevenDaysAgo));
        stats.setFavoritesGrowth(favoriteRepository.countByCreatedAtAfter(sevenDaysAgo));

        Double avgRating = reviewRepository.findAveragePlatformRating();
        stats.setAvgPlatformRating(avgRating != null ? avgRating : 0.0);

        List<PlatformMostReviewedVendorResponse> topReviewed = reviewRepository.findMostReviewedVendors().stream()
                .limit(5)
                .map(obj -> new PlatformMostReviewedVendorResponse((String) obj[0], (Long) obj[1]))
                .toList();
        stats.setMostReviewedVendors(topReviewed);

        List<com.streetbite.model.User> newUsers = userRepository.findByCreatedAtAfter(LocalDateTime.now().minusDays(30));
        Map<String, Long> usersByDate = newUsers.stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        Collectors.counting()));

        List<PlatformEngagementTrendPointResponse> engagementTrends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateKey = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            long growth = usersByDate.getOrDefault(dateKey, 0L);
            engagementTrends.add(new PlatformEngagementTrendPointResponse(
                    dateKey,
                    growth * 2 + (growth > 0 ? 1 : 0),
                    growth
            ));
        }

        stats.setEngagementTrends(engagementTrends);
        stats.setRecentActivity(engagementTrends);
        return stats;
    }

    private long getCountForDate(List<Map<String, Object>> data, String dateStr) {
        return data.stream()
                .filter(d -> d.get("date").toString().equals(dateStr))
                .map(d -> (Long) d.get("count"))
                .findFirst()
                .orElse(0L);
    }
}
