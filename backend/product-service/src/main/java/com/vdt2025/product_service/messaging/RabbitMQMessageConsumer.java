package com.vdt2025.product_service.messaging;

import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.common_dto.dto.StoreCreatedEvent;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.service.StoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

/**
 * Service để nhận và xử lý message từ RabbitMQ
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQMessageConsumer {

    private final StoreService storeService;
    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE_NAME = "notification-exchange";

    /**
     * Listener cho seller profile approved
     * Khi nhận được message, tạo store mới và publish message sang notification service
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).SELLER_PROFILE_APPROVED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleSellerProfileApproved(SellerProfileApprovedEvent event) {
        log.info("Received SELLER_PROFILE_APPROVED event for seller profile ID: {}", event.getSellerProfileId());
        
        try {
            // Tạo store từ thông tin seller profile
            Store store = storeService.createStoreFromSellerProfile(event);
            log.info("Store created successfully with ID: {}", store.getId());
            
            // Tạo event để gửi sang notification service
            StoreCreatedEvent storeCreatedEvent = StoreCreatedEvent.builder()
                    .storeId(store.getId())
                    .userId(store.getUserId())
                    .storeName(store.getStoreName())
                    .contactEmail(store.getContactEmail())
                    .createdAt(store.getCreatedAt())
                    .build();
            
            // Publish message sang notification service
            rabbitTemplate.convertAndSend(
                    EXCHANGE_NAME, 
                    MessageType.STORE_CREATED.getRoutingKey(), 
                    storeCreatedEvent
            );
            log.info("Published STORE_CREATED event for store ID: {}", store.getId());
            
        } catch (Exception e) {
            log.error("Failed to process SELLER_PROFILE_APPROVED event for seller profile ID: {}", 
                    event.getSellerProfileId(), e);
            throw new AppException(ErrorCode.SELLER_PROFILE_PROCESSING_FAILED);
        }
    }
}
