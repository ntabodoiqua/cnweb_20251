package com.cnweb20251.message_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * CORS Configuration cho Message Service
 * Hỗ trợ SockJS fallback (xhr-polling, xhr-streaming) cần CORS headers
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Cho phép frontend origins
        corsConfig.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "https://localhost:*",
            "https://nguyentheanh-nta.id.vn",
            "https://www.nguyentheanh-nta.id.vn",
            "http://nguyentheanh-nta.id.vn"
        ));
        
        // Cho phép các HTTP methods (cần thiết cho SockJS)
        corsConfig.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Cho phép tất cả headers
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        
        // Cho phép gửi credentials (cookies, authorization headers)
        corsConfig.setAllowCredentials(true);
        
        // Thời gian cache preflight request (1 giờ)
        corsConfig.setMaxAge(3600L);
        
        // Expose headers để frontend có thể đọc
        corsConfig.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Content-Disposition"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Đăng ký CORS cho tất cả endpoints bao gồm WebSocket
        source.registerCorsConfiguration("/**", corsConfig);

        return source;
    }
}
