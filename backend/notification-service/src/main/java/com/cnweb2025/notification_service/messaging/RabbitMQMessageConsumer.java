package com.cnweb2025.notification_service.messaging;

import com.vdt2025.common_dto.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service tổng quát để nhận và xử lý message từ RabbitMQ
 * Sử dụng strategy pattern để delegate việc xử lý cho các handler cụ thể
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQMessageConsumer {

    private final RabbitTemplate rabbitTemplate;
    private final MessageHandlerRegistry handlerRegistry;
    private final Map<MessageType, Queue> messageTypeDeadLetterQueues;

    /**
     * Listener cho welcome email khi user được tạo
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).USER_CREATED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleUserCreated(UserCreatedEvent event) {
        handleMessage(MessageType.USER_CREATED, event);
    }

    /**
     * Listener cho email verification
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).EMAIL_VERIFICATION).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleEmailVerification(UserCreatedEvent event) {
        handleMessage(MessageType.EMAIL_VERIFICATION, event);
    }

    /**
     * Listener cho password reset
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PASSWORD_RESET).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handlePasswordReset(UserForgotPasswordEvent event) {
        handleMessage(MessageType.PASSWORD_RESET, event);
    }

    /**
     * Listener cho user disabled
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).USER_DISABLED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleUserDisabled(UserDisabledEvent event) {
        handleMessage(MessageType.USER_DISABLED, event);
    }

    /**
     * Listener cho user deleted
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).USER_DELETED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleUserDeleted(UserCreatedEvent event) {
        handleMessage(MessageType.USER_DELETED, event);
    }

    /**
     * Listener cho store created
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).STORE_CREATED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleStoreCreated(StoreCreatedEvent event) {
        handleMessage(MessageType.STORE_CREATED, event);
    }

    /**
     * Listener cho seller profile rejected
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).SELLER_PROFILE_REJECTED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleSellerProfileRejected(SellerProfileRejectedEvent event) {
        handleMessage(MessageType.SELLER_PROFILE_REJECTED, event);
    }

    /**
     * Listener cho payment success
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PAYMENT_SUCCESS).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        handleMessage(MessageType.PAYMENT_SUCCESS, event);
    }

    /**
     * Listener cho payment failed
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PAYMENT_FAILED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handlePaymentFailed(PaymentFailedEvent event) {
        handleMessage(MessageType.PAYMENT_FAILED, event);
    }

    /**
     * Listener cho refund success
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).REFUND_SUCCESS).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleRefundSuccess(RefundSuccessEvent event) {
        handleMessage(MessageType.REFUND_SUCCESS, event);
    }

    /**
     * Listener cho refund failed
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).REFUND_FAILED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleRefundFailed(RefundFailedEvent event) {
        handleMessage(MessageType.REFUND_FAILED, event);
    }

    // ==================== Order Event Listeners ====================

    /**
     * Listener cho order created
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_CREATED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderCreated(OrderEvent event) {
        handleMessage(MessageType.ORDER_CREATED, event);
    }

    /**
     * Listener cho order confirmed
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_CONFIRMED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderConfirmed(OrderEvent event) {
        handleMessage(MessageType.ORDER_CONFIRMED, event);
    }

    /**
     * Listener cho order shipped
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_SHIPPED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderShipped(OrderEvent event) {
        handleMessage(MessageType.ORDER_SHIPPED, event);
    }

    /**
     * Listener cho order delivered
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_DELIVERED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderDelivered(OrderEvent event) {
        handleMessage(MessageType.ORDER_DELIVERED, event);
    }

    /**
     * Listener cho order cancelled
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_CANCELLED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderCancelled(OrderEvent event) {
        handleMessage(MessageType.ORDER_CANCELLED, event);
    }

    /**
     * Listener cho order return requested
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_RETURN_REQUESTED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderReturnRequested(OrderEvent event) {
        handleMessage(MessageType.ORDER_RETURN_REQUESTED, event);
    }

    /**
     * Listener cho order return approved
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_RETURN_APPROVED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderReturnApproved(OrderEvent event) {
        handleMessage(MessageType.ORDER_RETURN_APPROVED, event);
    }

    /**
     * Listener cho order return rejected
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).ORDER_RETURN_REJECTED).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleOrderReturnRejected(OrderEvent event) {
        handleMessage(MessageType.ORDER_RETURN_REJECTED, event);
    }

    /**
     * Listener cho seller new order
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).SELLER_NEW_ORDER).name}")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2.0))
    public void handleSellerNewOrder(OrderEvent event) {
        handleMessage(MessageType.SELLER_NEW_ORDER, event);
    }

    /**
     * Phương thức chung để xử lý message
     * @param messageType Loại message
     * @param payload Dữ liệu message
     */
    @SuppressWarnings("unchecked")
    private <T> void handleMessage(MessageType messageType, T payload) {
        log.info("Received message type: {} with payload: {}", messageType, payload);
        
        try {
            MessageHandler<T> handler = (MessageHandler<T>) handlerRegistry.getHandler(messageType);
            
            if (handler == null) {
                log.warn("No handler registered for message type: {}. Skipping...", messageType);
                return;
            }
            
            handler.handle(payload);
            log.info("Successfully processed message type: {}", messageType);
            
        } catch (Exception e) {
            log.error("Failed to process message type: {} after retries. Sending to DLQ.", messageType, e);
            sendToDeadLetterQueue(messageType, payload);
            throw new RuntimeException("Message processing failed", e); // Trigger retry
        }
    }

    /**
     * Gửi message thất bại vào Dead Letter Queue
     */
    private <T> void sendToDeadLetterQueue(MessageType messageType, T payload) {
        try {
            Queue dlq = messageTypeDeadLetterQueues.get(messageType);
            if (dlq != null) {
                rabbitTemplate.convertAndSend(dlq.getName(), payload);
                log.info("Message sent to DLQ: {}", dlq.getName());
            } else {
                log.error("No DLQ configured for message type: {}", messageType);
            }
        } catch (Exception e) {
            log.error("Failed to send message to DLQ for type: {}", messageType, e);
        }
    }
}
