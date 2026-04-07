package com.streetbite.controller;

import com.streetbite.dto.favorite.FavoriteStatusResponse;
import com.streetbite.dto.vendor.VendorResponse;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final AuthenticatedUserService authenticatedUserService;

    public FavoriteController(
            FavoriteService favoriteService,
            AuthenticatedUserService authenticatedUserService) {
        this.favoriteService = favoriteService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping
    public ResponseEntity<?> getUserFavorites(Authentication authentication) {
        User user = resolveAuthenticatedUser(authentication);
        if (user == null) {
            return unauthorized("User not authenticated");
        }

        List<VendorResponse> favoriteVendors = favoriteService.getFavoriteVendors(user);
        return ResponseEntity.ok(favoriteVendors);
    }

    @GetMapping("/check/{vendorId}")
    public ResponseEntity<FavoriteStatusResponse> checkFavorite(@PathVariable Long vendorId, Authentication authentication) {
        User user = resolveAuthenticatedUser(authentication);
        if (user == null) {
            return ResponseEntity.ok(new FavoriteStatusResponse(false, null));
        }

        return ResponseEntity.ok(favoriteService.getFavoriteStatus(user, vendorId));
    }

    @PostMapping("/{vendorId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long vendorId, Authentication authentication) {
        User user = resolveAuthenticatedUser(authentication);
        if (user == null) {
            return unauthorized("User not authenticated");
        }

        try {
            return ResponseEntity.ok(favoriteService.addFavorite(user, vendorId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{vendorId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long vendorId, Authentication authentication) {
        User user = resolveAuthenticatedUser(authentication);
        if (user == null) {
            return unauthorized("User not authenticated");
        }

        return ResponseEntity.ok(favoriteService.removeFavorite(user, vendorId));
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }
}
