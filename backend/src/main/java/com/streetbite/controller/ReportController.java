package com.streetbite.controller;

import com.streetbite.dto.report.ReportCreateRequest;
import com.streetbite.dto.report.ReportResponse;
import com.streetbite.dto.report.ReportStatusUpdateRequest;
import com.streetbite.model.Report;
import com.streetbite.model.User;
import com.streetbite.security.AuthenticatedUserService;
import com.streetbite.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final AuthenticatedUserService authenticatedUserService;

    public ReportController(ReportService reportService, AuthenticatedUserService authenticatedUserService) {
        this.reportService = reportService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping
    public ResponseEntity<?> getAllReports(Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        List<ReportResponse> reports = reportService.getAllReports().stream().map(ReportResponse::from).toList();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(@PathVariable String status, Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        List<ReportResponse> reports = reportService.getReportsByStatus(status).stream().map(ReportResponse::from).toList();
        return ResponseEntity.ok(reports);
    }

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody ReportCreateRequest request, Authentication authentication) {
        try {
            User currentUser = resolveAuthenticatedUser(authentication);
            if (currentUser == null) {
                return unauthorized("Login required");
            }

            if ((request.getDescription() == null || request.getDescription().trim().isBlank())
                    && (request.getReason() == null || request.getReason().trim().isBlank())) {
                return ResponseEntity.badRequest().body(Map.of("error", "description or reason is required"));
            }

            Report savedReport = reportService.createReport(request, currentUser);
            return ResponseEntity.ok(ReportResponse.from(savedReport));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long id,
            @RequestBody ReportStatusUpdateRequest statusUpdate,
            Authentication authentication) {
        User currentUser = resolveAuthenticatedUser(authentication);
        if (currentUser == null) {
            return unauthorized("Login required");
        }
        if (!authenticatedUserService.isAdmin(currentUser)) {
            return forbidden("Admin access only");
        }

        String newStatus = statusUpdate.getStatus();
        if (newStatus == null || newStatus.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        return reportService.updateStatus(id, newStatus.trim())
                .map(report -> {
                    return ResponseEntity.ok(ReportResponse.from(report));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User resolveAuthenticatedUser(Authentication authentication) {
        return authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, String>> forbidden(String message) {
        return ResponseEntity.status(403).body(Map.of("error", message));
    }
}
