package com.streetbite.dto.vendor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.streetbite.model.User;

public class VendorOwnerResponse {

    private Long id;
    private String email;
    private String displayName;
    private String profilePicture;
    private User.Role role;

    @JsonProperty("isActive")
    private Boolean isActive;

    public static VendorOwnerResponse from(User user) {
        if (user == null) {
            return null;
        }

        VendorOwnerResponse response = new VendorOwnerResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setDisplayName(user.getDisplayName());
        response.setProfilePicture(user.getProfilePicture());
        response.setRole(user.getRole());
        response.setIsActive(user.getActive());
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
