package com.streetbite.config;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

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
        return appEnv != null && appEnv.equalsIgnoreCase("production");
    }

    public String getSameSite() {
        String sameSite = environment.getProperty("COOKIE_SAMESITE");
        if (sameSite != null && !sameSite.isBlank()) {
            return sameSite.trim();
        }

        return isSecure() ? "None" : "Lax";
    }
}
