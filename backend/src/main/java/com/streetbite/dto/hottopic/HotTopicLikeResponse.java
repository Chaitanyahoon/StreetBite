package com.streetbite.dto.hottopic;

import com.streetbite.model.TopicLike;
import com.streetbite.model.User;

import java.time.LocalDateTime;

public class HotTopicLikeResponse {

    private Long id;
    private HotTopicUserResponse user;
    private LocalDateTime createdAt;

    public static HotTopicLikeResponse from(TopicLike like) {
        HotTopicLikeResponse response = new HotTopicLikeResponse();
        response.setId(like.getId());
        response.setCreatedAt(like.getCreatedAt());

        User user = like.getUser();
        if (user != null) {
            response.setUser(HotTopicUserResponse.from(user));
        }

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HotTopicUserResponse getUser() {
        return user;
    }

    public void setUser(HotTopicUserResponse user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
