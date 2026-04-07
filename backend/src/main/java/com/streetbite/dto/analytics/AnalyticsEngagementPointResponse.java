package com.streetbite.dto.analytics;

public class AnalyticsEngagementPointResponse {

    private String date;
    private String fullDate;
    private Long views;
    private Long directions;
    private Long calls;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getFullDate() {
        return fullDate;
    }

    public void setFullDate(String fullDate) {
        this.fullDate = fullDate;
    }

    public Long getViews() {
        return views;
    }

    public void setViews(Long views) {
        this.views = views;
    }

    public Long getDirections() {
        return directions;
    }

    public void setDirections(Long directions) {
        this.directions = directions;
    }

    public Long getCalls() {
        return calls;
    }

    public void setCalls(Long calls) {
        this.calls = calls;
    }
}
