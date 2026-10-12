package com.fixkh.repository;
import com.fixkh.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByReportIdOrderByCreatedAtAsc(UUID reportId);
    long countByReportId(UUID reportId);
}
