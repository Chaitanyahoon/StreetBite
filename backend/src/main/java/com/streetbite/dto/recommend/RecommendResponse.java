package com.streetbite.dto.recommend;

import java.math.BigDecimal;
import java.util.List;

public class RecommendResponse {

    private Long vendorId;
    private String vendorName;
    private String vendorSlug;
    private String cuisine;
    private Double rating;
    private Integer reviewCount;
    private String displayImageUrl;
    private String address;
    private String matchReason;
    private int matchScore;
    private List<RecommendedDish> topDishes;

    public static class RecommendedDish {
        private String name;
        private BigDecimal price;
        private String category;

        public RecommendedDish(String name, BigDecimal price, String category) {
            this.name = name;
            this.price = price;
            this.category = category;
        }

        public String getName() { return name; }
        public BigDecimal getPrice() { return price; }
        public String getCategory() { return category; }
    }

    // Getters and Setters
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorSlug() { return vendorSlug; }
    public void setVendorSlug(String vendorSlug) { this.vendorSlug = vendorSlug; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getDisplayImageUrl() { return displayImageUrl; }
    public void setDisplayImageUrl(String displayImageUrl) { this.displayImageUrl = displayImageUrl; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public List<RecommendedDish> getTopDishes() { return topDishes; }
    public void setTopDishes(List<RecommendedDish> topDishes) { this.topDishes = topDishes; }
}
