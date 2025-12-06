package com.streetbite.controller;

import com.streetbite.model.Report;
import com.streetbite.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @GetMapping("/status/{status}")
    public List<Report> getReportsByStatus(@PathVariable String status) {
        return reportRepository.findByStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Report report) {
        try {
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
