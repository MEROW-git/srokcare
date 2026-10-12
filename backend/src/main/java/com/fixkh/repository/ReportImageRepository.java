package com.fixkh.repository;
import com.fixkh.entity.ReportImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface ReportImageRepository extends JpaRepository<ReportImage, UUID> {
    List<ReportImage> findByReportIdOrderByCreatedAt(UUID reportId);
    long countByReportId(UUID reportId);
}
