package com.streetbite.dto.analytics;

import java.util.List;

public class PlatformAnalyticsResponse {

    private Long totalUsers;
    private Long totalVendors;
    private Long totalReviews;
    private Long totalFavorites;
    private Long usersGrowth;
    private Long vendorsGrowth;
    private Long reviewsGrowth;
    private Long favoritesGrowth;
    private Double avgPlatformRating;
    private List<PlatformMostReviewedVendorResponse> mostReviewedVendors;
    private List<PlatformEngagementTrendPointResponse> engagementTrends;
    private List<PlatformEngagementTrendPointResponse> recentActivity;

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(Long totalVendors) {
        this.totalVendors = totalVendors;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Long getTotalFavorites() {
        return totalFavorites;
    }

    public void setTotalFavorites(Long totalFavorites) {
        this.totalFavorites = totalFavorites;
    }

    public Long getUsersGrowth() {
        return usersGrowth;
    }

    public void setUsersGrowth(Long usersGrowth) {
        this.usersGrowth = usersGrowth;
    }

    public Long getVendorsGrowth() {
        return vendorsGrowth;
    }

    public void setVendorsGrowth(Long vendorsGrowth) {
        this.vendorsGrowth = vendorsGrowth;
    }

    public Long getReviewsGrowth() {
        return reviewsGrowth;
    }

    public void setReviewsGrowth(Long reviewsGrowth) {
        this.reviewsGrowth = reviewsGrowth;
    }

    public Long getFavoritesGrowth() {
        return favoritesGrowth;
    }

    public void setFavoritesGrowth(Long favoritesGrowth) {
        this.favoritesGrowth = favoritesGrowth;
    }

    public Double getAvgPlatformRating() {
        return avgPlatformRating;
    }

    public void setAvgPlatformRating(Double avgPlatformRating) {
        this.avgPlatformRating = avgPlatformRating;
    }

    public List<PlatformMostReviewedVendorResponse> getMostReviewedVendors() {
        return mostReviewedVendors;
    }

    public void setMostReviewedVendors(List<PlatformMostReviewedVendorResponse> mostReviewedVendors) {
        this.mostReviewedVendors = mostReviewedVendors;
    }

    public List<PlatformEngagementTrendPointResponse> getEngagementTrends() {
        return engagementTrends;
    }

    public void setEngagementTrends(List<PlatformEngagementTrendPointResponse> engagementTrends) {
        this.engagementTrends = engagementTrends;
    }

    public List<PlatformEngagementTrendPointResponse> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<PlatformEngagementTrendPointResponse> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
