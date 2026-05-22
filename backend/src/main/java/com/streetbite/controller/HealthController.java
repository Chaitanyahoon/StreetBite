package com.streetbite.controller;

import com.streetbite.dto.health.HealthStatusResponse;
import com.streetbite.dto.health.RootMessageResponse;
import com.streetbite.service.DatabaseBackupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DatabaseBackupService databaseBackupService;

    public HealthController(DatabaseBackupService databaseBackupService) {
        this.databaseBackupService = databaseBackupService;
    }

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

    @PostMapping("/health/backup")
    public ResponseEntity<?> triggerBackup(@RequestParam(required = false) String secret) {
        String envSecret = System.getenv("BACKUP_SECRET_KEY");
        if (envSecret != null && !envSecret.trim().isEmpty() && !envSecret.equals(secret)) {
            return ResponseEntity.status(403).body(Map.of("error", "Invalid or missing backup secret"));
        }

        Map<String, Object> result = databaseBackupService.performBackup();
        if ("FAILED".equals(result.get("status"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
