package com.streetbite.service;

import com.streetbite.model.VendorStatus;

public final class RealtimeSyncEvents {

    private RealtimeSyncEvents() {
        // Utility class
    }

    public static record MenuItemSavedEvent(Long itemId, Boolean isAvailable) {
    }

    public static record MenuItemDeletedEvent(Long itemId) {
    }

    public static record VendorUpdatedEvent(Long vendorId, VendorStatus status, Double latitude, Double longitude, String address) {
    }

    public static record VendorDeletedEvent(Long vendorId) {
    }
}
