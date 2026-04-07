package com.streetbite.dto.zodiac;

public class ZodiacChallengeResponse {
    private String message;
    private Integer xp;

    public ZodiacChallengeResponse() {
    }

    public ZodiacChallengeResponse(String message, Integer xp) {
        this.message = message;
        this.xp = xp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getXp() {
        return xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
    }
}
