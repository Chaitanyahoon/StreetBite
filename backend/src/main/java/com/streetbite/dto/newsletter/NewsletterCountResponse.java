package com.streetbite.dto.newsletter;

public class NewsletterCountResponse {
    private long count;

    public NewsletterCountResponse() {
    }

    public NewsletterCountResponse(long count) {
        this.count = count;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
