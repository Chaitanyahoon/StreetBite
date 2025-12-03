package com.streetbite.controller;

import com.streetbite.model.Review;
import com.streetbite.service.ReviewService;
import com.streetbite.service.VendorStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private VendorStatsService vendorStatsService;

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Review>> getVendorReviews(@PathVariable Long vendorId) {
        return ResponseEntity.ok(reviewService.getReviewsByVendor(vendorId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId));
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            Review savedReview = reviewService.saveReview(review);

            // Update vendor statistics after review is created
            if (savedReview.getVendor() != null && savedReview.getVendor().getId() != null) {
                vendorStatsService.updateVendorStats(savedReview.getVendor().getId());
            }

            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
