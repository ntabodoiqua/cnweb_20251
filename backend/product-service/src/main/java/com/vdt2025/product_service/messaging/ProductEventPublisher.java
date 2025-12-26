package com.vdt2025.product_service.messaging;

import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.ProductChangedMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service để publish Product events qua RabbitMQ
 * Thay thế cho ApplicationEventPublisher nội bộ
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE_NAME = "notification-exchange";
    private static final String SOURCE = "product-service";

    /**
     * Publish event khi Product được tạo mới
     */
    public void publishProductCreated(String productId) {
        publishProductEvent(productId, ProductChangedMessage.ChangeType.CREATED, 
                MessageType.PRODUCT_CREATED);
    }

    /**
     * Publish event khi Product được cập nhật
     */
    public void publishProductUpdated(String productId) {
        publishProductEvent(productId, ProductChangedMessage.ChangeType.UPDATED, 
                MessageType.PRODUCT_UPDATED);
    }

    /**
     * Publish event khi Product bị xóa
     */
    public void publishProductDeleted(String productId) {
        publishProductEvent(productId, ProductChangedMessage.ChangeType.DELETED, 
                MessageType.PRODUCT_DELETED);
    }

    /**
     * Publish event khi trạng thái Product thay đổi
     */
    public void publishProductStatusChanged(String productId) {
        publishProductEvent(productId, ProductChangedMessage.ChangeType.STATUS_CHANGED, 
                MessageType.PRODUCT_STATUS_CHANGED);
    }

    /**
     * Generic method để publish Product event
     */
    private void publishProductEvent(String productId, ProductChangedMessage.ChangeType changeType, 
                                     MessageType messageType) {
        try {
            ProductChangedMessage message = ProductChangedMessage.builder()
                    .productId(productId)
                    .changeType(changeType)
                    .timestamp(LocalDateTime.now())
                    .source(SOURCE)
                    .build();

            rabbitTemplate.convertAndSend(
                    EXCHANGE_NAME,
                    messageType.getRoutingKey(),
                    message
            );

            log.info("Published {} event for product: {}", changeType, productId);
        } catch (Exception e) {
            log.error("Failed to publish {} event for product {}: {}", 
                    changeType, productId, e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến flow chính
        }
    }
}
