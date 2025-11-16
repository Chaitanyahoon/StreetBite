package com.streetbite.controller;

import com.streetbite.model.Promotion;
import com.streetbite.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Promotion/Offer management endpoints:
 * - POST /api/promotions/{vendorId} - Create a promotion
 * - GET /api/promotions/vendor/{vendorId} - Get all promotions for a vendor
 * - GET /api/promotions/vendor/{vendorId}/active - Get active promotions for a vendor
 * - GET /api/promotions/{promotionId} - Get promotion by ID
 * - PUT /api/promotions/{promotionId} - Update promotion
 * - DELETE /api/promotions/{promotionId} - Delete promotion
 * - POST /api/promotions/{promotionId}/use - Record promotion usage
 */
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final FirestoreService firestoreService;

    public PromotionController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping("/{vendorId}")
    public ResponseEntity<?> createPromotion(@PathVariable String vendorId, @RequestBody Map<String, Object> payload) {
        try {
            Promotion promotion = new Promotion();
            promotion.setVendorId(vendorId);
            promotion.setTitle((String) payload.get("title"));
            promotion.setDescription((String) payload.get("description"));
            promotion.setDiscountType((String) payload.get("discountType"));
            
            // Handle discountValue (can be number or string)
            Object discountValueObj = payload.get("discountValue");
            if (discountValueObj instanceof Number) {
                promotion.setDiscountValue(((Number) discountValueObj).doubleValue());
            } else if (discountValueObj instanceof String) {
                promotion.setDiscountValue(Double.parseDouble((String) discountValueObj));
            }
            
            promotion.setPromoCode((String) payload.get("promoCode"));
            promotion.setStartDate((String) payload.get("startDate"));
            promotion.setEndDate((String) payload.get("endDate"));
            promotion.setIsActive(payload.get("isActive") != null ? 
                (Boolean) payload.get("isActive") : true);
            
            Object maxUsesObj = payload.get("maxUses");
            if (maxUsesObj instanceof Number) {
                promotion.setMaxUses(((Number) maxUsesObj).intValue());
            } else if (maxUsesObj instanceof String) {
                promotion.setMaxUses(Integer.parseInt((String) maxUsesObj));
            }
            
            promotion.setImageUrl((String) payload.get("imageUrl"));
            promotion.setCurrentUses(0);

            String promotionId = firestoreService.savePromotion(promotion);
            promotion.setPromotionId(promotionId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "promotionId", promotionId,
                "promotion", promotion
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create promotion: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorPromotions(@PathVariable String vendorId) {
        try {
            List<Promotion> promotions = firestoreService.getPromotionsByVendor(vendorId);
            return ResponseEntity.ok(Map.of(
                "promotions", promotions,
                "count", promotions.size()
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}/active")
    public ResponseEntity<?> getActiveVendorPromotions(@PathVariable String vendorId) {
        try {
            List<Promotion> promotions = firestoreService.getActivePromotionsByVendor(vendorId);
            return ResponseEntity.ok(Map.of(
                "promotions", promotions,
                "count", promotions.size()
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{promotionId}")
    public ResponseEntity<?> getPromotion(@PathVariable String promotionId) {
        try {
            Promotion promotion = firestoreService.getPromotionById(promotionId);
            if (promotion == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Promotion not found"));
            }
            return ResponseEntity.ok(promotion);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{promotionId}")
    public ResponseEntity<?> updatePromotion(@PathVariable String promotionId, @RequestBody Map<String, Object> payload) {
        try {
            firestoreService.updatePromotion(promotionId, payload);
            Promotion updated = firestoreService.getPromotionById(promotionId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "promotion", updated
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update promotion: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{promotionId}")
    public ResponseEntity<?> deletePromotion(@PathVariable String promotionId) {
        try {
            firestoreService.deletePromotion(promotionId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Promotion deleted successfully"));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete promotion: " + e.getMessage()));
        }
    }

    @PostMapping("/{promotionId}/use")
    public ResponseEntity<?> usePromotion(@PathVariable String promotionId) {
        try {
            firestoreService.incrementPromotionUses(promotionId);
            Promotion promotion = firestoreService.getPromotionById(promotionId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Promotion usage recorded",
                "promotion", promotion
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to record promotion usage: " + e.getMessage()));
        }
    }
}

