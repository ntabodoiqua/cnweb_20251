package com.cnweb.order_service.config;

import com.vdt2025.common_dto.dto.MessageType;
import jakarta.annotation.PostConstruct;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Cấu hình RabbitMQ cho product-service
 */
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "notification-exchange";

    @Autowired
    private ConnectionFactory connectionFactory;

    /**
     * RabbitAdmin để tạo queues, exchanges, bindings động
     */
    @Bean
    public RabbitAdmin rabbitAdmin() {
        return new RabbitAdmin(connectionFactory);
    }

    /**
     * Tạo Topic Exchange cho notification
     */
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    /**
     * Tạo Map chứa tất cả các Queue dựa trên MessageType
     */
    @Bean
    public Map<MessageType, Queue> messageTypeQueues() {
        Map<MessageType, Queue> queues = new HashMap<>();
        for (MessageType messageType : MessageType.values()) {
            Queue queue = new Queue(messageType.getQueueName(), true);
            queues.put(messageType, queue);
        }
        return queues;
    }

    /**
     * Tạo Map chứa tất cả các Dead Letter Queue
     */
    @Bean
    public Map<MessageType, Queue> messageTypeDeadLetterQueues() {
        Map<MessageType, Queue> dlqs = new HashMap<>();
        for (MessageType messageType : MessageType.values()) {
            Queue dlq = new Queue(messageType.getQueueName() + ".dlq", true);
            dlqs.put(messageType, dlq);
        }
        return dlqs;
    }

    /**
     * Tạo Bindings cho tất cả các queue với routing key tương ứng
     */
    @Bean
    public List<Binding> bindings(TopicExchange exchange, Map<MessageType, Queue> messageTypeQueues) {
        List<Binding> bindings = new ArrayList<>();
        for (MessageType messageType : MessageType.values()) {
            Queue queue = messageTypeQueues.get(messageType);
            Binding binding = BindingBuilder
                    .bind(queue)
                    .to(exchange)
                    .with(messageType.getRoutingKey());
            bindings.add(binding);
        }
        return bindings;
    }

    /**
     * Khởi tạo queues, exchanges và bindings khi application start
     */
    @PostConstruct
    public void initializeRabbitMQ() {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        TopicExchange topicExchange = new TopicExchange(EXCHANGE_NAME, true, false);

        // Declare exchange
        admin.declareExchange(topicExchange);

        // Declare all queues, DLQs, and bindings
        for (MessageType messageType : MessageType.values()) {
            // Declare main queue
            Queue queue = new Queue(messageType.getQueueName(), true);
            admin.declareQueue(queue);

            // Declare DLQ
            Queue dlq = new Queue(messageType.getQueueName() + ".dlq", true);
            admin.declareQueue(dlq);

            // Declare binding
            Binding binding = BindingBuilder
                    .bind(queue)
                    .to(topicExchange)
                    .with(messageType.getRoutingKey());
            admin.declareBinding(binding);
        }
    }

    /**
     * Message Converter để tự động convert JSON sang Object
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Factory cho RabbitListener với JSON converter
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }

    /**
     * RabbitTemplate để gửi message với JSON converter
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    /**
     * Queue riêng cho order-service để lắng nghe sự kiện thanh toán thành công
     * (Tránh conflict với notification-service cùng lắng nghe payment-success-queue)
     */
    @Bean
    public Queue orderPaymentSuccessQueue() {
        return new Queue("order-service-payment-success-queue", true);
    }

    @Bean
    public Binding orderPaymentSuccessBinding(Queue orderPaymentSuccessQueue, TopicExchange exchange) {
        return BindingBuilder.bind(orderPaymentSuccessQueue)
                .to(exchange)
                .with(MessageType.PAYMENT_SUCCESS.getRoutingKey());
    }

    /**
     * Queue riêng cho order-service để lắng nghe sự kiện thanh toán thất bại
     */
    @Bean
    public Queue orderPaymentFailedQueue() {
        return new Queue("order-service-payment-failed-queue", true);
    }

    @Bean
    public Binding orderPaymentFailedBinding(Queue orderPaymentFailedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(orderPaymentFailedQueue)
                .to(exchange)
                .with(MessageType.PAYMENT_FAILED.getRoutingKey());
    }
}
