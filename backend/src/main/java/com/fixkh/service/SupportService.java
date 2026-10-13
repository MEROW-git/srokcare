package com.fixkh.service;

import com.fixkh.dto.ApiDtos.SupportResponse;
import com.fixkh.entity.Report;
import com.fixkh.entity.ReportSupport;
import com.fixkh.exception.ApiException;
import com.fixkh.repository.ReportRepository;
import com.fixkh.repository.ReportSupportRepository;
import com.fixkh.security.CurrentUser;
import com.fixkh.event.ReportDomainEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@Service
public class SupportService {
    private final ReportSupportRepository supports;
    private final ReportRepository reports;
    private final CurrentUser current;
    private final ApplicationEventPublisher events;
    public SupportService(ReportSupportRepository supports, ReportRepository reports, CurrentUser current, ApplicationEventPublisher events) {
        this.supports = supports; this.reports = reports; this.current = current; this.events = events;
    }
    private Report report(UUID id) { return reports.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found")); }
    @Transactional
    public SupportResponse add(UUID id) {
        Report report = report(id); UUID userId = current.id();
        if (supports.existsByReportIdAndUserId(id, userId)) throw new ApiException(HttpStatus.CONFLICT, "Report already supported");
        ReportSupport support = new ReportSupport(); support.setReport(report); support.setUser(current.user());
        supports.saveAndFlush(support); reports.addSupportCount(id, 1);
        events.publishEvent(new ReportDomainEvent("SUPPORT_CHANGED", id, Instant.now()));
        return new SupportResponse(reports.supportCount(id), true);
    }
    @Transactional
    public SupportResponse remove(UUID id) {
        Report report = report(id);
        var support = supports.findByReportIdAndUserId(id, current.id()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Support not found"));
        supports.delete(support); supports.flush(); reports.addSupportCount(id, -1);
        events.publishEvent(new ReportDomainEvent("SUPPORT_CHANGED", id, Instant.now()));
        return new SupportResponse(reports.supportCount(id), false);
    }
}
