package com.streetbite.dto.analytics;

public class AnalyticsTopItemResponse {

    private String name;
    private Long views;
    private Long clicks;

    public AnalyticsTopItemResponse() {
    }

    public AnalyticsTopItemResponse(String name, Long views, Long clicks) {
        this.name = name;
        this.views = views;
        this.clicks = clicks;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getViews() {
        return views;
    }

    public void setViews(Long views) {
        this.views = views;
    }

    public Long getClicks() {
        return clicks;
    }

    public void setClicks(Long clicks) {
        this.clicks = clicks;
    }
}
