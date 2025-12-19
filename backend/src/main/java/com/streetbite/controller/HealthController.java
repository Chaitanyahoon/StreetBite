package com.streetbite.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "StreetBite Backend is running!",
                "timestamp", java.time.LocalDateTime.now().toString()));
    }

    @GetMapping("/")
    public ResponseEntity<?> rootCheck() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to StreetBite API. Use /api/health to check status."));
    }
}
