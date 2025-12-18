package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.spec.SpecTemplateCreationRequest;
import com.vdt2025.product_service.dto.request.spec.SpecTemplateUpdateRequest;
import com.vdt2025.product_service.dto.response.SpecTemplateResponse;

import java.util.List;

/**
 * Service interface cho Spec Template management
 */
public interface SpecTemplateService {
    
    /**
     * Tạo spec template mới
     */
    SpecTemplateResponse createTemplate(SpecTemplateCreationRequest request);
    
    /**
     * Cập nhật spec template
     */
    SpecTemplateResponse updateTemplate(String templateId, SpecTemplateUpdateRequest request);
    
    /**
     * Xóa spec template
     */
    void deleteTemplate(String templateId);
    
    /**
     * Lấy spec template theo ID
     */
    SpecTemplateResponse getTemplateById(String templateId);
    
    /**
     * Lấy tất cả templates theo category
     */
    List<SpecTemplateResponse> getTemplatesByCategory(String categoryId);
    
    /**
     * Lấy tất cả templates active
     */
    List<SpecTemplateResponse> getAllActiveTemplates();
}
