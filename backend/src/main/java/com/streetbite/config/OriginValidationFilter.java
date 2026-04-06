package com.streetbite.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class OriginValidationFilter extends OncePerRequestFilter {

    private static final String AUTH_COOKIE_NAME = "sb_token";
    private static final Set<String> SAFE_METHODS = Set.of(
            HttpMethod.GET.name(),
            HttpMethod.HEAD.name(),
            HttpMethod.OPTIONS.name(),
            HttpMethod.TRACE.name());

    private final AllowedOrigins allowedOrigins;

    public OriginValidationFilter(AllowedOrigins allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SAFE_METHODS.contains(request.getMethod()) || !hasAuthCookie(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String originHeader = request.getHeader("Origin");
        String refererHeader = request.getHeader("Referer");

        if (allowedOrigins.isAllowedOrigin(originHeader) || allowedOrigins.isAllowedOrigin(refererHeader)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Blocked cross-origin state-changing request\"}");
    }

    private boolean hasAuthCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return false;
        }

        for (Cookie cookie : cookies) {
            if (AUTH_COOKIE_NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return true;
            }
        }

        return false;
    }
}
