package com.streetbite.controller;

import com.streetbite.model.MenuItem;
import com.streetbite.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Menu management endpoints:
 * - POST /api/menu/{vendorId} - Create menu item
 * - GET /api/menu/vendor/{vendorId} - Get all menu items for vendor
 * - GET /api/menu/{itemId} - Get menu item by ID
 * - PUT /api/menu/{itemId} - Update menu item
 * - DELETE /api/menu/{itemId} - Delete menu item
 */
@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final FirestoreService firestoreService;

    public MenuController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping("/{vendorId}")
    public ResponseEntity<?> createMenuItem(@PathVariable String vendorId, @RequestBody Map<String, Object> payload) {
        try {
            MenuItem item = new MenuItem();
            item.setVendorId(vendorId);
            item.setName((String) payload.get("name"));
            item.setCategory((String) payload.get("category"));
            item.setDescription((String) payload.get("description"));
            
            // Handle price (can be number or string)
            Object priceObj = payload.get("price");
            if (priceObj instanceof Number) {
                item.setPrice(((Number) priceObj).doubleValue());
            } else if (priceObj instanceof String) {
                item.setPrice(Double.parseDouble((String) priceObj));
            }
            
            item.setImageUrl((String) payload.get("imageUrl"));
            item.setIsAvailable(payload.get("isAvailable") != null ? 
                (Boolean) payload.get("isAvailable") : true);
            
            Object prepTimeObj = payload.get("preparationTime");
            if (prepTimeObj instanceof Number) {
                item.setPreparationTime(((Number) prepTimeObj).intValue());
            }
            
            item.setRating(0.0);
            item.setTotalOrders(0);
            item.setCreatedAt(Instant.now().toString());
            item.setUpdatedAt(Instant.now().toString());

            String itemId = firestoreService.saveMenuItem(item);
            item.setItemId(itemId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "itemId", itemId,
                "item", item
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create menu item: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorMenu(@PathVariable String vendorId) {
        try {
            List<MenuItem> items = firestoreService.getMenuItemsByVendor(vendorId);
            return ResponseEntity.ok(items);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<?> getMenuItem(@PathVariable String itemId) {
        try {
            MenuItem item = firestoreService.getMenuItemById(itemId);
            if (item == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Menu item not found"));
            }
            return ResponseEntity.ok(item);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateMenuItem(@PathVariable String itemId, @RequestBody Map<String, Object> payload) {
        try {
            firestoreService.updateMenuItem(itemId, payload);
            MenuItem updated = firestoreService.getMenuItemById(itemId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "item", updated
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update menu item: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String itemId) {
        try {
            firestoreService.deleteMenuItem(itemId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Menu item deleted successfully"));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete menu item: " + e.getMessage()));
        }
    }
}

