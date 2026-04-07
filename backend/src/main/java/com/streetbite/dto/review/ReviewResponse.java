package com.streetbite.dto.review;

import com.streetbite.model.Review;

import java.time.LocalDateTime;
import java.util.List;

public class ReviewResponse {
    private Long id;
    private Long vendorId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private ReviewUserResponse user;
    private List<ReviewImageResponse> images;

    public static ReviewResponse from(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setVendorId(review.getVendor() != null ? review.getVendor().getId() : null);
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        response.setUser(review.getUser() != null ? ReviewUserResponse.from(review.getUser()) : null);
        response.setImages(review.getImages() == null
                ? List.of()
                : review.getImages().stream().map(ReviewImageResponse::from).toList());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ReviewUserResponse getUser() {
        return user;
    }

    public void setUser(ReviewUserResponse user) {
        this.user = user;
    }

    public List<ReviewImageResponse> getImages() {
        return images;
    }

    public void setImages(List<ReviewImageResponse> images) {
        this.images = images;
    }
}
