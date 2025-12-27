package com.vdt2025.product_service.messaging;

import com.vdt2025.common_dto.dto.UserHardDeletedEvent;
import com.vdt2025.common_dto.dto.UserSoftDeletedEvent;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handler để xử lý các event liên quan đến user deletion
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserDeletionEventHandler {

    private final StoreRepository storeRepository;

    /**
     * Xử lý event khi user bị soft delete
     * Tắt/ẩn store của user nhưng không xóa dữ liệu
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).USER_SOFT_DELETED).name}")
    @Transactional
    public void handleUserSoftDeleted(UserSoftDeletedEvent event) {
        log.info("Received USER_SOFT_DELETED event for user: {} ({})", event.getUsername(), event.getUserId());

        try {
            // Tìm store của user
            storeRepository.findByUserName(event.getUserId()).ifPresent(store -> {
                // TODO: Có thể thêm trường 'active' hoặc 'deleted' vào Store entity
                // Ở đây chỉ log ra, bạn có thể implement logic disable store
                log.info("Store {} of user {} should be disabled/hidden", store.getId(), event.getUserId());

                // Ví dụ: store.setActive(false);
                // storeRepository.save(store);
            });

            log.info("Successfully processed USER_SOFT_DELETED event for user: {}", event.getUserId());

        } catch (Exception e) {
            log.error("Failed to process USER_SOFT_DELETED event for user: {}", event.getUserId(), e);
            throw e; // Để RabbitMQ retry
        }
    }

    /**
     * Xử lý event khi user bị hard delete (sau 30 ngày)
     * Xóa hoàn toàn tất cả dữ liệu liên quan đến user
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).USER_HARD_DELETED).name}")
    @Transactional
    public void handleUserHardDeleted(UserHardDeletedEvent event) {
        log.info("Received USER_HARD_DELETED event for user: {} ({})", event.getUsername(), event.getUserId());

        try {
            // Xóa store của user
            storeRepository.findByUserName(event.getUserId()).ifPresent(store -> {
                log.info("Deleting store {} of user {}", store.getId(), event.getUserId());

                // Xóa store sẽ cascade delete các products và dữ liệu liên quan
                // (nếu đã cấu hình cascade trong entity)
                storeRepository.delete(store);

                log.info("Successfully deleted store {} of user {}", store.getId(), event.getUserId());
            });

            log.info("Successfully processed USER_HARD_DELETED event for user: {}", event.getUserId());

        } catch (Exception e) {
            log.error("Failed to process USER_HARD_DELETED event for user: {}", event.getUserId(), e);
            throw e; // Để RabbitMQ retry
        }
    }
}

