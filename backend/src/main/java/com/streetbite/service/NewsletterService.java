package com.streetbite.service;

import com.streetbite.dto.newsletter.NewsletterResponse;
import com.streetbite.model.NewsletterSubscriber;
import com.streetbite.repository.NewsletterSubscriberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class NewsletterService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final NewsletterSubscriberRepository subscriberRepository;

    public NewsletterService(NewsletterSubscriberRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    @Transactional
    public NewsletterResponse subscribe(String rawEmail) {
        String email = normalizeAndValidateEmail(rawEmail);

        if (subscriberRepository.existsByEmail(email)) {
            return new NewsletterResponse(true, "You're already subscribed to our newsletter!");
        }

        NewsletterSubscriber subscriber = new NewsletterSubscriber(email);
        subscriber.setUnsubscribeToken(UUID.randomUUID().toString());
        subscriberRepository.save(subscriber);

        return new NewsletterResponse(
                true,
                "Successfully subscribed! You'll receive updates about new vendors and exclusive offers.");
    }

    @Transactional
    public NewsletterResponse unsubscribe(String rawEmail) {
        String email = normalizeAndValidateEmail(rawEmail);

        return subscriberRepository.findByEmail(email)
                .map(subscriber -> {
                    subscriber.setIsActive(false);
                    subscriberRepository.save(subscriber);
                    return new NewsletterResponse(true, "Successfully unsubscribed");
                })
                .orElseGet(() -> new NewsletterResponse(true, "Email not found in our list"));
    }

    public long getSubscriberCount() {
        return subscriberRepository.count();
    }

    public String exportSubscribersCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Email,SubscribedAt,IsActive\\n");

        subscriberRepository.findAll().forEach(subscriber -> {
            csv.append(subscriber.getId()).append(",")
                    .append(subscriber.getEmail()).append(",")
                    .append(subscriber.getSubscribedAt()).append(",")
                    .append(subscriber.getIsActive()).append("\\n");
        });

        return csv.toString();
    }

    private String normalizeAndValidateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        String normalized = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        return normalized;
    }
}
