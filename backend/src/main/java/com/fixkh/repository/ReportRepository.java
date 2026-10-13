package com.fixkh.repository;
import com.fixkh.entity.Report;
import com.fixkh.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
public interface ReportRepository extends JpaRepository<Report, UUID>, JpaSpecificationExecutor<Report> {
    Page<Report> findByAuthorId(UUID authorId, Pageable pageable);
    long countByAuthorId(UUID authorId);
    long countByAuthorIdAndStatus(UUID authorId, ReportStatus status);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select r from Report r where r.id = :id")
    Optional<Report> findLockedById(UUID id);
    long countByStatus(ReportStatus status);
    @Modifying @Query("update Report r set r.supportCount = r.supportCount + :delta where r.id = :id")
    void addSupportCount(UUID id, int delta);
    @Query("select r.supportCount from Report r where r.id = :id")
    int supportCount(UUID id);
}
