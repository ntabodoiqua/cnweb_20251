package com.vdt2025.common_dto.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "product-service", contextId = "productServiceClient", path = "/stores")
public interface ProductServiceClient {
    @PutMapping("/{sellerProfileId}/deactivate")
    ApiResponse<Void> deactivateStore(@PathVariable String sellerProfileId);
}
