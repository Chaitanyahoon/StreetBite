package com.streetbite.dto.analytics;

import java.math.BigDecimal;
import java.util.List;

public class VendorAnalyticsResponse {

    private Long profileViews;
    private Long directionClicks;
    private Long menuInteractions;
    private Long callClicks;
    private List<AnalyticsEngagementPointResponse> engagementData;
    private List<AnalyticsTopItemResponse> topItems;
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long activeCustomers;
    private Double averageRating;
    private Long totalReviews;

    public Long getProfileViews() {
        return profileViews;
    }

    public void setProfileViews(Long profileViews) {
        this.profileViews = profileViews;
    }

    public Long getDirectionClicks() {
        return directionClicks;
    }

    public void setDirectionClicks(Long directionClicks) {
        this.directionClicks = directionClicks;
    }

    public Long getMenuInteractions() {
        return menuInteractions;
    }

    public void setMenuInteractions(Long menuInteractions) {
        this.menuInteractions = menuInteractions;
    }

    public Long getCallClicks() {
        return callClicks;
    }

    public void setCallClicks(Long callClicks) {
        this.callClicks = callClicks;
    }

    public List<AnalyticsEngagementPointResponse> getEngagementData() {
        return engagementData;
    }

    public void setEngagementData(List<AnalyticsEngagementPointResponse> engagementData) {
        this.engagementData = engagementData;
    }

    public List<AnalyticsTopItemResponse> getTopItems() {
        return topItems;
    }

    public void setTopItems(List<AnalyticsTopItemResponse> topItems) {
        this.topItems = topItems;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getActiveCustomers() {
        return activeCustomers;
    }

    public void setActiveCustomers(Long activeCustomers) {
        this.activeCustomers = activeCustomers;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }
}
