package com.fixkh.service;

import com.fixkh.dto.ApiDtos.*;
import com.fixkh.entity.Comment;
import com.fixkh.entity.Role;
import com.fixkh.exception.ApiException;
import com.fixkh.mapper.ApiMapper;
import com.fixkh.repository.CommentRepository;
import com.fixkh.repository.ReportRepository;
import com.fixkh.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class CommentService {
    private final CommentRepository comments;
    private final ReportRepository reports;
    private final CurrentUser current;
    private final ApiMapper mapper;
    public CommentService(CommentRepository comments, ReportRepository reports, CurrentUser current, ApiMapper mapper) {
        this.comments = comments; this.reports = reports; this.current = current; this.mapper = mapper;
    }
    @Transactional(readOnly = true)
    public List<CommentResponse> list(UUID reportId) {
        if (!reports.existsById(reportId)) throw new ApiException(HttpStatus.NOT_FOUND, "Report not found");
        return comments.findByReportIdOrderByCreatedAtAsc(reportId).stream().map(mapper::comment).toList();
    }
    @Transactional
    public CommentResponse create(UUID reportId, CommentRequest request) {
        var report = reports.findById(reportId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found"));
        Comment comment = new Comment(); comment.setReport(report); comment.setAuthor(current.user()); comment.setContent(request.content().trim());
        return mapper.comment(comments.saveAndFlush(comment));
    }
    @Transactional
    public void delete(UUID id) {
        Comment comment = comments.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Comment not found"));
        var user = current.user();
        if (user.getRole() != Role.ADMIN && !comment.getAuthor().getId().equals(user.getId()))
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the author or an administrator can delete this comment");
        comments.delete(comment);
    }
}
