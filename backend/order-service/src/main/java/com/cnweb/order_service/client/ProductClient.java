package com.cnweb.order_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

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
    @PostMapping("/variants")
    ApiResponse<List<VariantInternalDTO>> getVariants(@RequestBody @Valid VariantsQueryRequest request);

    /**
     * Validate multiple variants
     * POST /internal/products/validate
     */
    @PostMapping("/validate")
    ApiResponse<List<VariantValidationDTO>> validateVariants(@RequestBody @Valid VariantsQueryRequest request);


    /**
     * Giữ chỗ một loạt hàng hóa khi customer đặt hàng (chưa thanh toán)
     * POST /internal/products/reserve-batch
     */
    @PostMapping("/reserve-batch")
    ApiResponse<Void> reserveBatch(@RequestBody @Valid BatchInventoryChangeRequest request);

    /**
     * Chốt đơn cho một loạt hàng hóa khi customer thanh toán thành công
     * POST /internal/products/confirm-batch
     */
    @PostMapping("/confirm-batch")
    ApiResponse<Void> confirmBatch(@RequestBody @Valid BatchInventoryChangeRequest request);

    /**
     * Xả hàng đã giữ chỗ cho một loạt hàng hóa khi đơn hàng bị hủy hoặc timeout
     * POST /internal/products/release-batch
     */
    @PostMapping("/release-batch")
    ApiResponse<Void> releaseBatch(@RequestBody @Valid BatchInventoryChangeRequest request);

    /**
     * Trả hàng cho một loạt hàng hóa khi khách hàng thực hiện hoàn trả
     * POST /internal/products/return-batch
     */

    @PostMapping("/return-batch")
    ApiResponse<Void> returnBatch(@RequestBody @Valid BatchInventoryChangeRequest request);

    /**
     * Validate if a user owns a store
     * GET /internal/products/stores/{storeId}/validate-owner
     */
    @GetMapping("/stores/{storeId}/validate-owner")
    ApiResponse<Boolean> validateStoreOwner(@PathVariable("storeId") String storeId, @RequestParam("username") String username);
}