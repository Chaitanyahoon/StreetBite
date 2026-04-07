package com.streetbite.dto.favorite;

public class FavoriteStatusResponse {
    private boolean isFavorite;
    private String message;

    public FavoriteStatusResponse() {
    }

    public FavoriteStatusResponse(boolean isFavorite, String message) {
        this.isFavorite = isFavorite;
        this.message = message;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
