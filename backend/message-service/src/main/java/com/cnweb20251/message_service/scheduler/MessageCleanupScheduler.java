package com.cnweb20251.message_service.scheduler;

import com.cnweb20251.message_service.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Scheduled task để tự động xóa các tin nhắn cũ hơn 90 ngày.
 * Chạy mỗi ngày lúc 2:00 AM.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class MessageCleanupScheduler {

    private final MessageRepository messageRepository;

    /**
     * Số ngày giữ lại tin nhắn (mặc định 90 ngày).
     */
    @Value("${chat.message.retention-days:90}")
    private int retentionDays;

    /**
     * Xóa tin nhắn cũ hơn 90 ngày.
     * Chạy mỗi ngày lúc 2:00 AM.
     */
    @Scheduled(cron = "${chat.cleanup.cron:0 0 2 * * ?}")
    public void cleanupOldMessages() {
        log.info("Starting message cleanup task...");
        
        try {
            Instant cutoffDate = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
            
            // Đếm số tin nhắn sẽ bị xóa
            long countToDelete = messageRepository.findMessagesBefore(cutoffDate).size();
            
            if (countToDelete == 0) {
                log.info("No messages older than {} days found. Cleanup completed.", retentionDays);
                return;
            }
            
            // Xóa tin nhắn
            messageRepository.deleteAllBySentAtBefore(cutoffDate);
            
            log.info("Message cleanup completed. Deleted {} messages older than {} days.", 
                    countToDelete, retentionDays);
            
        } catch (Exception e) {
            log.error("Error during message cleanup: ", e);
        }
    }

    /**
     * Xóa tin nhắn thủ công (dùng cho testing hoặc admin).
     */
    public long cleanupMessages(int days) {
        log.info("Manual message cleanup triggered for messages older than {} days", days);
        
        Instant cutoffDate = Instant.now().minus(days, ChronoUnit.DAYS);
        long countToDelete = messageRepository.findMessagesBefore(cutoffDate).size();
        
        if (countToDelete > 0) {
            messageRepository.deleteAllBySentAtBefore(cutoffDate);
        }
        
        log.info("Deleted {} messages", countToDelete);
        return countToDelete;
    }
}
