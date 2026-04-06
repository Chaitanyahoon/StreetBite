package com.streetbite.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class AllowedOriginsTest {

    @Test
    void normalizesAndMatchesOriginAndRefererUrls() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("ALLOWED_ORIGINS", "https://streetbite.vercel.app, https://preview.streetbite.app")
                .withProperty("FRONTEND_URL", "https://streetbite.vercel.app");

        AllowedOrigins allowedOrigins = new AllowedOrigins(environment);

        assertThat(allowedOrigins.getAllowedOrigins())
                .contains("https://streetbite.vercel.app", "https://preview.streetbite.app");
        assertThat(allowedOrigins.isAllowedOrigin("https://streetbite.vercel.app")).isTrue();
        assertThat(allowedOrigins.isAllowedOrigin("https://streetbite.vercel.app/vendor/dashboard")).isTrue();
        assertThat(allowedOrigins.isAllowedOrigin("https://malicious.example.com")).isFalse();
    }
}
