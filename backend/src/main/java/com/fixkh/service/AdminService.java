package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.ReportStatus;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.CommentRepository;
import com.fixkh.repository.ReportRepository;
import com.fixkh.repository.ReportSupportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class AdminService {
    private final ReportRepository reports;
    private final ReportSupportRepository supports;
    private final CommentRepository comments;
    private final ApiMapper mapper;
    public AdminService(ReportRepository reports, ReportSupportRepository supports, CommentRepository comments, ApiMapper mapper) {
        this.reports = reports; this.supports = supports; this.comments = comments; this.mapper = mapper;
    }
    @Transactional
    public ReportResponse status(UUID id, StatusRequest request) {
        var report = reports.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setStatus(request.status());
        if (request.adminNote() != null) report.setAdminNote(request.adminNote().trim());
        reports.flush(); return mapper.report(report);
    }
    @Transactional(readOnly = true)
    public AdminStats stats() {
        return new AdminStats(reports.count(), reports.countByStatus(ReportStatus.REPORTED), reports.countByStatus(ReportStatus.UNDER_REVIEW),
                reports.countByStatus(ReportStatus.IN_PROGRESS), reports.countByStatus(ReportStatus.RESOLVED),
                reports.countByStatus(ReportStatus.REJECTED), supports.count(), comments.count());
    }
}
