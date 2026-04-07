package com.streetbite.config;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.URI;

@Component
public class CookieSettings {

    private final Environment environment;

    public CookieSettings(Environment environment) {
        this.environment = environment;
    }

    public boolean isSecure() {
        String cookieSecure = environment.getProperty("COOKIE_SECURE");
        if (cookieSecure != null && !cookieSecure.isBlank()) {
            return "true".equalsIgnoreCase(cookieSecure);
        }

        String appEnv = environment.getProperty("APP_ENV");
        if (appEnv != null && appEnv.equalsIgnoreCase("production")) {
            return true;
        }

        return hasHttpsDeploymentOrigin(environment.getProperty("FRONTEND_URL"))
                || hasHttpsDeploymentOrigin(environment.getProperty("ALLOWED_ORIGINS"));
    }

    public String getSameSite() {
        String sameSite = environment.getProperty("COOKIE_SAMESITE");
        if (sameSite != null && !sameSite.isBlank()) {
            return sameSite.trim();
        }

        return isSecure() ? "None" : "Lax";
    }

    private boolean hasHttpsDeploymentOrigin(String rawOrigins) {
        if (rawOrigins == null || rawOrigins.isBlank()) {
            return false;
        }

        for (String rawOrigin : rawOrigins.split(",")) {
            String candidate = rawOrigin.trim();
            if (candidate.isBlank()) {
                continue;
            }

            try {
                URI uri = URI.create(candidate);
                String scheme = uri.getScheme();
                String host = uri.getHost();
                if ("https".equalsIgnoreCase(scheme)
                        && host != null
                        && !host.equalsIgnoreCase("localhost")
                        && !host.startsWith("127.")
                        && !host.startsWith("0.0.0.0")) {
                    return true;
                }
            } catch (IllegalArgumentException ignored) {
                // Ignore malformed env entries and continue checking the rest.
            }
        }

        return false;
    }
}
