package com.streetbite.dto.recommend;

import java.util.List;

public class RecommendRequest {

    private String mood;       // "adventurous", "comfort", "quick", "healthy"
    private String spiceLevel; // "mild", "medium", "spicy", "fire"
    private String budget;     // "low", "medium", "high"
    private String cuisine;    // optional: "Indian", "Chinese", etc.

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getSpiceLevel() { return spiceLevel; }
    public void setSpiceLevel(String spiceLevel) { this.spiceLevel = spiceLevel; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
}
