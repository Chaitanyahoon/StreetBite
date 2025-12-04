package com.streetbite.controller;

import com.streetbite.model.MenuItem;
import com.streetbite.service.MenuService;
import com.streetbite.service.RealTimeSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<MenuItem>> getMenuByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(menuService.getMenuByVendor(vendorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItem(@PathVariable Long id) {
        return menuService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItemRequest request) {
        try {
            MenuItem menuItem = new MenuItem();
            menuItem.setName(request.getName());
            menuItem.setDescription(request.getDescription());
            menuItem.setPrice(request.getPrice());
            menuItem.setCategory(request.getCategory());
            menuItem.setImageUrl(request.getImageUrl());
            menuItem.setAvailable(request.isAvailable());
            menuItem.setPreparationTime(request.getPreparationTime());

            MenuItem savedItem = menuService.saveMenuItem(menuItem, request.getVendorId());
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    public static class MenuItemRequest {
        private String name;
        private String description;
        private java.math.BigDecimal price;
        private String category;
        private String imageUrl;
        private boolean isAvailable;
        private Long vendorId;
        private Integer preparationTime;

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public java.math.BigDecimal getPrice() {
            return price;
        }

        public void setPrice(java.math.BigDecimal price) {
            this.price = price;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public boolean isAvailable() {
            return isAvailable;
        }

        public void setAvailable(boolean available) {
            isAvailable = available;
        }

        public Long getVendorId() {
            return vendorId;
        }

        public void setVendorId(Long vendorId) {
            this.vendorId = vendorId;
        }

        public Integer getPreparationTime() {
            return preparationTime;
        }

        public void setPreparationTime(Integer preparationTime) {
            this.preparationTime = preparationTime;
        }
    }

    @Autowired
    private RealTimeSyncService realTimeSyncService;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return menuService.getMenuItemById(id)
                .map(existingItem -> {
                    if (updates.containsKey("name"))
                        existingItem.setName((String) updates.get("name"));
                    if (updates.containsKey("description"))
                        existingItem.setDescription((String) updates.get("description"));
                    if (updates.containsKey("category"))
                        existingItem.setCategory((String) updates.get("category"));
                    if (updates.containsKey("price")) {
                        Object priceObj = updates.get("price");
                        existingItem.setPrice(new java.math.BigDecimal(priceObj.toString()));
                    }
                    if (updates.containsKey("imageUrl"))
                        existingItem.setImageUrl((String) updates.get("imageUrl"));
                    if (updates.containsKey("isAvailable")) {
                        Boolean isAvailable = (Boolean) updates.get("isAvailable");
                        existingItem.setAvailable(isAvailable);
                        // Sync to Firebase for real-time updates
                        realTimeSyncService.updateMenuAvailability(existingItem.getId(), isAvailable);
                    }

                    MenuItem saved = menuService.saveMenuItem(existingItem);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        try {
            menuService.deleteMenuItem(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
