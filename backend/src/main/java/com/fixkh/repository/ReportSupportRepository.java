package com.fixkh.repository;
import com.fixkh.entity.ReportSupport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
public interface ReportSupportRepository extends JpaRepository<ReportSupport, UUID> {
    boolean existsByReportIdAndUserId(UUID reportId, UUID userId);
    Optional<ReportSupport> findByReportIdAndUserId(UUID reportId, UUID userId);
}
