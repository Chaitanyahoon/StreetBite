package com.streetbite.controller;

import com.streetbite.dto.health.HealthStatusResponse;
import com.streetbite.dto.health.RootMessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<HealthStatusResponse> healthCheck() {
        return ResponseEntity.ok(new HealthStatusResponse(
                "UP",
                "StreetBite Backend is running!",
                java.time.LocalDateTime.now().toString()));
    }

    @GetMapping("/")
    public ResponseEntity<RootMessageResponse> rootCheck() {
        return ResponseEntity.ok(new RootMessageResponse(
                "Welcome to StreetBite API. Use /api/health to check status."));
    }
}
