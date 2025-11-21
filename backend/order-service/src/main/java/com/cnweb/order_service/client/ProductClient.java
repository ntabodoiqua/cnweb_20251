package com.cnweb.order_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "product-service", path = "/internal/products")
public interface ProductClient {

    /**
     * Get product information by ID
     */
    @GetMapping("/{productId}")
    ApiResponse<ProductInfoDTO> getProductById(@PathVariable("productId") String productId);

    /**
     * Get variant information by ID
     */
    @GetMapping("/variants/{variantId}")
    ApiResponse<VariantInfoDTO> getVariantById(@PathVariable("variantId") String variantId);

    /**
     * Validate multiple products availability and stock
     */
    @GetMapping("/validate")
    ApiResponse<List<ProductValidationDTO>> validateProducts(
            @RequestParam("productIds") List<String> productIds,
            @RequestParam(value = "variantIds", required = false) List<String> variantIds
    );

    /**
     * Update stock quantity after order
     */
    @GetMapping("/update-stock")
    ApiResponse<Void> updateStock(
            @RequestParam("productId") String productId,
            @RequestParam(value = "variantId", required = false) String variantId,
            @RequestParam("quantity") Integer quantity
    );
}
