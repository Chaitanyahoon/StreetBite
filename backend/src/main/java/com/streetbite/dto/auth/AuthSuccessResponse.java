package com.streetbite.dto.auth;

public class AuthSuccessResponse {

    private boolean success;
    private AuthUserResponse user;

    public AuthSuccessResponse() {
    }

    public AuthSuccessResponse(boolean success, AuthUserResponse user) {
        this.success = success;
        this.user = user;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public AuthUserResponse getUser() {
        return user;
    }

    public void setUser(AuthUserResponse user) {
        this.user = user;
    }
}
