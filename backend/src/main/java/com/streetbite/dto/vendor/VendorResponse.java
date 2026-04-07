package com.streetbite.dto.vendor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.streetbite.model.Vendor;

import java.time.LocalDateTime;
import java.util.List;

public class VendorResponse {

    private Long id;
    private VendorOwnerResponse owner;
    private String name;
    private String slug;
    private String description;
    private String cuisine;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer reviewCount;
    private Double averageRating;
    private String phone;
    private String hours;
    private String bannerImageUrl;
    private String displayImageUrl;

    @JsonProperty("isActive")
    private Boolean isActive;

    private String status;
    private List<String> galleryImages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VendorResponse from(Vendor vendor) {
        VendorResponse response = new VendorResponse();
        response.setId(vendor.getId());
        response.setOwner(VendorOwnerResponse.from(vendor.getOwner()));
        response.setName(vendor.getName());
        response.setSlug(vendor.getSlug());
        response.setDescription(vendor.getDescription());
        response.setCuisine(vendor.getCuisine());
        response.setAddress(vendor.getAddress());
        response.setLatitude(vendor.getLatitude());
        response.setLongitude(vendor.getLongitude());
        response.setRating(vendor.getRating());
        response.setReviewCount(vendor.getReviewCount());
        response.setAverageRating(vendor.getAverageRating());
        response.setPhone(vendor.getPhone());
        response.setHours(vendor.getHours());
        response.setBannerImageUrl(vendor.getBannerImageUrl());
        response.setDisplayImageUrl(vendor.getDisplayImageUrl());
        response.setIsActive(vendor.isActive());
        response.setStatus(vendor.getStatus() != null ? vendor.getStatus().name() : null);
        response.setGalleryImages(vendor.getGalleryImages().stream().map(image -> image.getImageUrl()).toList());
        response.setCreatedAt(vendor.getCreatedAt());
        response.setUpdatedAt(vendor.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public VendorOwnerResponse getOwner() {
        return owner;
    }

    public void setOwner(VendorOwnerResponse owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getHours() {
        return hours;
    }

    public void setHours(String hours) {
        this.hours = hours;
    }

    public String getBannerImageUrl() {
        return bannerImageUrl;
    }

    public void setBannerImageUrl(String bannerImageUrl) {
        this.bannerImageUrl = bannerImageUrl;
    }

    public String getDisplayImageUrl() {
        return displayImageUrl;
    }

    public void setDisplayImageUrl(String displayImageUrl) {
        this.displayImageUrl = displayImageUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getGalleryImages() {
        return galleryImages;
    }

    public void setGalleryImages(List<String> galleryImages) {
        this.galleryImages = galleryImages;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
