package com.streetbite.dto.notification;

public class NotificationMessageResponse {
    private String message;

    public NotificationMessageResponse() {
    }

    public NotificationMessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
