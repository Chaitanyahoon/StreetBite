package com.streetbite.controller;

import com.streetbite.model.NewsletterSubscriber;
import com.streetbite.repository.NewsletterSubscriberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    @Autowired
    private NewsletterSubscriberRepository subscriberRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Validate email
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email is required"));
        }

        email = email.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid email format"));
        }

        // Check if already subscribed
        if (subscriberRepository.existsByEmail(email)) {
            return ResponseEntity.ok()
                    .body(Map.of("success", true, "message", "You're already subscribed to our newsletter!"));
        }

        try {
            // Create new subscriber
            NewsletterSubscriber subscriber = new NewsletterSubscriber(email);
            subscriber.setUnsubscribeToken(UUID.randomUUID().toString());

            subscriberRepository.save(subscriber);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message",
                    "Successfully subscribed! You'll receive updates about new vendors and exclusive offers.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", "Subscription failed. Please try again."));
        }
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email is required"));
        }

        email = email.trim().toLowerCase();

        return subscriberRepository.findByEmail(email)
                .map(subscriber -> {
                    subscriber.setIsActive(false);
                    subscriberRepository.save(subscriber);
                    return ResponseEntity.ok()
                            .body(Map.of("success", true, "message", "Successfully unsubscribed"));
                })
                .orElse(ResponseEntity.ok()
                        .body(Map.of("success", true, "message", "Email not found in our list")));
    }

    @GetMapping("/count")
    public ResponseEntity<?> getSubscriberCount() {
        long count = subscriberRepository.count();
        return ResponseEntity.ok(Map.of("count", count));
    }
    @GetMapping("/export")
    public ResponseEntity<String> exportSubscribers() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Email,SubscribedAt,IsActive\\n");
        
        subscriberRepository.findAll().forEach(subscriber -> {
            csv.append(subscriber.getId()).append(",")
               .append(subscriber.getEmail()).append(",")
               .append(subscriber.getSubscribedAt()).append(",")
               .append(subscriber.getIsActive()).append("\\n");
        });
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"subscribers.csv\"")
                .header("Content-Type", "text/csv")
                .body(csv.toString());
    }
}
