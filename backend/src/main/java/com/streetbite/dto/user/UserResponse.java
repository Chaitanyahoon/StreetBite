package com.streetbite.dto.user;

import com.streetbite.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String email;
    private String displayName;
    private String phoneNumber;
    private String profilePicture;
    private User.Role role;
    private Boolean active;
    private Boolean emailVerified;
    private Integer xp;
    private Integer level;
    private Integer streak;
    private LocalDate lastCheckIn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setDisplayName(user.getDisplayName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setProfilePicture(user.getProfilePicture());
        response.setRole(user.getRole());
        response.setActive(user.getActive());
        response.setEmailVerified(user.getEmailVerified());
        response.setXp(user.getXp());
        response.setLevel(user.getLevel());
        response.setStreak(user.getStreak());
        response.setLastCheckIn(user.getLastCheckIn());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public User.Role getRole() {
        return role;
    }

    public void setRole(User.Role role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public Integer getXp() {
        return xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public LocalDate getLastCheckIn() {
        return lastCheckIn;
    }

    public void setLastCheckIn(LocalDate lastCheckIn) {
        this.lastCheckIn = lastCheckIn;
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
