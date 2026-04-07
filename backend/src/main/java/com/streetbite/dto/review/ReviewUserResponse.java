package com.streetbite.dto.review;

import com.streetbite.model.User;

public class ReviewUserResponse {
    private Long id;
    private String displayName;
    private String profilePicture;

    public static ReviewUserResponse from(User user) {
        ReviewUserResponse response = new ReviewUserResponse();
        response.setId(user.getId());
        response.setDisplayName(user.getDisplayName());
        response.setProfilePicture(user.getProfilePicture());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
