package com.streetbite.controller;

import com.streetbite.dto.recommend.RecommendRequest;
import com.streetbite.dto.recommend.RecommendResponse;
import com.streetbite.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommend")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    public ResponseEntity<?> getRecommendations(@RequestBody RecommendRequest request) {
        if (request.getMood() == null && request.getSpiceLevel() == null &&
                request.getBudget() == null && request.getCuisine() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "At least one preference (mood, spiceLevel, budget, or cuisine) is required"
            ));
        }

        List<RecommendResponse> results = recommendationService.recommend(request);

        if (results.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "results", List.of(),
                    "message", "No vendors match your taste right now. Try relaxing your preferences!"
            ));
        }

        return ResponseEntity.ok(Map.of("results", results));
    }
}
