package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.request.CreateStoreCategoryRequest;
import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.service.CategoryManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/seller/stores/{storeId}/categories")
@RequiredArgsConstructor
@Slf4j
public class SellerCategoryController {

    private final CategoryManagementService categoryManagementService;

    /**
     * Seller tạo store category mới
     * POST /seller/stores/{storeId}/categories
     */
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<CategoryResponse> createStoreCategory(
            @PathVariable String storeId,
            @Valid @RequestBody CreateStoreCategoryRequest request,
            Authentication authentication) {

        log.info("Seller {} creating store category for store {}: {}",
                authentication.getName(), storeId, request.getName());

        CategoryResponse response = categoryManagementService.createStoreCategory(
                storeId,
                request,
                authentication.getName()
        );
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Seller cập nhật store category của mình
     * PUT /seller/stores/{storeId}/categories/{categoryId}
     */
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<CategoryResponse> updateStoreCategory(
            @PathVariable String storeId,
            @PathVariable String categoryId,
            @Valid @RequestBody CreateStoreCategoryRequest request,
            Authentication authentication) {

        log.info("Seller {} updating store category {} for store {}",
                authentication.getName(), categoryId, storeId);

        CategoryResponse response = categoryManagementService.updateStoreCategory(
                storeId,
                categoryId,
                request,
                authentication.getName()
        );
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Seller xóa store category của mình
     * DELETE /seller/stores/{storeId}/categories/{categoryId}
     */
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<Void> deleteStoreCategory(
            @PathVariable String storeId,
            @PathVariable String categoryId,
            Authentication authentication) {

        log.info("Seller {} deleting store category {} from store {}",
                authentication.getName(), categoryId, storeId);

        categoryManagementService.deleteStoreCategory(storeId, categoryId, authentication.getName());
        return ApiResponse.<Void>builder()
                .message("Store category deleted successfully")
                .build();
    }

    /**
     * Seller toggle trạng thái active của store category
     * PATCH /seller/stores/{storeId}/categories/{categoryId}/toggle-status
     */
    @PatchMapping("/{categoryId}/toggle-status")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<CategoryResponse> toggleStoreCategoryStatus(
            @PathVariable String storeId,
            @PathVariable String categoryId,
            Authentication authentication) {

        log.info("Seller {} toggling store category {} status for store {}",
                authentication.getName(), categoryId, storeId);

        CategoryResponse response = categoryManagementService.toggleStoreCategoryStatus(
                storeId,
                categoryId,
                authentication.getName()
        );
        String message = response.isActive()
                ? "Store category has been activated"
                : "Store category has been deactivated";
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .message(message)
                .build();
    }

    /**
     * Lấy tất cả store categories của một store
     * GET /seller/stores/{storeId}/categories
     */
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllStoreCategoriesByStoreId(
            @PathVariable String storeId) {

        log.info("Getting all store categories for store: {}", storeId);
        List<CategoryResponse> response = categoryManagementService.getAllStoreCategoriesByStoreId(storeId);
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy chi tiết một store category
     * GET /seller/stores/{storeId}/categories/{categoryId}
     */
    @GetMapping("/{categoryId}")
    public ApiResponse<CategoryResponse> getStoreCategoryById(
            @PathVariable String storeId,
            @PathVariable String categoryId) {

        log.info("Getting store category {} from store {}", categoryId, storeId);
        CategoryResponse response = categoryManagementService.getStoreCategoryById(storeId, categoryId);
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }
    /**
     * Seller cập nhật thumbnail cho store category của mình
     * POST /seller/stores/{storeId}/categories/{categoryId}/thumbnail
     */
    @PostMapping("/{categoryId}/thumbnail")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<String> updateCategoryThumbnail(
            @PathVariable String categoryId,
            @RequestParam("file") MultipartFile file) {
        log.info("Seller is updating thumbnail for category ID: {}", categoryId);
        String result = categoryManagementService.updateCategoryThumbnail(categoryId, file);
        return ApiResponse.<String>builder()
                .message("Thumbnail updated successfully")
                .result(result)
                .build();
    }
}