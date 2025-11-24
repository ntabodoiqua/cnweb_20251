package com.cnweb.order_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Feign client for product-service internal APIs
 */
@FeignClient(name = "product-service", path = "/internal/products")
public interface ProductClient {

    /**
     * Get variant information by IDs
     * POST /internal/products/variants
     */
    @GetMapping("/variants")
    ApiResponse<List<VariantInternalDTO>> getVariants(@RequestBody @Valid VariantsQueryRequest request);

    /**
     * Validate multiple variants
     * GET /internal/products/validate
     */
    @GetMapping("/validate")
    ApiResponse<List<VariantValidationDTO>> validateVariants(@RequestBody @Valid VariantsQueryRequest request);
}
