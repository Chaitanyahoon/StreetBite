package com.streetbite.controller;

import com.streetbite.dto.menu.MenuItemCreateRequest;
import com.streetbite.dto.menu.MenuItemUpdateRequest;
import com.streetbite.model.MenuItem;
import com.streetbite.model.User;
import com.streetbite.model.Vendor;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.MenuService;
import com.streetbite.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;
    private final VendorService vendorService;
    private final AuthenticatedUserService authenticatedUserService;

    public MenuController(
            MenuService menuService,
            VendorService vendorService,
            AuthenticatedUserService authenticatedUserService) {
        this.menuService = menuService;
        this.vendorService = vendorService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<MenuItem>> getMenuByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(menuService.getMenuByVendor(vendorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItem(@PathVariable Long id) {
        return menuService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItemCreateRequest request, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        try {
            if (request.getVendorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vendor ID is required"));
            }
            Vendor vendor = vendorService.getVendorById(request.getVendorId()).orElse(null);
            if (vendor == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vendor not found"));
            }
            if (!canManageVendorMenu(currentUser, vendor)) {
                return forbidden("You do not have permission to manage this menu");
            }
            validateImageUrl(request.getImageUrl());

            MenuItem savedItem = menuService.createMenuItem(request);
            return ResponseEntity.ok(savedItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItemUpdateRequest updates,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        return menuService.getMenuItemById(id)
                .map(existingItem -> {
                    if (!canManageMenuItem(currentUser, existingItem)) {
                        return forbidden("You do not have permission to manage this menu");
                    }

                    try {
                        validateImageUrl(updates.getImageUrl());
                        return ResponseEntity.ok(menuService.updateMenuItem(existingItem, updates));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Invalid session. Please log in again");
        }

        return menuService.getMenuItemById(id)
                .map(menuItem -> {
                    if (!canManageMenuItem(currentUser, menuItem)) {
                        return forbidden("You do not have permission to manage this menu");
                    }

                    try {
                        menuService.deleteMenuItem(id);
                        return ResponseEntity.ok(Map.of("success", true));
                    } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private boolean canManageVendorMenu(User currentUser, Vendor vendor) {
        if (currentUser == null || vendor == null) {
            return false;
        }
        if (authenticatedUserService.isAdmin(currentUser)) {
            return true;
        }
        return vendor.getOwner() != null && Objects.equals(vendor.getOwner().getId(), currentUser.getId());
    }

    private boolean canManageMenuItem(User currentUser, MenuItem menuItem) {
        return menuItem != null && canManageVendorMenu(currentUser, menuItem.getVendor());
    }

    private void validateImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        if (imageUrl.startsWith("data:image/")) {
            return;
        }
        try {
            URI uri = new URI(imageUrl);
            String scheme = uri.getScheme();
            if (!"http".equals(scheme) && !"https".equals(scheme)) {
                throw new IllegalArgumentException("Invalid image URL");
            }
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Invalid image URL");
        }
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }
}
