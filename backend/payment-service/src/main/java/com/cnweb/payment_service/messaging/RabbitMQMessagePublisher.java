package com.cnweb.payment_service.messaging;

import com.vdt2025.common_dto.dto.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Service để gửi message đến RabbitMQ một cách linh hoạt
 * Hỗ trợ gửi đến nhiều queue khác nhau thông qua MessageType
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQMessagePublisher {
    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE_NAME = "notification-exchange";

    /**
     * Gửi message với MessageType cụ thể
     * @param messageType loại message (xác định routing key và queue)
     * @param payload dữ liệu cần gửi
     */
    public void publish(MessageType messageType, Object payload) {
        try {
            log.info("Publishing message to exchange: {}, routing key: {}, queue: {}",
                    EXCHANGE_NAME, messageType.getRoutingKey(), messageType.getQueueName());
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, messageType.getRoutingKey(), payload);
            log.info("Message published successfully");
        } catch (Exception e) {
            log.error("Failed to publish message: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish message to RabbitMQ", e);
        }
    }

    /**
     * Gửi message với routing key tùy chỉnh
     * @param routingKey routing key tùy chỉnh
     * @param payload dữ liệu cần gửi
     */
    public void publishWithCustomRoutingKey(String routingKey, Object payload) {
        try {
            log.info("Publishing message to exchange: {} with custom routing key: {}",
                    EXCHANGE_NAME, routingKey);
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, routingKey, payload);
            log.info("Message published successfully");
        } catch (Exception e) {
            log.error("Failed to publish message: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish message to RabbitMQ", e);
        }
    }

    /**
     * Gửi message đến exchange và routing key tùy chỉnh hoàn toàn
     * @param exchange tên exchange
     * @param routingKey routing key
     * @param payload dữ liệu cần gửi
     */
    public void publishToCustomExchange(String exchange, String routingKey, Object payload) {
        try {
            log.info("Publishing message to custom exchange: {}, routing key: {}",
                    exchange, routingKey);
            rabbitTemplate.convertAndSend(exchange, routingKey, payload);
            log.info("Message published successfully");
        } catch (Exception e) {
            log.error("Failed to publish message: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish message to RabbitMQ", e);
        }
    }
}
