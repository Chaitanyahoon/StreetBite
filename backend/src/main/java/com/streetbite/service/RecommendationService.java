package com.streetbite.service;

import com.streetbite.dto.recommend.RecommendRequest;
import com.streetbite.dto.recommend.RecommendResponse;
import com.streetbite.model.MenuItem;
import com.streetbite.model.Vendor;
import com.streetbite.model.VendorStatus;
import com.streetbite.repository.MenuItemRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final VendorRepository vendorRepository;
    private final MenuItemRepository menuItemRepository;

    // Keyword maps for scoring
    private static final Map<String, Set<String>> SPICY_KEYWORDS = Map.of(
            "mild", Set.of("mild", "plain", "cheese", "butter", "sweet", "paneer", "cream"),
            "medium", Set.of("masala", "tandoori", "tikka", "biryani", "curry"),
            "spicy", Set.of("spicy", "hot", "chilli", "mirchi", "schezwan", "vindaloo"),
            "fire", Set.of("fire", "extra spicy", "ghost pepper", "bhut", "inferno", "lava")
    );

    private static final Map<String, Set<String>> MOOD_KEYWORDS = Map.of(
            "adventurous", Set.of("special", "fusion", "unique", "exotic", "chef", "new", "signature"),
            "comfort", Set.of("classic", "homestyle", "traditional", "thali", "dal", "rice", "roti", "paratha"),
            "quick", Set.of("roll", "wrap", "sandwich", "burger", "fries", "toast", "quick", "snack", "chaat"),
            "healthy", Set.of("salad", "grilled", "steamed", "boiled", "fresh", "juice", "smoothie", "healthy", "diet")
    );

    private static final Map<String, BigDecimal[]> BUDGET_RANGES = Map.of(
            "low", new BigDecimal[]{BigDecimal.ZERO, new BigDecimal("100")},
            "medium", new BigDecimal[]{new BigDecimal("50"), new BigDecimal("300")},
            "high", new BigDecimal[]{new BigDecimal("200"), new BigDecimal("99999")}
    );

    private static final String[] MATCH_LABELS = {
            "🔥 Your perfect street food match!",
            "⭐ A stellar pick for your mood!",
            "🎯 Right on target for your cravings!",
            "💎 A hidden gem just for you!",
            "🌶️ This one hits different!",
            "🍽️ Made for your appetite!"
    };

    public RecommendationService(VendorRepository vendorRepository, MenuItemRepository menuItemRepository) {
        this.vendorRepository = vendorRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public List<RecommendResponse> recommend(RecommendRequest request) {
        List<Vendor> activeVendors = vendorRepository.findByIsActiveTrueAndStatusNotIn(
                List.of(VendorStatus.REJECTED, VendorStatus.BANNED, VendorStatus.SUSPENDED, VendorStatus.PENDING)
        );

        List<ScoredVendor> scoredVendors = new ArrayList<>();

        for (Vendor vendor : activeVendors) {
            List<MenuItem> menuItems = menuItemRepository.findByVendorIdAndAvailableTrue(vendor.getId());
            if (menuItems.isEmpty()) continue;

            int score = scoreVendor(vendor, menuItems, request);
            if (score > 0) {
                scoredVendors.add(new ScoredVendor(vendor, menuItems, score));
            }
        }

        // Sort by score (desc), then by rating (desc) as tiebreaker
        scoredVendors.sort((a, b) -> {
            int cmp = Integer.compare(b.score, a.score);
            if (cmp != 0) return cmp;
            double ratingA = a.vendor.getAverageRating() != null ? a.vendor.getAverageRating() : 0;
            double ratingB = b.vendor.getAverageRating() != null ? b.vendor.getAverageRating() : 0;
            return Double.compare(ratingB, ratingA);
        });

        // Add a small shuffle to top-scoring ties so results feel fresh
        shuffleTies(scoredVendors);

        Random rand = new Random();
        return scoredVendors.stream()
                .limit(5)
                .map(sv -> toResponse(sv, rand))
                .collect(Collectors.toList());
    }

    private int scoreVendor(Vendor vendor, List<MenuItem> items, RecommendRequest request) {
        int score = 0;

        // 1. Cuisine match (big weight)
        if (request.getCuisine() != null && !request.getCuisine().isBlank()) {
            String vendorCuisine = vendor.getCuisine() != null ? vendor.getCuisine().toLowerCase() : "";
            if (vendorCuisine.contains(request.getCuisine().toLowerCase())) {
                score += 30;
            }
        }

        // 2. Budget match
        if (request.getBudget() != null) {
            BigDecimal[] range = BUDGET_RANGES.getOrDefault(request.getBudget(), BUDGET_RANGES.get("medium"));
            long matchingItems = items.stream()
                    .filter(item -> item.getPrice() != null)
                    .filter(item -> item.getPrice().compareTo(range[0]) >= 0 && item.getPrice().compareTo(range[1]) <= 0)
                    .count();
            score += (int) Math.min(matchingItems * 5, 25);
        }

        // 3. Spice level keyword matching
        if (request.getSpiceLevel() != null) {
            Set<String> keywords = SPICY_KEYWORDS.getOrDefault(request.getSpiceLevel(), Set.of());
            long matches = items.stream()
                    .filter(item -> matchesKeywords(item, keywords))
                    .count();
            score += (int) Math.min(matches * 4, 20);
        }

        // 4. Mood keyword matching
        if (request.getMood() != null) {
            Set<String> keywords = MOOD_KEYWORDS.getOrDefault(request.getMood(), Set.of());
            long matches = items.stream()
                    .filter(item -> matchesKeywords(item, keywords))
                    .count();
            score += (int) Math.min(matches * 4, 20);
        }

        // 5. Rating bonus
        double avgRating = vendor.getAverageRating() != null ? vendor.getAverageRating() : 0;
        if (avgRating >= 4.5) score += 15;
        else if (avgRating >= 4.0) score += 10;
        else if (avgRating >= 3.0) score += 5;

        // 6. Review count trust bonus
        int reviews = vendor.getReviewCount() != null ? vendor.getReviewCount() : 0;
        if (reviews >= 20) score += 10;
        else if (reviews >= 5) score += 5;

        return score;
    }

    private boolean matchesKeywords(MenuItem item, Set<String> keywords) {
        String searchable = ((item.getName() != null ? item.getName() : "") + " " +
                (item.getDescription() != null ? item.getDescription() : "") + " " +
                (item.getCategory() != null ? item.getCategory() : "")).toLowerCase();
        return keywords.stream().anyMatch(searchable::contains);
    }

    private void shuffleTies(List<ScoredVendor> list) {
        if (list.size() <= 1) return;

        Random rand = new Random();
        int i = 0;
        while (i < list.size()) {
            int j = i;
            while (j < list.size() && list.get(j).score == list.get(i).score) {
                j++;
            }
            // Shuffle the sublist [i, j)
            if (j - i > 1) {
                List<ScoredVendor> sub = list.subList(i, j);
                Collections.shuffle(sub, rand);
            }
            i = j;
        }
    }

    private RecommendResponse toResponse(ScoredVendor sv, Random rand) {
        RecommendResponse res = new RecommendResponse();
        res.setVendorId(sv.vendor.getId());
        res.setVendorName(sv.vendor.getName());
        res.setVendorSlug(sv.vendor.getSlug());
        res.setCuisine(sv.vendor.getCuisine());
        res.setRating(sv.vendor.getAverageRating() != null ? sv.vendor.getAverageRating() : 0.0);
        res.setReviewCount(sv.vendor.getReviewCount() != null ? sv.vendor.getReviewCount() : 0);
        res.setDisplayImageUrl(sv.vendor.getDisplayImageUrl());
        res.setAddress(sv.vendor.getAddress());
        res.setMatchScore(sv.score);
        res.setMatchReason(MATCH_LABELS[rand.nextInt(MATCH_LABELS.length)]);

        List<RecommendResponse.RecommendedDish> topDishes = sv.items.stream()
                .limit(3)
                .map(item -> new RecommendResponse.RecommendedDish(
                        item.getName(),
                        item.getPrice(),
                        item.getCategory()
                ))
                .collect(Collectors.toList());
        res.setTopDishes(topDishes);

        return res;
    }

    private record ScoredVendor(Vendor vendor, List<MenuItem> items, int score) {}
}
