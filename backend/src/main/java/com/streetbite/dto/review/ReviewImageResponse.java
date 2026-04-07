package com.streetbite.dto.review;

import com.streetbite.model.ReviewImage;

public class ReviewImageResponse {
    private Long id;
    private String imageUrl;

    public static ReviewImageResponse from(ReviewImage image) {
        ReviewImageResponse response = new ReviewImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
