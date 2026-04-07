package com.streetbite.service;

import com.streetbite.dto.PromotionRequest;
import com.streetbite.model.Promotion;
import com.streetbite.model.Vendor;
import com.streetbite.repository.PromotionRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final VendorRepository vendorRepository;

    public PromotionService(PromotionRepository promotionRepository, VendorRepository vendorRepository) {
        this.promotionRepository = promotionRepository;
        this.vendorRepository = vendorRepository;
    }

    public Promotion savePromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    public Promotion createPromotion(PromotionRequest request) {
        if (request.getVendorId() == null) {
            throw new IllegalArgumentException("Vendor ID is required");
        }

        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));

        Promotion promotion = new Promotion();
        promotion.setVendor(vendor);
        applyPromotionRequest(promotion, request, false);
        return savePromotion(promotion);
    }

    public Promotion updatePromotion(Promotion promotion, PromotionRequest request) {
        applyPromotionRequest(promotion, request, true);
        return savePromotion(promotion);
    }

    private void applyPromotionRequest(Promotion promotion, PromotionRequest request, boolean partial) {
        if (!partial || request.getTitle() != null) {
            promotion.setTitle(request.getTitle());
        }
        if (!partial || request.getDescription() != null) {
            promotion.setDescription(request.getDescription());
        }
        if (!partial || request.getPromoCode() != null) {
            promotion.setPromoCode(request.getPromoCode());
        }
        if (!partial || request.getDiscountType() != null) {
            promotion.setDiscountType(request.getDiscountType());
        }
        if (!partial || request.getDiscountValue() != null) {
            promotion.setDiscountValue(request.getDiscountValue());
        }
        if (!partial || request.getMinOrderValue() != null) {
            promotion.setMinOrderValue(request.getMinOrderValue());
        }
        if (!partial || request.getMaxUses() > 0) {
            promotion.setMaxUses(request.getMaxUses() > 0 ? request.getMaxUses() : promotion.getMaxUses());
        }

        if (!partial) {
            promotion.setStartDate(request.getStartDate() != null
                    ? request.getStartDate().atStartOfDay()
                    : LocalDateTime.now());
            promotion.setEndDate(request.getEndDate() != null
                    ? request.getEndDate().atTime(23, 59, 59)
                    : null);
        } else {
            if (request.getStartDate() != null) {
                promotion.setStartDate(request.getStartDate().atStartOfDay());
            }
            if (request.getEndDate() != null) {
                promotion.setEndDate(request.getEndDate().atTime(23, 59, 59));
            }
        }

        promotion.setActive(request.isActive());
    }

    public List<Promotion> getPromotionsByVendor(Long vendorId) {
        return promotionRepository.findByVendorId(vendorId);
    }

    public List<Promotion> getActivePromotionsByVendor(Long vendorId) {
        return promotionRepository.findByVendorIdAndIsActiveTrue(vendorId);
    }

    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepository.findById(id);
    }

    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public List<Promotion> getAllActivePromotions() {
        return promotionRepository.findByIsActiveTrueAndVendorStatusNot(com.streetbite.model.VendorStatus.SUSPENDED);
    }
}
