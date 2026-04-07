package com.streetbite.dto.notification;

public class NotificationTokenResponse {
    private String message;
    private Long deviceId;

    public NotificationTokenResponse() {
    }

    public NotificationTokenResponse(String message, Long deviceId) {
        this.message = message;
        this.deviceId = deviceId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }
}
