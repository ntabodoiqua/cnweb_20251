package com.cnweb2025.notification_service.scheduler;

import com.cnweb2025.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled jobs cho notification service
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {
    
    private final NotificationService notificationService;
    
    /**
     * Xóa notifications cũ hơn 30 ngày
     * Chạy mỗi ngày lúc 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldNotifications() {
        log.info("Starting cleanup of old notifications...");
        try {
            int deleted = notificationService.deleteOldNotifications(30);
            log.info("Cleanup completed. Deleted {} old notifications.", deleted);
        } catch (Exception e) {
            log.error("Error during notification cleanup", e);
        }
    }
}
