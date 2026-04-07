package com.streetbite.dto.zodiac;

public class ZodiacNotSetResponse {
    private String zodiacSign;

    public ZodiacNotSetResponse() {
    }

    public ZodiacNotSetResponse(String zodiacSign) {
        this.zodiacSign = zodiacSign;
    }

    public String getZodiacSign() {
        return zodiacSign;
    }

    public void setZodiacSign(String zodiacSign) {
        this.zodiacSign = zodiacSign;
    }
}
