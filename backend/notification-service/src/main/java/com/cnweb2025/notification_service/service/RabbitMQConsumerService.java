package com.cnweb2025.notification_service.service;

import com.vdt2025.common_dto.dto.UserCreatedEvent;
import com.cnweb2025.notification_service.configuration.RabbitMQConfig;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RabbitMQConsumerService {
    
    EmailService emailService;
    RabbitTemplate rabbitTemplate;
    
    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    @Retryable(
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2.0)
    )
    public void listen(UserCreatedEvent userCreatedEvent) {
        log.info("Received UserCreatedEvent from RabbitMQ: {}", userCreatedEvent);
        try {
            emailService.sendWelcomeEmail(
                userCreatedEvent.getEmail(), 
                userCreatedEvent.getUsername(),
                userCreatedEvent.getOtpCode()
            );
            log.info("Sent welcome email with OTP to user: {}", userCreatedEvent.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to user: {}", userCreatedEvent.getEmail(), e);
            // Gửi vào Dead Letter Queue sau khi retry hết
            rabbitTemplate.convertAndSend(RabbitMQConfig.DLQ_NAME, userCreatedEvent);
            throw e; // Rethrow để trigger retry
        }
    }
}
