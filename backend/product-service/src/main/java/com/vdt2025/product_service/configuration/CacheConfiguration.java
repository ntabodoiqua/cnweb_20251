package com.vdt2025.product_service.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfiguration {

    @Bean
    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
        return new SecurityEvaluationContextExtension();
    }

    @Bean
    public RedisCacheConfiguration redisCacheConfiguration() {
        // 1. Tạo một ObjectMapper tùy chỉnh
        ObjectMapper objectMapper = new ObjectMapper()
                // 2. Đăng ký module để xử lý LocalDateTime, ZonedDateTime, v.v.
                .registerModule(new JavaTimeModule());
        
        // 3. Enable Default Typing để lưu thông tin kiểu dữ liệu (cần thiết cho cache)
        // BasicPolymorphicTypeValidator giới hạn các class được phép để tăng bảo mật
        BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.vdt2025.product_service")
                .allowIfSubType("java.util")
                .allowIfSubType("java.time")
                .allowIfSubType("com.vdt2025.common_dto")
                .build();

        objectMapper.activateDefaultTyping(
                ptv,
                ObjectMapper.DefaultTyping.EVERYTHING
        );
        
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // 4. Tạo serializer với ObjectMapper đã được cấu hình
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        // 5. Sử dụng serializer này cho cấu hình cache
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));
    }
}
