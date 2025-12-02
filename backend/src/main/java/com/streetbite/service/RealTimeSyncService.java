package com.streetbite.service;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RealTimeSyncService {

    private Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }

    /**
     * Updates menu item availability in Firestore for real-time sync
     */
    public void updateMenuAvailability(Long itemId, Boolean isAvailable) {
        try {
            Firestore db = getFirestore();
            Map<String, Object> data = new HashMap<>();
            data.put("isAvailable", isAvailable);
            data.put("lastUpdated", System.currentTimeMillis());

            db.collection("live_menu_items")
                    .document(String.valueOf(itemId))
                    .set(data);

            System.out.println("Synced menu item " + itemId + " availability to Firebase: " + isAvailable);
        } catch (Exception e) {
            System.err.println("Failed to sync to Firebase: " + e.getMessage());
            // Don't throw - allow MySQL operation to succeed even if Firebase sync fails
        }
    }

    /**
     * Updates vendor online status in Firestore
     */
    public void updateVendorStatus(Long vendorId, com.streetbite.model.VendorStatus status) {
        try {
            Firestore db = getFirestore();
            Map<String, Object> data = new HashMap<>();
            data.put("status", status.toString());
            data.put("lastUpdated", System.currentTimeMillis());

            db.collection("live_vendors")
                    .document(String.valueOf(vendorId))
                    .set(data);

            System.out.println("Synced vendor " + vendorId + " status to Firebase: " + status);
        } catch (Exception e) {
            System.err.println("Failed to sync vendor status to Firebase: " + e.getMessage());
        }
    }

    /**
     * Updates vendor location in Firestore for real-time sync
     */
    public void updateVendorLocation(Long vendorId, Double latitude, Double longitude, String address) {
        try {
            Firestore db = getFirestore();
            Map<String, Object> data = new HashMap<>();
            data.put("latitude", latitude);
            data.put("longitude", longitude);
            if (address != null) {
                data.put("address", address);
            }
            data.put("lastUpdated", System.currentTimeMillis());

            db.collection("live_vendors")
                    .document(String.valueOf(vendorId))
                    .set(data);

            System.out.println(
                    "✅ Synced vendor " + vendorId + " location to Firebase: (" + latitude + ", " + longitude + ")");
        } catch (Exception e) {
            System.err.println("❌ Failed to sync vendor location to Firebase: " + e.getMessage());
        }
    }
}
