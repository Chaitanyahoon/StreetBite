package com.streetbite.repository;

import com.streetbite.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByVendorId(Long vendorId);

    List<Promotion> findByVendorIdAndIsActiveTrueAndEndDateAfter(Long vendorId, LocalDateTime now);

    List<Promotion> findByVendorIdAndIsActiveTrue(Long vendorId);

    List<Promotion> findByIsActiveTrue();
}
