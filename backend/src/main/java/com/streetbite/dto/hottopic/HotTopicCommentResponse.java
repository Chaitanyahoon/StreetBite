package com.streetbite.dto.hottopic;

import com.streetbite.model.TopicComment;
import com.streetbite.model.User;

import java.time.LocalDateTime;

public class HotTopicCommentResponse {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private HotTopicUserResponse user;

    public static HotTopicCommentResponse from(TopicComment comment) {
        HotTopicCommentResponse response = new HotTopicCommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());

        User user = comment.getUser();
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public HotTopicUserResponse getUser() {
        return user;
    }

    public void setUser(HotTopicUserResponse user) {
        this.user = user;
    }
}
