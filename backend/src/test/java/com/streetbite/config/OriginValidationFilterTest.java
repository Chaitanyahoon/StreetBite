package com.streetbite.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OriginValidationFilterTest {

    @Test
    void blocksUnsafeCookieAuthenticatedRequestsFromUnknownOrigins() throws Exception {
        AllowedOrigins allowedOrigins = new AllowedOrigins(
                new MockEnvironment().withProperty("ALLOWED_ORIGINS", "https://streetbite.vercel.app"));
        OriginValidationFilter filter = new OriginValidationFilter(allowedOrigins);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/vendors/1");
        request.setCookies(new Cookie("sb_token", "jwt-token"));
        request.addHeader("Origin", "https://evil.example.com");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("Blocked cross-origin state-changing request");
    }

    @Test
    void allowsUnsafeCookieAuthenticatedRequestsFromConfiguredOrigin() throws Exception {
        AllowedOrigins allowedOrigins = new AllowedOrigins(
                new MockEnvironment().withProperty("ALLOWED_ORIGINS", "https://streetbite.vercel.app"));
        OriginValidationFilter filter = new OriginValidationFilter(allowedOrigins);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/vendors/1");
        request.setCookies(new Cookie("sb_token", "jwt-token"));
        request.addHeader("Origin", "https://streetbite.vercel.app");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
