package com.vdt2025.file_service.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign Client để gọi User Service và kiểm tra file references
 */
@FeignClient(name = "product-service", path = "/users")
public interface ProductServiceClient {
}
