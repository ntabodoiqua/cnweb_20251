package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.ProductInternalDTO;
import com.vdt2025.product_service.dto.response.ProductValidationDTO;
import com.vdt2025.product_service.dto.response.VariantInternalDTO;
import com.vdt2025.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal API Controller for inter-service communication
 * Used by other services (order-service, etc.) to get product information
 */
@RestController
@RequestMapping("/internal/products")
@RequiredArgsConstructor
@Slf4j
public class InternalController {

    private final ProductService productService;

    /**
     * Get product information by ID (for internal service calls)
     * GET /internal/products/{productId}
     */
    @GetMapping("/{productId}")
    public ApiResponse<ProductInternalDTO> getProductById(@PathVariable String productId) {
        log.info("Internal: Fetching product info for ID: {}", productId);
        
        ProductInternalDTO product = productService.getProductForInternal(productId);
        
        return ApiResponse.<ProductInternalDTO>builder()
                .result(product)
                .build();
    }

    /**
     * Get variant information by ID (for internal service calls)
     * GET /internal/products/variants/{variantId}
     */
    @GetMapping("/variants/{variantId}")
    public ApiResponse<VariantInternalDTO> getVariantById(@PathVariable String variantId) {
        log.info("Internal: Fetching variant info for ID: {}", variantId);
        
        VariantInternalDTO variant = productService.getVariantForInternal(variantId);
        
        return ApiResponse.<VariantInternalDTO>builder()
                .result(variant)
                .build();
    }

    /**
     * Validate multiple products and variants
     * GET /internal/products/validate
     */
    @GetMapping("/validate")
    public ApiResponse<List<ProductValidationDTO>> validateProducts(
            @RequestParam List<String> productIds,
            @RequestParam(required = false) List<String> variantIds) {
        log.info("Internal: Validating products: {} with variants: {}", productIds, variantIds);
        
        List<ProductValidationDTO> validations = productService.validateProductsAndVariants(productIds, variantIds);
        
        return ApiResponse.<List<ProductValidationDTO>>builder()
                .result(validations)
                .build();
    }

    /**
     * Update stock quantity (decrease when order is placed, increase when order is cancelled)
     * POST /internal/products/update-stock
     */
    @PostMapping("/update-stock")
    public ApiResponse<Void> updateStock(
            @RequestParam String productId,
            @RequestParam(required = false) String variantId,
            @RequestParam Integer quantity) {
        log.info("Internal: Updating stock for product: {}, variant: {}, quantity: {}", 
                productId, variantId, quantity);
        
        productService.updateStock(productId, variantId, quantity);
        
        return ApiResponse.<Void>builder()
                .message("Stock updated successfully")
                .build();
    }

    /**
     * Batch update stock for multiple items
     * POST /internal/products/batch-update-stock
     */
    @PostMapping("/batch-update-stock")
    public ApiResponse<Void> batchUpdateStock(
            @RequestBody List<com.vdt2025.common_dto.dto.StockUpdateRequest> updates) {
        log.info("Internal: Batch updating stock for {} items", updates.size());
        
        productService.batchUpdateStock(updates);
        
        return ApiResponse.<Void>builder()
                .message("Stock batch updated successfully")
                .build();
    }

}