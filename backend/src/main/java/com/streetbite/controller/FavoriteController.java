package com.streetbite.controller;

import com.streetbite.model.Favorite;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.repository.FavoriteRepository;
import com.streetbite.repository.UserRepository;
import com.streetbite.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    /**
     * Get all favorite vendors for the authenticated user
     */
    @GetMapping
    public ResponseEntity<?> getUserFavorites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        List<Vendor> favoriteVendors = favoriteRepository.findFavoriteVendorsByUserId(user.getId());
        return ResponseEntity.ok(favoriteVendors);
    }

    /**
     * Check if a vendor is favorited by the user
     */
    @GetMapping("/check/{vendorId}")
    public ResponseEntity<?> checkFavorite(@PathVariable Long vendorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("isFavorite", false));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.ok(Map.of("isFavorite", false));
        }

        boolean isFavorite = favoriteRepository.existsByUserIdAndVendorId(user.getId(), vendorId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }

    /**
     * Add a vendor to favorites
     */
    @PostMapping("/{vendorId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long vendorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Vendor vendor = vendorRepository.findById(vendorId).orElse(null);
        if (vendor == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Vendor not found"));
        }

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndVendorId(user.getId(), vendorId)) {
            return ResponseEntity.ok(Map.of("message", "Already favorited", "isFavorite", true));
        }

        Favorite favorite = new Favorite(user, vendor);
        favoriteRepository.save(favorite);

        return ResponseEntity.ok(Map.of("message", "Added to favorites", "isFavorite", true));
    }

    /**
     * Remove a vendor from favorites
     */
    @DeleteMapping("/{vendorId}")
    @Transactional
    public ResponseEntity<?> removeFavorite(@PathVariable Long vendorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        favoriteRepository.deleteByUserIdAndVendorId(user.getId(), vendorId);
        return ResponseEntity.ok(Map.of("message", "Removed from favorites", "isFavorite", false));
    }
}
