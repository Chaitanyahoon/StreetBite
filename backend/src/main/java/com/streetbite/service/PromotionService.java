package com.streetbite.service;

import com.streetbite.model.Promotion;
import com.streetbite.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public Promotion savePromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
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
        return promotionRepository.findByIsActiveTrue();
    }
}
