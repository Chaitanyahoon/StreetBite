package com.streetbite.dto.analytics;

public class PlatformEngagementTrendPointResponse {

    private String date;
    private Long interactions;
    private Long users;

    public PlatformEngagementTrendPointResponse() {
    }

    public PlatformEngagementTrendPointResponse(String date, Long interactions, Long users) {
        this.date = date;
        this.interactions = interactions;
        this.users = users;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Long getInteractions() {
        return interactions;
    }

    public void setInteractions(Long interactions) {
        this.interactions = interactions;
    }

    public Long getUsers() {
        return users;
    }

    public void setUsers(Long users) {
        this.users = users;
    }
}
