package com.streetbite.dto.report;

import com.streetbite.model.Report;

import java.time.LocalDateTime;

public class ReportResponse {

    private Long id;
    private Long reporterId;
    private Long reportedId;
    private String type;
    private String category;
    private String subject;
    private String description;
    private String email;
    private String role;
    private String reason;
    private String status;
    private LocalDateTime createdAt;

    public static ReportResponse from(Report report) {
        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
        response.setReporterId(report.getReporterId());
        response.setReportedId(report.getReportedId());
        response.setType(report.getType());
        response.setCategory(report.getCategory());
        response.setSubject(report.getSubject());
        response.setDescription(report.getDescription());
        response.setEmail(report.getEmail());
        response.setRole(report.getRole());
        response.setReason(report.getReason());
        response.setStatus(report.getStatus());
        response.setCreatedAt(report.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public Long getReportedId() {
        return reportedId;
    }

    public void setReportedId(Long reportedId) {
        this.reportedId = reportedId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
