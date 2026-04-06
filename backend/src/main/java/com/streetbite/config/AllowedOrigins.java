package com.streetbite.config;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class AllowedOrigins {

    private final List<String> allowedOrigins;

    public AllowedOrigins(Environment environment) {
        this.allowedOrigins = Collections.unmodifiableList(resolveAllowedOrigins(environment));
    }

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public boolean isAllowedOrigin(String originOrUrl) {
        if (originOrUrl == null || originOrUrl.isBlank()) {
            return false;
        }

        String normalized = normalizeToOrigin(originOrUrl.trim());
        return normalized != null && allowedOrigins.contains(normalized);
    }

    private List<String> resolveAllowedOrigins(Environment environment) {
        String allowedOriginsValue = environment.getProperty("ALLOWED_ORIGINS");
        String frontendUrl = environment.getProperty("FRONTEND_URL");

        List<String> origins = new ArrayList<>();

        addOrigins(origins, allowedOriginsValue);
        addOrigins(origins, frontendUrl);

        if (origins.isEmpty()) {
            origins.add("http://localhost:3000");
        }

        return origins;
    }

    private void addOrigins(List<String> origins, String rawOrigins) {
        if (rawOrigins == null || rawOrigins.isBlank()) {
            return;
        }

        for (String origin : rawOrigins.split(",")) {
            String normalized = normalizeToOrigin(origin.trim());
            if (normalized != null && !origins.contains(normalized)) {
                origins.add(normalized);
            }
        }
    }

    private String normalizeToOrigin(String value) {
        try {
            URI uri = URI.create(value);
            if (uri.getScheme() == null || uri.getHost() == null) {
                return null;
            }

            StringBuilder origin = new StringBuilder()
                    .append(uri.getScheme())
                    .append("://")
                    .append(uri.getHost());

            if (uri.getPort() != -1) {
                origin.append(":").append(uri.getPort());
            }

            return origin.toString();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
