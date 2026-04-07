package com.streetbite.dto.gamification;

import com.streetbite.model.User;

public class LeaderboardUserResponse {
    private Long id;
    private String displayName;
    private Integer xp;
    private Integer level;
    private String profilePicture;

    public static LeaderboardUserResponse from(User user, int level) {
        LeaderboardUserResponse response = new LeaderboardUserResponse();
        response.setId(user.getId());
        response.setDisplayName(user.getDisplayName());
        response.setXp(user.getXp() != null ? user.getXp() : 0);
        response.setLevel(level);
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

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}
