package com.streetbite.config;

import com.streetbite.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "sb_token";

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.streetbite.repository.UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String jwt = null;
        String email = null;

        // 1. Try to read JWT from the HttpOnly cookie first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // 2. Fallback to Authorization header (backward compatible)
        if (jwt == null) {
            final String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
            }
        }

        // 3. Extract email from JWT
        if (jwt != null) {
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                // Token invalid or expired — ignore
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Check if user exists and is active in DB
            java.util.Optional<com.streetbite.model.User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent() && userOpt.get().getActive()) {
                if (jwtUtil.validateToken(jwt, email)) {
                    // Extract role from JWT and create authorities
                    String role = jwtUtil.extractRole(jwt);
                    java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
                    if (role != null) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
                    }

                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            email, null, authorities);
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            }
        }
        chain.doFilter(request, response);
    }
}
