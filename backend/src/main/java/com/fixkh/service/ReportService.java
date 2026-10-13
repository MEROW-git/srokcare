package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.*;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.ReportRepository;
import com.fixkh.security.CurrentUser;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fixkh.event.ReportDomainEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class ReportService {
    private final ReportRepository reports;
    private final CurrentUser current;
    private final ApiMapper mapper;
    private final ImageService images;
    private final ApplicationEventPublisher events;
    public ReportService(ReportRepository reports, CurrentUser current, ApiMapper mapper, ImageService images, ApplicationEventPublisher events) {
        this.reports = reports; this.current = current; this.mapper = mapper; this.images = images; this.events = events;
    }
    @Transactional(readOnly = true)
    public Report find(UUID id) { return reports.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found")); }
    @Transactional(readOnly = true)
    public ReportResponse get(UUID id) { return mapper.report(find(id)); }
    @Transactional(readOnly = true)
    public Page<ReportResponse> list(ReportCategory category, ReportStatus status, String province, String search, String sortBy, int page, int size) {
        Pageable pageable = pageable(sortBy, page, size);
        Specification<Report> spec = (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            if (category != null) predicates.add(cb.equal(root.get("category"), category));
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (province != null && !province.isBlank() && !province.equalsIgnoreCase("ALL")) predicates.add(cb.equal(cb.lower(root.get("province")), province.toLowerCase()));
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                predicates.add(cb.or(cb.like(cb.lower(root.get("title")), term, '\\'), cb.like(cb.lower(root.get("description")), term, '\\'),
                        cb.like(cb.lower(root.get("district")), term, '\\'), cb.like(cb.lower(root.get("address")), term, '\\')));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return reports.findAll(spec, pageable).map(mapper::report);
    }
    @Transactional(readOnly = true)
    public Page<ReportResponse> mine(int page, int size) { return reports.findByAuthorId(current.id(), pageable("latest", page, size)).map(mapper::report); }
    private Pageable pageable(String sortBy, int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new ApiException(HttpStatus.BAD_REQUEST, "page must be >= 0 and size must be 1..100");
        Sort sort = switch (sortBy == null ? "latest" : sortBy) {
            case "latest" -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
            case "popular", "most_supported" -> Sort.by(Sort.Order.desc("supportCount"), Sort.Order.desc("createdAt"));
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid sortBy value");
        };
        return PageRequest.of(page, size, sort);
    }
    @Transactional
    public ReportResponse create(ReportRequest request) {
        if (request.title().trim().length() < 5 || request.description().trim().length() < 15)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Title or description is too short");
        Report r = new Report();
        r.setAuthor(current.user()); r.setTitle(request.title().trim()); r.setDescription(request.description().trim());
        r.setCategory(request.category()); r.setLatitude(request.latitude()); r.setLongitude(request.longitude());
        r.setProvince(request.province().trim()); r.setDistrict(request.district()); r.setAddress(request.address());
        Report saved = reports.saveAndFlush(r);
        events.publishEvent(new ReportDomainEvent("REPORT_CREATED", saved.getId(), Instant.now()));
        return mapper.report(saved);
    }
    @Transactional
    public ReportResponse update(UUID id, ReportUpdateRequest request) {
        Report r = find(id); assertCanModify(r);
        if (request.title() != null) {
            if (request.title().trim().length() < 5) throw new ApiException(HttpStatus.BAD_REQUEST, "Title is too short");
            r.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            if (request.description().trim().length() < 15) throw new ApiException(HttpStatus.BAD_REQUEST, "Description is too short");
            r.setDescription(request.description().trim());
        }
        if (request.category() != null) r.setCategory(request.category());
        if (request.latitude() != null) r.setLatitude(request.latitude());
        if (request.longitude() != null) r.setLongitude(request.longitude());
        if (request.province() != null) {
            if (request.province().isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "province cannot be blank");
            r.setProvince(request.province().trim());
        }
        if (request.district() != null) r.setDistrict(request.district());
        if (request.address() != null) r.setAddress(request.address());
        reports.flush();
        events.publishEvent(new ReportDomainEvent("REPORT_UPDATED", id, Instant.now()));
        return mapper.report(r);
    }
    @Transactional
    public void delete(UUID id) {
        Report r = find(id);
        assertCanModify(r);
        images.removeFilesAfterCommit(id);
        reports.delete(r);
        events.publishEvent(new ReportDomainEvent("REPORT_DELETED", id, Instant.now()));
    }
    public void assertCanModify(Report r) {
        User user = current.user();
        if (user.getRole() == Role.ADMIN) return;
        if (!r.getAuthor().getId().equals(user.getId())) throw new ApiException(HttpStatus.FORBIDDEN, "Only the owner can modify this report");
        if (r.getStatus() != ReportStatus.REPORTED) throw new ApiException(HttpStatus.FORBIDDEN, "Reports under moderation cannot be changed by their author");
    }
}
