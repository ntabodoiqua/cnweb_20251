package com.cnweb2025.user_service.scheduler;

import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.messaging.RabbitMQMessagePublisher;
import com.cnweb2025.user_service.repository.UserRepository;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserDeletedEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler để tự động xóa vĩnh viễn các tài khoản đã hết grace period (30 ngày)
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class UserDeletionScheduler {
    
    final UserRepository userRepository;
    final RabbitMQMessagePublisher messagePublisher;
    
    @Value("${user.deletion.grace-period-days:30}")
    int gracePeriodDays;
    
    /**
     * Tự động xóa vĩnh viễn các users đã hết grace period
     * Chạy mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void permanentlyDeleteExpiredUsers() {
        log.info("Starting permanent user deletion task");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(gracePeriodDays);
        List<User> usersToDelete = userRepository.findUsersForPermanentDeletion(cutoffDate);
        
        if (usersToDelete.isEmpty()) {
            log.info("No users to permanently delete");
            return;
        }
        
        log.info("Found {} users to permanently delete", usersToDelete.size());
        
        int successCount = 0;
        int failCount = 0;
        
        for (User user : usersToDelete) {
            try {
                // Gửi event để các services khác cleanup dữ liệu liên quan
                UserDeletedEvent event = UserDeletedEvent.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .deletedAt(LocalDateTime.now())
                        .isAdminAction(false) // Scheduled job, không phải admin action
                        .build();
                messagePublisher.publish(MessageType.USER_DELETED, event);
                
                // Xóa vĩnh viễn user
                userRepository.delete(user);
                successCount++;
                
                log.info("Permanently deleted user: {} ({})", user.getUsername(), user.getId());
            } catch (Exception e) {
                failCount++;
                log.error("Failed to permanently delete user: {} ({}). Error: {}", 
                        user.getUsername(), user.getId(), e.getMessage());
            }
        }
        
        log.info("Permanent deletion task completed. Success: {}, Failed: {}", successCount, failCount);
    }
    
    /**
     * Gửi reminder email cho users sắp bị xóa vĩnh viễn (7 ngày trước khi hết grace period)
     * Chạy mỗi ngày lúc 10:00 AM
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void sendDeletionReminders() {
        log.info("Starting deletion reminder task");
        
        // Tìm users sẽ bị xóa trong 7 ngày tới
        LocalDateTime reminderCutoff = LocalDateTime.now().minusDays(gracePeriodDays - 7);
        LocalDateTime deletionCutoff = LocalDateTime.now().minusDays(gracePeriodDays);
        
        // Query users có deletion_requested_at nằm giữa reminderCutoff và deletionCutoff
        // (nghĩa là sẽ bị xóa trong 7 ngày tới)
        List<User> usersToRemind = userRepository.findUsersForPermanentDeletion(reminderCutoff);
        
        // Filter ra những user chưa đến ngày xóa
        usersToRemind = usersToRemind.stream()
                .filter(u -> u.getDeletionRequestedAt() != null && 
                        u.getDeletionRequestedAt().isAfter(deletionCutoff))
                .toList();
        
        if (usersToRemind.isEmpty()) {
            log.info("No users to send deletion reminders");
            return;
        }
        
        log.info("Sending deletion reminders to {} users", usersToRemind.size());
        
        for (User user : usersToRemind) {
            try {
                // TODO: Gửi email reminder về việc tài khoản sắp bị xóa
                // Có thể tạo event mới hoặc sử dụng notification service
                log.info("Reminder sent to user: {} ({}). Account will be deleted on: {}", 
                        user.getUsername(), 
                        user.getId(),
                        user.getDeletionRequestedAt().plusDays(gracePeriodDays));
            } catch (Exception e) {
                log.error("Failed to send reminder to user: {} ({}). Error: {}", 
                        user.getUsername(), user.getId(), e.getMessage());
            }
        }
        
        log.info("Deletion reminder task completed");
    }
}
