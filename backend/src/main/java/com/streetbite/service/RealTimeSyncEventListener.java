package com.streetbite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class RealTimeSyncEventListener {

    @Autowired
    private RealTimeSyncService realTimeSyncService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMenuItemSaved(RealtimeSyncEvents.MenuItemSavedEvent event) {
        if (event.itemId() != null) {
            realTimeSyncService.updateMenuAvailability(event.itemId(), event.isAvailable());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMenuItemDeleted(RealtimeSyncEvents.MenuItemDeletedEvent event) {
        if (event.itemId() != null) {
            realTimeSyncService.deleteMenuAvailability(event.itemId());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVendorUpdated(RealtimeSyncEvents.VendorUpdatedEvent event) {
        if (event.vendorId() != null) {
            if (event.status() != null) {
                realTimeSyncService.updateVendorStatus(event.vendorId(), event.status());
            }
            if (event.latitude() != null && event.longitude() != null) {
                realTimeSyncService.updateVendorLocation(event.vendorId(), event.latitude(), event.longitude(), event.address());
            }
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVendorDeleted(RealtimeSyncEvents.VendorDeletedEvent event) {
        if (event.vendorId() != null) {
            realTimeSyncService.deleteVendorRealtimeState(event.vendorId());
        }
    }
}
