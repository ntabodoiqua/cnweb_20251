package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.OtpCode;
import com.cnweb2025.user_service.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, String> {
    Optional<OtpCode> findByUserIdAndTypeAndExpiryTimeGreaterThan(String userId, OtpType type, Long currentTime);
    
    Optional<OtpCode> findByUserIdAndType(String userId, OtpType type);
    
    void deleteByUserIdAndType(String userId, OtpType type);
    
    void deleteByExpiryTimeLessThan(Long currentTime);
}
