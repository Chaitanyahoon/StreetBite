package com.streetbite.dto.analytics;

public class PlatformMostReviewedVendorResponse {

    private String name;
    private Long reviews;

    public PlatformMostReviewedVendorResponse() {
    }

    public PlatformMostReviewedVendorResponse(String name, Long reviews) {
        this.name = name;
        this.reviews = reviews;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getReviews() {
        return reviews;
    }

    public void setReviews(Long reviews) {
        this.reviews = reviews;
    }
}
