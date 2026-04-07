package com.streetbite.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class AuthRateLimitService {

    private static final Duration CACHE_TTL = Duration.ofHours(2);

    private final Cache<String, AttemptState> attempts = Caffeine.newBuilder()
            .expireAfterAccess(CACHE_TTL)
            .maximumSize(50_000)
            .build();

    public Optional<String> check(String bucket, String identifier) {
        AttemptState state = attempts.getIfPresent(buildKey(bucket, identifier));
        if (state == null || state.blockedUntil == null) {
            return Optional.empty();
        }

        if (Instant.now().isBefore(state.blockedUntil)) {
            long retryAfterSeconds = Math.max(1, Duration.between(Instant.now(), state.blockedUntil).getSeconds());
            return Optional.of("Too many attempts. Try again in " + retryAfterSeconds + " seconds.");
        }

        attempts.invalidate(buildKey(bucket, identifier));
        return Optional.empty();
    }

    public void recordFailure(
            String bucket,
            String identifier,
            int maxAttempts,
            Duration window,
            Duration blockDuration) {
        String cacheKey = buildKey(bucket, identifier);
        Instant now = Instant.now();

        attempts.asMap().compute(cacheKey, (key, existing) -> {
            if (existing == null || Duration.between(existing.windowStartedAt, now).compareTo(window) > 0) {
                return new AttemptState(1, now, null);
            }

            int nextAttempts = existing.attempts + 1;
            Instant blockedUntil = nextAttempts >= maxAttempts ? now.plus(blockDuration) : null;
            return new AttemptState(nextAttempts, existing.windowStartedAt, blockedUntil);
        });
    }

    public void reset(String bucket, String identifier) {
        attempts.invalidate(buildKey(bucket, identifier));
    }

    public void throttle(String bucket, String identifier, Duration cooldown) {
        String cacheKey = buildKey(bucket, identifier);
        Instant now = Instant.now();
        attempts.put(cacheKey, new AttemptState(1, now, now.plus(cooldown)));
    }

    private String buildKey(String bucket, String identifier) {
        return bucket + "::" + identifier;
    }

    private static final class AttemptState {
        private final int attempts;
        private final Instant windowStartedAt;
        private final Instant blockedUntil;

        private AttemptState(int attempts, Instant windowStartedAt, Instant blockedUntil) {
            this.attempts = attempts;
            this.windowStartedAt = windowStartedAt;
            this.blockedUntil = blockedUntil;
        }
    }
}
