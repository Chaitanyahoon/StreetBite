package com.streetbite.dto.zodiac;

public class ZodiacSignResponse {
    private Long userId;
    private String zodiacSign;

    public ZodiacSignResponse() {
    }

    public ZodiacSignResponse(Long userId, String zodiacSign) {
        this.userId = userId;
        this.zodiacSign = zodiacSign;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getZodiacSign() {
        return zodiacSign;
    }

    public void setZodiacSign(String zodiacSign) {
        this.zodiacSign = zodiacSign;
    }
}
