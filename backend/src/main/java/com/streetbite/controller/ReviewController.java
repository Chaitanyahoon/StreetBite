package com.streetbite.controller;

import com.streetbite.model.Review;
import com.streetbite.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Review management endpoints:
 * - POST /api/reviews - Create a review
 * - GET /api/reviews/vendor/{vendorId} - Get all reviews for a vendor
 * - GET /api/reviews/{reviewId} - Get review by ID
 * - PUT /api/reviews/{reviewId} - Update review
 * - DELETE /api/reviews/{reviewId} - Delete review
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final FirestoreService firestoreService;

    public ReviewController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> payload) {
        try {
            Review review = new Review();
            review.setVendorId((String) payload.get("vendorId"));
            review.setUserId((String) payload.get("userId"));
            review.setUserName((String) payload.get("userName"));
            review.setUserPhotoUrl((String) payload.get("userPhotoUrl"));
            
            // Handle rating (can be number or string)
            Object ratingObj = payload.get("rating");
            if (ratingObj instanceof Number) {
                review.setRating(((Number) ratingObj).intValue());
            } else if (ratingObj instanceof String) {
                review.setRating(Integer.parseInt((String) ratingObj));
            }
            
            review.setComment((String) payload.get("comment"));
            
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) payload.get("imageUrls");
            review.setImageUrls(imageUrls);
            
            review.setIsVerifiedPurchase(payload.get("isVerifiedPurchase") != null ? 
                (Boolean) payload.get("isVerifiedPurchase") : false);

            String reviewId = firestoreService.saveReview(review);
            review.setReviewId(reviewId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "reviewId", reviewId,
                "review", review
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create review: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorReviews(@PathVariable String vendorId) {
        try {
            List<Review> reviews = firestoreService.getReviewsByVendor(vendorId);
            
            // Calculate average rating
            double avgRating = reviews.stream()
                    .filter(r -> r.getRating() != null)
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            return ResponseEntity.ok(Map.of(
                "reviews", reviews,
                "count", reviews.size(),
                "averageRating", avgRating
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReview(@PathVariable String reviewId) {
        try {
            Review review = firestoreService.getReviewById(reviewId);
            if (review == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Review not found"));
            }
            return ResponseEntity.ok(review);
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable String reviewId, @RequestBody Map<String, Object> payload) {
        try {
            firestoreService.updateReview(reviewId, payload);
            Review updated = firestoreService.getReviewById(reviewId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "review", updated
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update review: " + e.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        try {
            firestoreService.deleteReview(reviewId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Review deleted successfully"));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete review: " + e.getMessage()));
        }
    }
}

