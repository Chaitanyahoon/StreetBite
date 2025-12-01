package com.streetbite.service;

import com.streetbite.model.Review;
import com.streetbite.model.Vendor;
import com.streetbite.repository.ReviewRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VendorStatsService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private VendorRepository vendorRepository;

    /**
     * Calculate and update vendor statistics based on reviews
     * This should be called whenever a review is added, updated, or deleted
     */
    public void updateVendorStats(Long vendorId) {
        Optional<Vendor> vendorOpt = vendorRepository.findById(vendorId);
        if (vendorOpt.isEmpty()) {
            return;
        }

        Vendor vendor = vendorOpt.get();
        List<Review> reviews = reviewRepository.findByVendorId(vendorId);

        // Calculate review count
        int reviewCount = reviews.size();
        vendor.setReviewCount(reviewCount);

        // Calculate average rating
        if (reviewCount > 0) {
            double sum = reviews.stream()
                    .mapToInt(Review::getRating)
                    .sum();
            double average = sum / reviewCount;
            vendor.setAverageRating(Math.round(average * 10.0) / 10.0); // Round to 1 decimal
            vendor.setRating(average); // Also update the legacy rating field
        } else {
            vendor.setAverageRating(0.0);
            vendor.setRating(0.0);
        }

        vendorRepository.save(vendor);
    }

    /**
     * Get statistics for a specific vendor
     */
    public VendorStats getVendorStats(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
        if (vendor == null) {
            return new VendorStats(0, 0.0);
        }

        return new VendorStats(
                vendor.getReviewCount() != null ? vendor.getReviewCount() : 0,
                vendor.getAverageRating() != null ? vendor.getAverageRating() : 0.0);
    }

    /**
     * Update stats for all vendors (useful for initial migration or maintenance)
     */
    public void updateAllVendorStats() {
        List<Vendor> vendors = vendorRepository.findAll();
        for (Vendor vendor : vendors) {
            updateVendorStats(vendor.getId());
        }
    }

    /**
     * DTO class for vendor statistics
     */
    public static class VendorStats {
        private final int reviewCount;
        private final double averageRating;

        public VendorStats(int reviewCount, double averageRating) {
            this.reviewCount = reviewCount;
            this.averageRating = averageRating;
        }

        public int getReviewCount() {
            return reviewCount;
        }

        public double getAverageRating() {
            return averageRating;
        }
    }
}
