package com.streetbite.controller;

import com.streetbite.model.Promotion;
import com.streetbite.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private com.streetbite.repository.VendorRepository vendorRepository;

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody com.streetbite.dto.PromotionRequest request) {
        try {
            if (request.getVendorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vendor ID is required"));
            }

            com.streetbite.model.Vendor vendor = vendorRepository.findById(request.getVendorId())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));

            Promotion promotion = new Promotion();
            promotion.setVendor(vendor);
            promotion.setTitle(request.getTitle());
            promotion.setDescription(request.getDescription());
            promotion.setPromoCode(request.getPromoCode());
            promotion.setDiscountType(request.getDiscountType());
            promotion.setDiscountValue(request.getDiscountValue());
            promotion.setMinOrderValue(request.getMinOrderValue());
            promotion.setMaxUses(request.getMaxUses());
            promotion.setStartDate(request.getStartDate() != null ? request.getStartDate().atStartOfDay()
                    : java.time.LocalDateTime.now());
            promotion.setEndDate(request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null);
            promotion.setActive(request.isActive());

            Promotion savedPromotion = promotionService.savePromotion(promotion);
            return ResponseEntity.ok(savedPromotion);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Promotion>> getVendorPromotions(@PathVariable Long vendorId) {
        return ResponseEntity.ok(promotionService.getPromotionsByVendor(vendorId));
    }

    @GetMapping("/vendor/{vendorId}/active")
    public ResponseEntity<List<Promotion>> getActiveVendorPromotions(@PathVariable Long vendorId) {
        return ResponseEntity.ok(promotionService.getActivePromotionsByVendor(vendorId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getAllActivePromotions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPromotion(@PathVariable Long id) {
        return promotionService.getPromotionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id,
            @RequestBody com.streetbite.dto.PromotionRequest request) {
        return promotionService.getPromotionById(id)
                .map(existingPromotion -> {
                    if (request.getTitle() != null)
                        existingPromotion.setTitle(request.getTitle());
                    if (request.getDescription() != null)
                        existingPromotion.setDescription(request.getDescription());
                    if (request.getPromoCode() != null)
                        existingPromotion.setPromoCode(request.getPromoCode());
                    if (request.getDiscountType() != null)
                        existingPromotion.setDiscountType(request.getDiscountType());
                    if (request.getDiscountValue() != null)
                        existingPromotion.setDiscountValue(request.getDiscountValue());
                    if (request.getMinOrderValue() != null)
                        existingPromotion.setMinOrderValue(request.getMinOrderValue());
                    if (request.getMaxUses() > 0)
                        existingPromotion.setMaxUses(request.getMaxUses());

                    if (request.getStartDate() != null)
                        existingPromotion.setStartDate(request.getStartDate().atStartOfDay());

                    if (request.getEndDate() != null)
                        existingPromotion.setEndDate(request.getEndDate().atTime(23, 59, 59));

                    System.out.println("Update Promotion ID: " + id + ", isActive from request: " + request.isActive());
                    existingPromotion.setActive(request.isActive());

                    Promotion saved = promotionService.savePromotion(existingPromotion);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
