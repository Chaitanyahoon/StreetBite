package com.streetbite.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Cache configuration for cost-optimized geolocation flow
 * 
 * Caches:
 * 1. vendorSearch - Search results cache (5-10 minutes)
 * 2. geocodingCache - Geocoding results cache (permanent in Firestore, in-memory for performance)
 */
@Configuration
public class CacheConfig {

    /**
     * Cache manager with multiple cache configurations
     * 
     * Registers two separate caches:
     * 1. vendorSearch - For search results (10 min TTL)
     * 2. geocodingCache - For geocoding results (24h TTL)
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        
        // Configure vendor search cache (10 minutes TTL)
        manager.registerCustomCache("vendorSearch", 
            Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(10))
                .maximumSize(10_000)
                .recordStats()
                .build());
        
        // Configure geocoding cache (24 hours TTL)
        manager.registerCustomCache("geocodingCache",
            Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofHours(24))
                .maximumSize(5_000)
                .recordStats()
                .build());
        
        return manager;
    }
}
