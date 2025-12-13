package com.cnweb2025.user_service.client;

import feign.Logger;
import feign.Request;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuration cho FileService Feign Client
 * Bao gồm retry policy, timeout, error handling
 */
@Configuration
@Slf4j
public class FileServiceClientConfig {
    
    /**
     * Cấu hình retry cho Feign Client
     * - Max attempts: 3
     * - Retry interval: 1000ms
     * - Max interval: 3000ms
     */
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(1000, 3000, 3);
    }
    
    /**
     * Cấu hình timeout
     * - Connect timeout: 5s
     * - Read timeout: 30s (upload file cần timeout dài hơn)
     */
    @Bean
    public Request.Options requestOptions() {
        return new Request.Options(
            5, TimeUnit.SECONDS,   // connect timeout
            30, TimeUnit.SECONDS   // read timeout
        );
    }
    
    /**
     * Logging level cho Feign
     */
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
    
    /**
     * Custom error decoder để xử lý lỗi từ FileService
     */
    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            log.error("Error calling FileService: {} - {}", response.status(), response.reason());
            
            return switch (response.status()) {
                case 400 -> new FileServiceException("Bad request to FileService");
                case 404 -> new FileServiceException("File not found in FileService");
                case 500 -> new FileServiceException("Internal error in FileService");
                case 503 -> new FileServiceException("FileService unavailable");
                default -> new FileServiceException("Unknown error from FileService: " + response.status());
            };
        };
    }
    
    /**
     * Custom exception cho FileService errors
     */
    public static class FileServiceException extends RuntimeException {
        public FileServiceException(String message) {
            super(message);
        }
        
        public FileServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
