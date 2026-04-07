package com.streetbite.dto.gamification;

import java.time.LocalDate;

public class UserStatsResponse {
    private Integer xp;
    private Integer level;
    private Integer streak;
    private Integer rank;
    private String displayName;
    private String email;
    private LocalDate lastCheckIn;

    public Integer getXp() {
        return xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getLastCheckIn() {
        return lastCheckIn;
    }

    public void setLastCheckIn(LocalDate lastCheckIn) {
        this.lastCheckIn = lastCheckIn;
    }
}
