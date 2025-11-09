package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.request.CreatePlatformCategoryRequest;
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

/**
 * Controller quản lý Platform Categories (dành cho Admin)
 * Platform categories là danh mục toàn hệ thống, hỗ trợ 2 cấp
 */
@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
@Slf4j
public class AdminCategoryController {

    private final CategoryManagementService categoryManagementService;

    /**
     * Admin tạo platform category mới
     * POST /admin/categories
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> createPlatformCategory(
            @Valid @RequestBody CreatePlatformCategoryRequest request
    ) {
        CategoryResponse response = categoryManagementService.createPlatformCategory(request);
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Admin cập nhật platform category
     * PUT /admin/categories/{categoryId}
     */
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> updatePlatformCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody CreatePlatformCategoryRequest request
    ) {

        log.info("Admin is updating platform category: {}", categoryId);
        CategoryResponse response = categoryManagementService.updatePlatformCategory(
                categoryId,
                request
        );
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Admin xóa platform category
     * DELETE /admin/categories/{categoryId}
     */
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deletePlatformCategory(
            @PathVariable String categoryId,
            Authentication authentication) {

        log.info("Admin {} deleting platform category: {}", authentication.getName(), categoryId);
        categoryManagementService.deletePlatformCategory(categoryId);
        return ApiResponse.<Void>builder()
                .message("Platform category deleted successfully")
                .build();
    }

    /**
     * Lấy tất cả platform categories (cấu trúc cây 2 cấp)
     * GET /admin/categories
     */
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllPlatformCategories() {
        log.info("Getting all platform categories");
        List<CategoryResponse> response = categoryManagementService.getAllPlatformRootCategories();
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy chi tiết một platform category (bao gồm subcategories)
     * GET /admin/categories/{categoryId}
     */
    @GetMapping("/{categoryId}")
    public ApiResponse<CategoryResponse> getPlatformCategoryById(@PathVariable String categoryId) {
        log.info("Getting platform category: {}", categoryId);
        CategoryResponse response = categoryManagementService.getPlatformCategoryById(categoryId);
        return ApiResponse.<CategoryResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Cập nhật ảnh thumbnail cho category
     * POST /admin/categories/{categoryId}/thumbnail
     */
    @PostMapping("/{categoryId}/thumbnail")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> updateCategoryThumbnail(
            @PathVariable String categoryId,
            @RequestParam("file") MultipartFile file) {
        log.info("Admin is updating thumbnail for category ID: {}", categoryId);
        String result = categoryManagementService.updateCategoryThumbnail(categoryId, file);
        return ApiResponse.<String>builder()
                .message("Thumbnail updated successfully")
                .result(result)
                .build();
    }
}
