package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.spec.SpecTemplateCreationRequest;
import com.vdt2025.product_service.dto.request.spec.SpecTemplateUpdateRequest;
import com.vdt2025.product_service.dto.response.SpecTemplateResponse;
import com.vdt2025.product_service.service.SpecTemplateService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho Spec Template Management (Admin only)
 * Cho phép admin định nghĩa sẵn các templates specs theo category
 */
@RestController
@RequestMapping("/spec-templates")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecTemplateController {
    
    SpecTemplateService specTemplateService;
    
    /**
     * Tạo spec template mới
     * POST /spec-templates
     * Required: ADMIN role
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SpecTemplateResponse> createTemplate(
            @Valid @RequestBody SpecTemplateCreationRequest request) {
        log.info("Creating spec template: {}", request.getName());
        
        SpecTemplateResponse response = specTemplateService.createTemplate(request);
        
        return ApiResponse.<SpecTemplateResponse>builder()
                .message("Spec template created successfully")
                .result(response)
                .build();
    }
    
    /**
     * Cập nhật spec template
     * PUT /spec-templates/{templateId}
     * Required: ADMIN role
     */
    @PutMapping("/{templateId}")
    public ApiResponse<SpecTemplateResponse> updateTemplate(
            @PathVariable String templateId,
            @Valid @RequestBody SpecTemplateUpdateRequest request) {
        log.info("Updating spec template: {}", templateId);
        
        SpecTemplateResponse response = specTemplateService.updateTemplate(templateId, request);
        
        return ApiResponse.<SpecTemplateResponse>builder()
                .message("Spec template updated successfully")
                .result(response)
                .build();
    }
    
    /**
     * Xóa spec template
     * DELETE /spec-templates/{templateId}
     * Required: ADMIN role
     */
    @DeleteMapping("/{templateId}")
    public ApiResponse<String> deleteTemplate(@PathVariable String templateId) {
        log.info("Deleting spec template: {}", templateId);
        
        specTemplateService.deleteTemplate(templateId);
        
        return ApiResponse.<String>builder()
                .message("Spec template deleted successfully")
                .result("Template with ID " + templateId + " has been removed")
                .build();
    }
    
    /**
     * Lấy spec template theo ID
     * GET /spec-templates/{templateId}
     */
    @GetMapping("/{templateId}")
    public ApiResponse<SpecTemplateResponse> getTemplateById(@PathVariable String templateId) {
        log.info("Getting spec template: {}", templateId);
        
        SpecTemplateResponse response = specTemplateService.getTemplateById(templateId);
        
        return ApiResponse.<SpecTemplateResponse>builder()
                .result(response)
                .build();
    }
    
    /**
     * Lấy tất cả templates theo category
     * GET /spec-templates/category/{categoryId}
     * Dùng cho seller khi tạo sản phẩm thuộc category này
     */
    @GetMapping("/category/{categoryId}")
    public ApiResponse<List<SpecTemplateResponse>> getTemplatesByCategory(
            @PathVariable String categoryId) {
        log.info("Getting spec templates for category: {}", categoryId);
        
        List<SpecTemplateResponse> response = specTemplateService.getTemplatesByCategory(categoryId);
        
        return ApiResponse.<List<SpecTemplateResponse>>builder()
                .result(response)
                .build();
    }
    
    /**
     * Lấy tất cả templates active
     * GET /spec-templates
     */
    @GetMapping
    public ApiResponse<List<SpecTemplateResponse>> getAllActiveTemplates() {
        log.info("Getting all active spec templates");
        
        List<SpecTemplateResponse> response = specTemplateService.getAllActiveTemplates();
        
        return ApiResponse.<List<SpecTemplateResponse>>builder()
                .result(response)
                .build();
    }
}
