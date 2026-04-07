package com.streetbite.dto.gamification;

public class GamificationActionResponse {
    private boolean success;
    private String actionType;
    private Integer newXp;
    private Integer level;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public Integer getNewXp() {
        return newXp;
    }

    public void setNewXp(Integer newXp) {
        this.newXp = newXp;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
