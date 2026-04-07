package com.streetbite.controller;

import com.streetbite.dto.announcement.AnnouncementCreateRequest;
import com.streetbite.dto.announcement.AnnouncementResponse;
import com.streetbite.dto.announcement.AnnouncementStatusUpdateRequest;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final AuthenticatedUserService authenticatedUserService;

    public AnnouncementController(
            AnnouncementService announcementService,
            AuthenticatedUserService authenticatedUserService) {
        this.announcementService = announcementService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementResponse>> getActiveAnnouncements() {
        return ResponseEntity.ok(
                announcementService.getActiveAnnouncements().stream().map(AnnouncementResponse::from).toList());
    }

    @GetMapping("/hot")
    public ResponseEntity<List<AnnouncementResponse>> getHotAnnouncements() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements().stream()
            .limit(3)
            .map(AnnouncementResponse::from)
            .toList());
    }

    @GetMapping
    public ResponseEntity<?> getAllAnnouncements(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        List<AnnouncementResponse> announcements = announcementService.getAllAnnouncements().stream()
                .map(AnnouncementResponse::from)
                .toList();
        return ResponseEntity.ok(announcements);
    }

    @PostMapping
    public ResponseEntity<?> createAnnouncement(
            @RequestBody AnnouncementCreateRequest request,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        if (request.getMessage() == null || request.getMessage().trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "message is required"));
        }
        if (request.getType() == null || request.getType().trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "type is required"));
        }

        return ResponseEntity.ok(AnnouncementResponse.from(announcementService.createAnnouncement(request)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody AnnouncementStatusUpdateRequest payload,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        Boolean isActive = payload.getIsActive();
        if (isActive == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "isActive is required"));
        }

        return announcementService.updateStatus(id, isActive)
                .map(announcement -> ResponseEntity.ok(AnnouncementResponse.from(announcement)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        if (!announcementService.deleteAnnouncement(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }
}
