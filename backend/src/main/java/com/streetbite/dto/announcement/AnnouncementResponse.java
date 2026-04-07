package com.streetbite.dto.announcement;

import com.streetbite.model.Announcement;

import java.time.LocalDateTime;

public class AnnouncementResponse {

    private Long id;
    private String message;
    private String type;
    private boolean active;
    private LocalDateTime createdAt;

    public static AnnouncementResponse from(Announcement announcement) {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(announcement.getId());
        response.setMessage(announcement.getMessage());
        response.setType(announcement.getType());
        response.setActive(announcement.isActive());
        response.setCreatedAt(announcement.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
