package com.streetbite.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // Strength 10 for better startup performance on Render
    }

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public — authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()

                        // Public — read-only vendor browsing
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vendors").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vendors/search").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vendors/slug/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vendors/{id}").permitAll()

                        // Public — read-only content
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/menu/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/promotions/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/hottopics").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/announcements/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/zodiac/**").permitAll()

                        // Admin Only — administrative controls
                        .requestMatchers("/api/hottopics/admin/**").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/hottopics").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/hottopics/**").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/hottopics/**").hasRole("ADMIN")

                        // Public — newsletter & health
                        .requestMatchers("/api/newsletter/**").permitAll()
                        .requestMatchers("/api/health").permitAll()

                        // Authenticated — any logged-in user
                        .requestMatchers("/api/favorites/**").authenticated()
                        .requestMatchers("/api/gamification/**").authenticated()
                        .requestMatchers("/api/reports/**").authenticated()
                        .requestMatchers("/api/hottopics/*/comment").authenticated()
                        .requestMatchers("/api/hottopics/*/like").authenticated()

                        // Default — require authentication for everything else (admin, writes, etc.)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtRequestFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(resolveAllowedOrigins());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> resolveAllowedOrigins() {
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

        return origins;
    }
}
