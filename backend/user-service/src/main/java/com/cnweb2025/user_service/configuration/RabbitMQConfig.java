package com.cnweb2025.user_service.configuration;

import com.vdt2025.common_dto.dto.MessageType;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình RabbitMQ với khả năng mở rộng cho nhiều queue
 * Tự động tạo queue và binding cho tất cả các MessageType
 */
@Configuration
public class RabbitMQConfig {
    
    public static final String EXCHANGE_NAME = "notification-exchange";
    
    // Backward compatibility - giữ lại constants cũ
    @Deprecated
    public static final String WELCOME_EMAIL_QUEUE = "welcome-email-queue";
    @Deprecated
    public static final String ROUTING_KEY = "user.created";
    
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
    
    /**
     * Tự động tạo tất cả các queue từ MessageType enum
     */
    @Bean
    public List<Queue> queues() {
        List<Queue> queues = new ArrayList<>();
        for (MessageType messageType : MessageType.values()) {
            queues.add(new Queue(messageType.getQueueName(), true)); // durable = true
        }
        return queues;
    }
    
    /**
     * Tự động tạo binding cho tất cả các queue với routing key tương ứng
     */
    @Bean
    public List<Binding> bindings(List<Queue> queues, TopicExchange exchange) {
        List<Binding> bindings = new ArrayList<>();
        MessageType[] messageTypes = MessageType.values();
        
        for (int i = 0; i < queues.size() && i < messageTypes.length; i++) {
            bindings.add(BindingBuilder
                    .bind(queues.get(i))
                    .to(exchange)
                    .with(messageTypes[i].getRoutingKey()));
        }
        
        return bindings;
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
