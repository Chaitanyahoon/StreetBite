package com.streetbite.dto.hottopic;

import com.streetbite.model.User;

public class HotTopicUserResponse {

    private Long id;
    private String displayName;

    public static HotTopicUserResponse from(User user) {
        HotTopicUserResponse response = new HotTopicUserResponse();
        response.setId(user.getId());
        response.setDisplayName(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail());
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
}
