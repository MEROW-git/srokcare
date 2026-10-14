package com.fixkh.repository;

import com.fixkh.entity.PasswordResetCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PasswordResetCode p where p.email = :email")
    Optional<PasswordResetCode> findLockedByEmail(String email);
}
