package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.spec.SpecTemplateCreationRequest;
import com.vdt2025.product_service.dto.request.spec.SpecTemplateUpdateRequest;
import com.vdt2025.product_service.dto.response.SpecTemplateResponse;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.SpecTemplate;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.SpecTemplateRepository;
import com.vdt2025.product_service.util.SpecsHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation cho Spec Template management
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SpecTemplateServiceImpl implements SpecTemplateService {
    
    SpecTemplateRepository specTemplateRepository;
    CategoryRepository categoryRepository;
    
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public SpecTemplateResponse createTemplate(SpecTemplateCreationRequest request) {
        log.info("Creating spec template: {}", request.getName());
        
        // Check if category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
        // Check if template name already exists for this category
        if (specTemplateRepository.existsByNameAndCategoryId(request.getName(), request.getCategoryId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        // Validate spec fields structure
        SpecsHelper.validateSpecs(request.getSpecFields());
        
        // Get current user
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Create template
        SpecTemplate template = SpecTemplate.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .specFields(request.getSpecFields())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 999)
                .isActive(true)
                .createdBy(currentUser)
                .build();
        
        template = specTemplateRepository.save(template);
        
        return mapToResponse(template);
    }
    
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public SpecTemplateResponse updateTemplate(String templateId, SpecTemplateUpdateRequest request) {
        log.info("Updating spec template: {}", templateId);
        
        SpecTemplate template = specTemplateRepository.findById(templateId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));
        
        // Update fields if provided
        if (request.getName() != null) {
            template.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            template.setCategory(category);
        }
        
        if (request.getSpecFields() != null) {
            SpecsHelper.validateSpecs(request.getSpecFields());
            template.setSpecFields(request.getSpecFields());
        }
        
        if (request.getDisplayOrder() != null) {
            template.setDisplayOrder(request.getDisplayOrder());
        }
        
        if (request.getIsActive() != null) {
            template.setIsActive(request.getIsActive());
        }
        
        template = specTemplateRepository.save(template);
        
        return mapToResponse(template);
    }
    
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteTemplate(String templateId) {
        log.info("Deleting spec template: {}", templateId);
        
        if (!specTemplateRepository.existsById(templateId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        specTemplateRepository.deleteById(templateId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public SpecTemplateResponse getTemplateById(String templateId) {
        log.info("Getting spec template: {}", templateId);
        
        SpecTemplate template = specTemplateRepository.findById(templateId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));
        
        return mapToResponse(template);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SpecTemplateResponse> getTemplatesByCategory(String categoryId) {
        log.info("Getting spec templates for category: {}", categoryId);
        
        // Verify category exists
        if (!categoryRepository.existsById(categoryId)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        List<SpecTemplate> templates = specTemplateRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        
        return templates.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SpecTemplateResponse> getAllActiveTemplates() {
        log.info("Getting all active spec templates");
        
        List<SpecTemplate> templates = specTemplateRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        
        return templates.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Map entity to response DTO
     */
    private SpecTemplateResponse mapToResponse(SpecTemplate template) {
        return SpecTemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .categoryId(template.getCategory().getId())
                .categoryName(template.getCategory().getName())
                .specFields(template.getSpecFields())
                .isActive(template.getIsActive())
                .displayOrder(template.getDisplayOrder())
                .createdBy(template.getCreatedBy())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
