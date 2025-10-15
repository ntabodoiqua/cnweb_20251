package com.vdt2025.notification_service.service;

import com.vdt2025.common_dto.dto.UserCreatedEvent;
import com.vdt2025.notification_service.dto.UserWelcomeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class KafkaConsumerService {
    EmailService emailService;
    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 1000, multiplier = 2.0),
            topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE
    )
    @KafkaListener(topics = "welcome-email-topic", groupId = "notification-service")
    public void listen(UserCreatedEvent userCreatedEvent, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("Received UserWelcomeMessage from topic {}: {}", topic, userCreatedEvent);
        try {
            emailService.sendWelcomeEmail(userCreatedEvent.getEmail(), userCreatedEvent.getUsername());
            log.info("Sent welcome email to user: {}", userCreatedEvent.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to user: {}", userCreatedEvent.getEmail(), e);
            throw e; // Rethrow to trigger retry
        }
    }

    @DltHandler
    public void dltListen(UserCreatedEvent userCreatedEvent, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.error("Failed to process UserWelcomeMessage from topic {} after retries: {}", topic, userCreatedEvent);
        // Gửi email lỗi cho quản trị viên
        emailService.sendErrorEmailToAdmin("Failed to process UserWelcomeMessage after retries: " + userCreatedEvent);
    }
}
