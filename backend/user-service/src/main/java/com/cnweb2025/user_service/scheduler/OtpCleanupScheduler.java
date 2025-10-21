package com.cnweb2025.user_service.scheduler;

import com.cnweb2025.user_service.service.OtpService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OtpCleanupScheduler {
    OtpService otpService;
    
    /**
     * Tự động xóa các OTP đã hết hạn mỗi 1 giờ
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredOtpCodes() {
        log.info("Starting OTP cleanup task");
        otpService.deleteExpiredOtpCodes();
        log.info("OTP cleanup task completed");
    }
}
