package com.cnweb.order_service.messaging;

import com.vdt2025.common_dto.dto.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Service để gửi message đến RabbitMQ cho các sự kiện đơn hàng
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE_NAME = "notification-exchange";

    /**
     * Gửi message với MessageType cụ thể
     * @param messageType loại message (xác định routing key và queue)
     * @param payload dữ liệu cần gửi
     */
    public void publish(MessageType messageType, Object payload) {
        try {
            log.info("Publishing order event to exchange: {}, routing key: {}", 
                    EXCHANGE_NAME, messageType.getRoutingKey());
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, messageType.getRoutingKey(), payload);
            log.info("Order event published successfully for type: {}", messageType);
        } catch (Exception e) {
            log.error("Failed to publish order event: {}", e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến luồng chính của order
        }
    }
}
