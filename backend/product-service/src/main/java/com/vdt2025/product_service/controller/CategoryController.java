package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.category.CategoryCreationRequest;
import com.vdt2025.product_service.dto.request.category.CategoryFilterRequest;
import com.vdt2025.product_service.dto.request.category.CategoryUpdateRequest;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.service.CategoryServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    CategoryServiceImp categoryService;

    // Controller để lấy danh sách các danh mục sản phẩm
    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getCategories(
            @ModelAttribute CategoryFilterRequest filter,
            Pageable pageable
    ) {
        Page<CategoryResponse> categories = categoryService.searchCategories(filter, pageable);
        return ApiResponse.<Page<CategoryResponse>>builder()
                .result(categories)
                .build();
    }

    // Lấy danh mục theo id
    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable String id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ApiResponse.<CategoryResponse>builder()
                .result(category)
                .build();
    }

    // Tạo danh mục mới
    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(@RequestBody CategoryCreationRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ApiResponse.<CategoryResponse>builder()
                .result(category)
                .build();
    }

    // Cập nhật ảnh đại diện cho danh mục
    @PostMapping("/{id}/thumbnail")
    public ApiResponse<String> setCategoryThumbnail(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        String thumbnailUrl = categoryService.setCategoryThumbnail(id, file);
        return ApiResponse.<String>builder()
                .result(thumbnailUrl)
                .build();
    }

    // Cập nhật danh mục
    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestBody CategoryUpdateRequest request) {
        CategoryResponse updatedCategory = categoryService.updateCategory(id, request);
        return ApiResponse.<CategoryResponse>builder()
                .result(updatedCategory)
                .build();
    }

    // Xóa danh mục
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<String>builder()
                .result("Category has been deleted")
                .build();
    }
}
