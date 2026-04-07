package com.streetbite.controller;

import com.streetbite.dto.newsletter.NewsletterCountResponse;
import com.streetbite.dto.newsletter.NewsletterEmailRequest;
import com.streetbite.dto.newsletter.NewsletterResponse;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;
    private final AuthenticatedUserService authenticatedUserService;

    public NewsletterController(NewsletterService newsletterService, AuthenticatedUserService authenticatedUserService) {
        this.newsletterService = newsletterService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody NewsletterEmailRequest request) {
        try {
            NewsletterResponse response = newsletterService.subscribe(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new NewsletterResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new NewsletterResponse(false, "Subscription failed. Please try again."));
        }
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody NewsletterEmailRequest request) {
        try {
            return ResponseEntity.ok(newsletterService.unsubscribe(request.getEmail()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new NewsletterResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getSubscriberCount(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        return ResponseEntity.ok(new NewsletterCountResponse(newsletterService.getSubscriberCount()));
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportSubscribers(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"subscribers.csv\"")
                .header("Content-Type", "text/csv")
                .body(newsletterService.exportSubscribersCsv());
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
