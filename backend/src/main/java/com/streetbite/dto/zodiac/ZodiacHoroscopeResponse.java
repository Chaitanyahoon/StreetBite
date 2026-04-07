package com.streetbite.dto.zodiac;

public class ZodiacHoroscopeResponse {
    private String zodiacSign;
    private String prediction;
    private String luckyDish;
    private String luckyTime;
    private String challenge;

    public String getZodiacSign() {
        return zodiacSign;
    }

    public void setZodiacSign(String zodiacSign) {
        this.zodiacSign = zodiacSign;
    }

    public String getPrediction() {
        return prediction;
    }

    public void setPrediction(String prediction) {
        this.prediction = prediction;
    }

    public String getLuckyDish() {
        return luckyDish;
    }

    public void setLuckyDish(String luckyDish) {
        this.luckyDish = luckyDish;
    }

    public String getLuckyTime() {
        return luckyTime;
    }

    public void setLuckyTime(String luckyTime) {
        this.luckyTime = luckyTime;
    }

    public String getChallenge() {
        return challenge;
    }

    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }
}
