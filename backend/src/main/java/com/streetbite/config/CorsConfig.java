package com.streetbite.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(resolveAllowedOrigins())
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Set-Cookie")
                .allowCredentials(true)
                .maxAge(3600);
    }

    private String[] resolveAllowedOrigins() {
        String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
        String frontendUrl = System.getenv("FRONTEND_URL");

        List<String> origins = new ArrayList<>();

        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            for (String origin : allowedOrigins.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    origins.add(trimmed);
                }
            }
        }

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            String trimmed = frontendUrl.trim();
            if (!origins.contains(trimmed)) {
                origins.add(trimmed);
            }
        }

        if (origins.isEmpty()) {
            origins.add("http://localhost:3000");
        }

        return origins.toArray(new String[0]);
    }
}
