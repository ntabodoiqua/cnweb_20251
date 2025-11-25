package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.inventory.BatchInventoryChangeRequest;
import com.vdt2025.product_service.dto.request.product.VariantsQueryRequest;
import com.vdt2025.product_service.dto.response.ProductInternalDTO;
import com.vdt2025.product_service.dto.response.ProductValidationDTO;
import com.vdt2025.product_service.dto.response.VariantInternalDTO;
import com.vdt2025.product_service.dto.response.VariantValidationDTO;
import com.vdt2025.product_service.service.InventoryService;
import com.vdt2025.product_service.service.ProductService;
import jakarta.validation.Valid;
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
    private final InventoryService inventoryService;

    /**
     * Get variant information by ID (for internal service calls)
     * POST /internal/products/variants
     */
    @PostMapping("/variants")
    public ApiResponse<List<VariantInternalDTO>> getVariantById(@RequestBody @Valid VariantsQueryRequest request) {
        log.info("Internal: Fetching variant info for IDs: {}", request.getVariantIds());

        List<VariantInternalDTO> variants = productService.getVariantsForInternal(request.getVariantIds());

        return ApiResponse.<List<VariantInternalDTO>>builder()
                .result(variants)
                .build();
    }

    /**
     * Validate multiple products and variants
     * GET /internal/products/validate
     */
    @PostMapping("/validate")
    public ApiResponse<List<VariantValidationDTO>> validateProducts(@RequestBody @Valid VariantsQueryRequest request) {
        List<String> variantIds = request.getVariantIds();
        log.info("Internal: Validating variants: {}", variantIds);

        List<VariantValidationDTO> validations = productService.validateVariants(variantIds);

        return ApiResponse.<List<VariantValidationDTO>>builder()
                .result(validations)
                .build();
    }

    /**
     * Giữ chỗ một loạt hàng hóa khi customer đặt hàng (chưa thanh toán)
     * (internal - để order-service gọi)
     */
    @PostMapping("/reserve-batch")
    public ApiResponse<Void> reserveBatch(@RequestBody @Valid BatchInventoryChangeRequest request) {
        inventoryService.reserveStockBatch(request.getItems());

        return ApiResponse.<Void>builder()
                .message("Batch inventory reserved successfully")
                .build();
    }

    /**
     * Chốt đơn cho một loạt hàng hóa khi customer thanh toán thành công
     * (internal - để order-service gọi)
     */
    @PostMapping("/confirm-batch")
    public ApiResponse<Void> confirmBatch(@RequestBody @Valid BatchInventoryChangeRequest request) {
        inventoryService.confirmSaleBatch(request.getItems());

        return ApiResponse.<Void>builder()
                .message("Inventory sale confirmed successfully")
                .build();
    }

    /**
     * Xả hàng đã giữ chỗ cho một loạt hàng hóa khi đơn hàng bị hủy hoặc timeout
     * (internal - để order-service gọi)
     */
    @PostMapping("/release-batch")
    public ApiResponse<Void> releaseBatch(@RequestBody @Valid BatchInventoryChangeRequest request) {
        inventoryService.releaseReservationBatch(request.getItems());

        return ApiResponse.<Void>builder()
                .message("Inventory reservation released successfully")
                .build();
    }

    /**
     * Trả hàng cho một loạt hàng hóa khi khách hàng thực hiện hoàn trả
     * @param request BatchInventoryChangeRequest
     * @return Void
     */

    @PostMapping("/return-batch")
    public ApiResponse<Void> returnBatch(@RequestBody @Valid BatchInventoryChangeRequest request) {

        inventoryService.returnInventoryBatch(request.getItems());

        return ApiResponse.<Void>builder()
                .message("Inventory returned successfully")
                .build();
    }




}