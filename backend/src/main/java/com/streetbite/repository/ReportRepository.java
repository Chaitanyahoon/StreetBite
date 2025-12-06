package com.streetbite.repository;

import com.streetbite.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(String status);

    List<Report> findByReportedIdAndType(Long reportedId, String type);
}
