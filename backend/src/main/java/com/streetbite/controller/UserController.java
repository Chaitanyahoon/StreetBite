package com.streetbite.controller;

import com.streetbite.service.FirestoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * User favorites management endpoints:
 * - POST /api/users/{userId}/favorites/{vendorId} - Add vendor to favorites
 * - DELETE /api/users/{userId}/favorites/{vendorId} - Remove vendor from favorites
 * - GET /api/users/{userId}/favorites - Get user's favorite vendors
 * - GET /api/users/{userId}/favorites/{vendorId}/check - Check if vendor is favorite
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final FirestoreService firestoreService;

    public UserController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping("/{userId}/favorites/{vendorId}")
    public ResponseEntity<?> addFavorite(@PathVariable String userId, @PathVariable String vendorId) {
        try {
            firestoreService.addFavorite(userId, vendorId);
            List<String> favorites = firestoreService.getUserFavorites(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Vendor added to favorites",
                "favoriteCount", favorites.size()
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to add favorite: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/favorites/{vendorId}")
    public ResponseEntity<?> removeFavorite(@PathVariable String userId, @PathVariable String vendorId) {
        try {
            firestoreService.removeFavorite(userId, vendorId);
            List<String> favorites = firestoreService.getUserFavorites(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Vendor removed from favorites",
                "favoriteCount", favorites.size()
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to remove favorite: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/favorites")
    public ResponseEntity<?> getUserFavorites(@PathVariable String userId) {
        try {
            List<String> favorites = firestoreService.getUserFavorites(userId);
            return ResponseEntity.ok(Map.of(
                "favorites", favorites,
                "count", favorites.size()
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/favorites/{vendorId}/check")
    public ResponseEntity<?> checkFavorite(@PathVariable String userId, @PathVariable String vendorId) {
        try {
            boolean isFavorite = firestoreService.isFavorite(userId, vendorId);
            return ResponseEntity.ok(Map.of(
                "isFavorite", isFavorite
            ));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

