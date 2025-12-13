package com.cnweb2025.user_service.saga;

import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

/**
 * Retry manager cho Saga operations
 * Cung cấp retry logic với exponential backoff
 */
@Component
@Slf4j
public class SagaRetryManager {
    
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long INITIAL_BACKOFF = 1000L; // 1 second
    private static final long MAX_BACKOFF = 5000L; // 5 seconds
    
    /**
     * Thực thi một operation với retry logic
     * 
     * @param operation Operation cần thực thi
     * @param operationName Tên operation (để log)
     * @param <T> Return type
     * @return Kết quả của operation
     */
    @Retryable(
        maxAttempts = MAX_RETRY_ATTEMPTS,
        backoff = @Backoff(
            delay = INITIAL_BACKOFF,
            maxDelay = MAX_BACKOFF,
            multiplier = 2.0
        )
    )
    public <T> T executeWithRetry(Supplier<T> operation, String operationName) {
        log.debug("Executing {} with retry support", operationName);
        
        try {
            return operation.get();
        } catch (Exception e) {
            log.warn("Operation {} failed, will retry if possible. Error: {}", 
                operationName, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Thực thi operation với retry và recovery callback
     * 
     * @param operation Operation cần thực thi
     * @param operationName Tên operation
     * @param recoveryCallback Callback khi tất cả retry đều fail
     * @param <T> Return type
     * @return Kết quả của operation hoặc recovery
     */
    public <T> T executeWithRetryAndRecovery(
            Supplier<T> operation, 
            String operationName,
            Supplier<T> recoveryCallback) {
        
        int attempt = 0;
        long backoff = INITIAL_BACKOFF;
        
        while (attempt < MAX_RETRY_ATTEMPTS) {
            try {
                log.debug("Attempting {} (attempt {}/{})", operationName, attempt + 1, MAX_RETRY_ATTEMPTS);
                return operation.get();
                
            } catch (Exception e) {
                attempt++;
                
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    log.error("All {} retry attempts failed for {}", MAX_RETRY_ATTEMPTS, operationName);
                    
                    if (recoveryCallback != null) {
                        log.info("Executing recovery callback for {}", operationName);
                        return recoveryCallback.get();
                    }
                    throw e;
                }
                
                log.warn("Attempt {} failed for {}, retrying in {}ms. Error: {}", 
                    attempt, operationName, backoff, e.getMessage());
                
                try {
                    Thread.sleep(backoff);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrupted", ie);
                }
                
                backoff = Math.min(backoff * 2, MAX_BACKOFF);
            }
        }
        
        throw new RuntimeException("Unexpected error in retry logic");
    }
}
