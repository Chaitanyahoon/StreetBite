package com.streetbite.dto.notification;

import java.util.List;

public class NotificationTokensResponse {
    private List<String> tokens;

    public NotificationTokensResponse() {
    }

    public NotificationTokensResponse(List<String> tokens) {
        this.tokens = tokens;
    }

    public List<String> getTokens() {
        return tokens;
    }

    public void setTokens(List<String> tokens) {
        this.tokens = tokens;
    }
}
