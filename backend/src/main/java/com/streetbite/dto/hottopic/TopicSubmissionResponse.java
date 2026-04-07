package com.streetbite.dto.hottopic;

public class TopicSubmissionResponse {

    private final String message;
    private final Long topicId;

    public TopicSubmissionResponse(String message, Long topicId) {
        this.message = message;
        this.topicId = topicId;
    }

    public String getMessage() {
        return message;
    }

    public Long getTopicId() {
        return topicId;
    }
}
