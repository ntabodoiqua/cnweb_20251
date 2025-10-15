package com.vdt2025.user_service.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
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

        // 2. Lưu thông tin kiểu dữ liệu vào JSON để deserialization chính xác
        objectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder().allowIfBaseType(Object.class).build(),
                ObjectMapper.DefaultTyping.NON_FINAL
        );

        // 3. Tạo serializer với ObjectMapper đã được cấu hình
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        // 4. Sử dụng serializer này cho cấu hình cache
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));
    }
}