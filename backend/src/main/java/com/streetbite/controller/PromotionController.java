package com.streetbite.controller;

import com.streetbite.dto.PromotionRequest;
import com.streetbite.model.Promotion;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.model.Promotion;
import com.streetbite.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;
    private final AuthenticatedUserService authenticatedUserService;

    public PromotionController(PromotionService promotionService, AuthenticatedUserService authenticatedUserService) {
        this.promotionService = promotionService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody PromotionRequest request, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        try {
            if (request.getVendorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vendor ID is required"));
            }

            Promotion savedPromotion = promotionService.createPromotion(request);
            if (!canManagePromotion(currentUser, savedPromotion)) {
                return forbidden("You do not have permission to manage promotions for this vendor");
            }
            return ResponseEntity.ok(savedPromotion);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
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
            @RequestBody PromotionRequest request,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        return promotionService.getPromotionById(id)
                .map(existingPromotion -> {
                    if (!canManagePromotion(currentUser, existingPromotion)) {
                        return forbidden("You do not have permission to manage this promotion");
                    }

                    try {
                        Promotion saved = promotionService.updatePromotion(existingPromotion, request);
                        return ResponseEntity.ok(saved);
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        return promotionService.getPromotionById(id)
                .map(promotion -> {
                    if (!canManagePromotion(currentUser, promotion)) {
                        return forbidden("You do not have permission to manage this promotion");
                    }

                    try {
                        promotionService.deletePromotion(id);
                        return ResponseEntity.ok(Map.of("success", true));
                    } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private boolean canManagePromotion(User currentUser, Promotion promotion) {
        if (currentUser == null || promotion == null || promotion.getVendor() == null) {
            return false;
        }

        if (authenticatedUserService.isAdmin(currentUser)) {
            return true;
        }

        return promotion.getVendor().getOwner() != null
                && Objects.equals(promotion.getVendor().getOwner().getId(), currentUser.getId());
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }
}
