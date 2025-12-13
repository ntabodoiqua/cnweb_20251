package com.cnweb2025.user_service.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

/**
 * Configuration để enable Spring Retry
 */
@Configuration
@EnableRetry
public class RetryConfiguration {
}
