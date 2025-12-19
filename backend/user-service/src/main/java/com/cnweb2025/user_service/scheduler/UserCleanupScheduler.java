package com.cnweb2025.user_service.scheduler;

import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.repository.UserRepository;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.UserHardDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler để tự động hard delete users đã soft delete quá 30 ngày
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserCleanupScheduler {

    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE_NAME = "notification-exchange";
    private static final int DAYS_BEFORE_HARD_DELETE = 30;

    /**
     * Chạy mỗi ngày lúc 2h sáng để xóa users đã soft delete hơn 30 ngày
     * Cron expression: "0 0 2 * * ?" = giây 0, phút 0, giờ 2, mọi ngày, mọi tháng, mọi ngày trong tuần
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void hardDeleteOldSoftDeletedUsers() {
        log.info("Starting scheduled hard delete of soft-deleted users older than {} days", DAYS_BEFORE_HARD_DELETE);

        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(DAYS_BEFORE_HARD_DELETE);

            // Tìm tất cả users cần hard delete
            List<User> usersToDelete = userRepository.findSoftDeletedUsersBeforeDate(cutoffDate);

            if (usersToDelete.isEmpty()) {
                log.info("No soft-deleted users found older than {} days", DAYS_BEFORE_HARD_DELETE);
                return;
            }

            log.info("Found {} users to hard delete", usersToDelete.size());

            // Gửi event cho mỗi user trước khi xóa
            for (User user : usersToDelete) {
                try {
                    // Publish event để các service khác xóa dữ liệu liên quan
                    UserHardDeletedEvent event = UserHardDeletedEvent.builder()
                            .userId(user.getId())
                            .username(user.getUsername())
                            .hardDeletedAt(LocalDateTime.now())
                            .build();

                    rabbitTemplate.convertAndSend(
                            EXCHANGE_NAME,
                            MessageType.USER_HARD_DELETED.getRoutingKey(),
                            event
                    );

                    log.info("Published USER_HARD_DELETED event for user: {} ({})",
                            user.getUsername(), user.getId());

                } catch (Exception e) {
                    log.error("Failed to publish USER_HARD_DELETED event for user: {}",
                            user.getId(), e);
                }
            }

            // Đợi một chút để các service khác xử lý
            Thread.sleep(5000);

            // Thực hiện hard delete
            int deletedCount = userRepository.hardDeleteSoftDeletedUsersBeforeDate(cutoffDate);

            log.info("Successfully hard deleted {} users", deletedCount);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Scheduler interrupted while waiting", e);
        } catch (Exception e) {
            log.error("Error occurred during hard delete process", e);
        }
    }

    /**
     * Chạy mỗi giờ để log số lượng users đã soft delete
     * Chỉ để monitoring, có thể tắt nếu không cần
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void logSoftDeletedUsersCount() {
        try {
            long count = userRepository.countSoftDeletedUsers();
            if (count > 0) {
                log.info("Current soft-deleted users count: {}", count);
            }
        } catch (Exception e) {
            log.error("Error while counting soft-deleted users", e);
        }
    }
}

