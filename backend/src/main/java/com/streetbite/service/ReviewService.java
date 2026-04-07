package com.streetbite.service;

import com.streetbite.dto.review.ReviewCreateRequest;
import com.streetbite.dto.review.ReviewResponse;
import com.streetbite.dto.review.ReviewUpdateRequest;
import com.streetbite.model.Review;
import com.streetbite.model.ReviewImage;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.repository.ReviewRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final VendorRepository vendorRepository;
    private final VendorStatsService vendorStatsService;

    public ReviewService(
            ReviewRepository reviewRepository,
            VendorRepository vendorRepository,
            VendorStatsService vendorStatsService) {
        this.reviewRepository = reviewRepository;
        this.vendorRepository = vendorRepository;
        this.vendorStatsService = vendorStatsService;
    }

    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    public List<ReviewResponse> getReviewsByVendor(Long vendorId) {
        return reviewRepository.findByVendorId(vendorId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public List<ReviewResponse> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request, User currentUser) {
        Long vendorId = request.getVendorId();
        if (vendorId == null) {
            throw new IllegalArgumentException("Vendor is required");
        }

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));

        Review review = new Review();
        review.setVendor(vendor);
        review.setUser(currentUser);
        applyReviewValues(review, request.getRating(), request.getComment(), request.getImageUrls());

        Review savedReview = reviewRepository.save(review);
        vendorStatsService.updateVendorStats(vendorId);
        return ReviewResponse.from(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, User currentUser, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (!isAdmin && (review.getUser() == null || !review.getUser().getId().equals(currentUser.getId()))) {
            throw new SecurityException("You can only edit your own reviews");
        }

        applyReviewValues(
                review,
                request.getRating() != null ? request.getRating() : review.getRating(),
                request.getComment() != null ? request.getComment() : review.getComment(),
                request.getImageUrls() != null ? request.getImageUrls() : review.getImages().stream().map(ReviewImage::getImageUrl).toList());

        Review updatedReview = reviewRepository.save(review);
        if (review.getVendor() != null && review.getVendor().getId() != null) {
            vendorStatsService.updateVendorStats(review.getVendor().getId());
        }
        return ReviewResponse.from(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId, User currentUser, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (!isAdmin && (review.getUser() == null || !review.getUser().getId().equals(currentUser.getId()))) {
            throw new SecurityException("You can only delete your own reviews");
        }

        Long vendorId = review.getVendor() != null ? review.getVendor().getId() : null;
        reviewRepository.delete(review);
        if (vendorId != null) {
            vendorStatsService.updateVendorStats(vendorId);
        }
    }

    private void applyReviewValues(Review review, Integer rating, String comment, List<String> imageUrls) {
        validateRating(rating);
        validateComment(comment);

        review.setRating(rating);
        review.setComment(comment.trim());

        review.getImages().clear();
        if (imageUrls != null) {
            imageUrls.stream()
                    .filter(url -> url != null && !url.isBlank())
                    .map(String::trim)
                    .distinct()
                    .forEach(imageUrl -> {
                        ReviewImage image = new ReviewImage();
                        image.setReview(review);
                        image.setImageUrl(imageUrl);
                        review.getImages().add(image);
                    });
        }
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }

    private void validateComment(String comment) {
        if (comment == null || comment.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment is required");
        }
    }
}
