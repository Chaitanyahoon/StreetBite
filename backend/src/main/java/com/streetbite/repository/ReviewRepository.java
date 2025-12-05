package com.streetbite.repository;

import com.streetbite.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVendorId(Long vendorId);

    List<Review> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.rating) FROM Review r WHERE r.vendor.id = :vendorId")
    Double findAverageRatingByVendorId(Long vendorId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM Review r WHERE r.vendor.id = :vendorId")
    Long countByVendorId(Long vendorId);
}
