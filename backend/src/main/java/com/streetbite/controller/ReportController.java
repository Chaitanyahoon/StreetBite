package com.streetbite.controller;

import com.streetbite.model.Report;
import com.streetbite.model.User;
import com.streetbite.repository.ReportRepository;
import com.streetbite.security.AuthenticatedUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @GetMapping("/status/{status}")
    public List<Report> getReportsByStatus(@PathVariable String status) {
        return reportRepository.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Report report, Authentication authentication) {
        try {
            User currentUser = authenticatedUserService.findAuthenticatedUser(authentication).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Login required"));
            }

            report.setReporterId(currentUser.getId());
            report.setStatus("PENDING");
            Report savedReport = reportRepository.save(report);
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        return reportRepository.findById(id)
                .map(report -> {
                    String newStatus = statusUpdate.get("status");
                    if (newStatus != null) {
                        report.setStatus(newStatus);
                        reportRepository.save(report);
                        return ResponseEntity.ok(report);
                    }
                    return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
