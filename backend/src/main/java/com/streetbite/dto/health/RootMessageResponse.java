package com.streetbite.dto.health;

public class RootMessageResponse {
    private String message;

    public RootMessageResponse() {
    }

    public RootMessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
