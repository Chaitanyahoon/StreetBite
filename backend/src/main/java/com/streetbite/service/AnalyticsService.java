package com.streetbite.service;

import com.streetbite.model.AnalyticsEvent;
import com.streetbite.repository.AnalyticsRepository;
import com.streetbite.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    // Service for handling analytics data and events

    private final AnalyticsRepository analyticsRepository;
    private final MenuItemRepository menuItemRepository;
    private final com.streetbite.repository.OrderRepository orderRepository;
    private final com.streetbite.repository.ReviewRepository reviewRepository;

    @Autowired
    public AnalyticsService(AnalyticsRepository analyticsRepository, MenuItemRepository menuItemRepository,
            com.streetbite.repository.OrderRepository orderRepository,
            com.streetbite.repository.ReviewRepository reviewRepository) {
        this.analyticsRepository = analyticsRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
    }

    public void logEvent(Long vendorId, String eventType, Long userId, Long itemId) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setVendorId(vendorId);
        event.setEventType(eventType);
        event.setUserId(userId);
        event.setItemId(itemId);
        analyticsRepository.save(event);
    }

    public Map<String, Object> getVendorAnalytics(Long vendorId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // Key Metrics
        long profileViews = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "VIEW_PROFILE", sevenDaysAgo);
        long directionClicks = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "CLICK_DIRECTION",
                sevenDaysAgo);
        long menuInteractions = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "VIEW_MENU", sevenDaysAgo)
                +
                analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "CLICK_MENU_ITEM", sevenDaysAgo);
        long callClicks = analyticsRepository.countEventsByVendorAndTypeSince(vendorId, "CLICK_CALL", sevenDaysAgo);

        // Daily Data for Chart
        List<Map<String, Object>> dailyViews = analyticsRepository.getDailyEventCounts(vendorId, "VIEW_PROFILE",
                sevenDaysAgo);
        List<Map<String, Object>> dailyDirections = analyticsRepository.getDailyEventCounts(vendorId, "CLICK_DIRECTION",
                sevenDaysAgo);
        List<Map<String, Object>> dailyCalls = analyticsRepository.getDailyEventCounts(vendorId, "CLICK_CALL",
                sevenDaysAgo);

        // Merge daily data
        List<Map<String, Object>> engagementData = new ArrayList<>();
        LocalDate current = LocalDate.now().minusDays(6);
        LocalDate end = LocalDate.now();

        while (!current.isAfter(end)) {
            String dateStr = current.toString();
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", current.getDayOfWeek().toString().substring(0, 3)); // Mon, Tue...
            dayData.put("fullDate", dateStr);

            dayData.put("views", getCountForDate(dailyViews, dateStr));
            dayData.put("directions", getCountForDate(dailyDirections, dateStr));
            dayData.put("calls", getCountForDate(dailyCalls, dateStr));

            engagementData.add(dayData);
            current = current.plusDays(1);
        }

        // Top Items
        List<Object[]> topItemsRaw = analyticsRepository.getTopItems(vendorId, sevenDaysAgo);
        List<Map<String, Object>> topItems = topItemsRaw.stream().limit(5).map(row -> {
            Long itemId = (Long) row[0];
            Long count = (Long) row[1];
            String itemName = menuItemRepository.findById(itemId).map(item -> item.getName()).orElse("Unknown Item");

            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("name", itemName);
            itemMap.put("clicks", count);
            // In a real app, we'd track views separately or estimate them
            itemMap.put("views", count * 3); // Mock multiplier for views vs clicks
            return itemMap;
        }).collect(Collectors.toList());

        // Real Data from Orders and Reviews
        java.math.BigDecimal totalRevenue = orderRepository.sumTotalAmountByVendorId(vendorId);
        Long totalOrders = orderRepository.countByVendorId(vendorId);
        Long activeCustomers = orderRepository.countDistinctUserIdByVendorId(vendorId);
        Double averageRating = reviewRepository.findAverageRatingByVendorId(vendorId);
        Long totalReviews = reviewRepository.countByVendorId(vendorId);

        Map<String, Object> result = new HashMap<>();
        result.put("profileViews", profileViews);
        result.put("directionClicks", directionClicks);
        result.put("menuInteractions", menuInteractions);
        result.put("callClicks", callClicks);
        result.put("engagementData", engagementData);
        result.put("topItems", topItems);

        // Add real metrics
        result.put("totalRevenue", totalRevenue != null ? totalRevenue : java.math.BigDecimal.ZERO);
        result.put("totalOrders", totalOrders != null ? totalOrders : 0L);
        result.put("activeCustomers", activeCustomers != null ? activeCustomers : 0L);
        result.put("averageRating", averageRating != null ? averageRating : 0.0);
        result.put("totalReviews", totalReviews != null ? totalReviews : 0L);

        return result;
    }

    private long getCountForDate(List<Map<String, Object>> data, String dateStr) {
        return data.stream()
                .filter(d -> d.get("date").toString().equals(dateStr))
                .map(d -> (Long) d.get("count"))
                .findFirst()
                .orElse(0L);
    }
}
