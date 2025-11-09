package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.service.CategoryManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public Controller để xem danh mục (không cần đăng nhập)
 */
@RestController
@RequestMapping("/public/categories")
@RequiredArgsConstructor
@Slf4j
public class PublicCategoryController {

    private final CategoryManagementService categoryManagementService;

    /**
     * Lấy tất cả platform categories (cấu trúc cây 2 cấp)
     * GET /public/categories/platform
     */
    @GetMapping("/platform")
    public ApiResponse<List<CategoryResponse>> getAllPlatformCategories() {
        log.info("Public: Getting all platform categories");
        List<CategoryResponse> response = categoryManagementService.getAllPlatformRootCategories();
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy chi tiết một platform category (bao gồm subcategories)
     * GET /public/categories/platform/{categoryId}
     */
    @GetMapping("/platform/{categoryId}")
    public ApiResponse<CategoryResponse> getPlatformCategoryById(@PathVariable String categoryId) {
        log.info("Public: Getting platform category: {}", categoryId);
        CategoryResponse response = categoryManagementService.getPlatformCategoryById(categoryId);
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy tất cả store categories của một store cụ thể
     * GET /public/categories/store/{storeId}
     */
    @GetMapping("/store/{storeId}")
    public ApiResponse<List<CategoryResponse>> getAllStoreCategoriesByStoreId(@PathVariable String storeId) {
        log.info("Public: Getting all store categories for store: {}", storeId);
        List<CategoryResponse> response = categoryManagementService.getAllStoreCategoriesByStoreId(storeId);
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy chi tiết một store category
     * GET /public/categories/store/{storeId}/{categoryId}
     */
    @GetMapping("/store/{storeId}/{categoryId}")
    public ApiResponse<CategoryResponse> getStoreCategoryById(
            @PathVariable String storeId,
            @PathVariable String categoryId) {

        log.info("Public: Getting store category {} from store {}", categoryId, storeId);
        CategoryResponse response = categoryManagementService.getStoreCategoryById(storeId, categoryId);
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }
}