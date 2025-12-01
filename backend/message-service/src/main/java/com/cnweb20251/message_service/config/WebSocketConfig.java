package com.cnweb20251.message_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket với STOMP protocol cho chat service.
 * Sử dụng endpoint /ws/chat để kết nối WebSocket.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix cho các destination mà client subscribe để nhận tin nhắn
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix cho các destination mà client gửi tin nhắn đến server
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix cho các tin nhắn gửi đến user cụ thể
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để client kết nối WebSocket
        // Hỗ trợ SockJS fallback cho các browser không hỗ trợ WebSocket
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Endpoint thuần WebSocket (không SockJS)
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*");
    }
}
