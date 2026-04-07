package com.streetbite.service;

import com.streetbite.dto.report.ReportCreateRequest;
import com.streetbite.model.Report;
import com.streetbite.model.User;
import com.streetbite.repository.ReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }

    @Transactional
    public Report createReport(ReportCreateRequest request, User currentUser) {
        Report report = new Report();
        report.setReporterId(currentUser.getId());
        report.setReportedId(request.getReportedId());
        report.setType(request.getType());
        report.setCategory(request.getCategory());
        report.setSubject(request.getSubject());
        report.setDescription(request.getDescription());
        report.setEmail(request.getEmail());
        report.setRole(request.getRole());
        report.setReason(request.getReason());
        report.setStatus("PENDING");
        return reportRepository.save(report);
    }

    @Transactional
    public Optional<Report> updateStatus(Long id, String status) {
        return reportRepository.findById(id)
                .map(report -> {
                    report.setStatus(status);
                    return reportRepository.save(report);
                });
    }
}
