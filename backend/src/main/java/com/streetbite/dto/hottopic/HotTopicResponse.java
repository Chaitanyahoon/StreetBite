package com.streetbite.dto.hottopic;

import com.streetbite.model.HotTopic;

import java.time.LocalDateTime;
import java.util.List;

public class HotTopicResponse {

    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private boolean isActive;
    private boolean isApproved;
    private String createdByDisplayName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<HotTopicCommentResponse> comments;
    private List<HotTopicLikeResponse> likes;

    public static HotTopicResponse from(HotTopic topic) {
        HotTopicResponse response = new HotTopicResponse();
        response.setId(topic.getId());
        response.setTitle(topic.getTitle());
        response.setContent(topic.getContent());
        response.setImageUrl(topic.getImageUrl());
        response.setActive(topic.isActive());
        response.setApproved(topic.isApproved());
        response.setCreatedByDisplayName(topic.getCreatedByDisplayName());
        response.setCreatedAt(topic.getCreatedAt());
        response.setUpdatedAt(topic.getUpdatedAt());
        response.setComments(topic.getComments().stream().map(HotTopicCommentResponse::from).toList());
        response.setLikes(topic.getLikes().stream().map(HotTopicLikeResponse::from).toList());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }

    public String getCreatedByDisplayName() {
        return createdByDisplayName;
    }

    public void setCreatedByDisplayName(String createdByDisplayName) {
        this.createdByDisplayName = createdByDisplayName;
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

    public List<HotTopicCommentResponse> getComments() {
        return comments;
    }

    public void setComments(List<HotTopicCommentResponse> comments) {
        this.comments = comments;
    }

    public List<HotTopicLikeResponse> getLikes() {
        return likes;
    }

    public void setLikes(List<HotTopicLikeResponse> likes) {
        this.likes = likes;
    }
}
