package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.attribute.AttributeValueRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeCategoryUpdateRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeSimpleUpdateRequest;
import com.vdt2025.product_service.dto.response.ProductAttributeResponse;
import com.vdt2025.product_service.dto.response.ProductAttributeSimpleResponse;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.ProductAttribute;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.AttributeValueMapper;
import com.vdt2025.product_service.mapper.ProductAttributeMapper;
import com.vdt2025.product_service.repository.AttributeValueRepository;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.ProductAttributeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductAttributeServiceImpl implements ProductAttributeService {
    ProductAttributeRepository productAttributeRepository;
    CategoryRepository categoryRepository;
    AttributeValueMapper attributeValueMapper;
    private final ProductAttributeMapper productAttributeMapper;
    AttributeValueRepository attributeValueRepository;
    private final CacheEvictService cacheEvictService;

    @Transactional
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "attributesByCategory", allEntries = true)
    public ProductAttributeResponse createAttribute(ProductAttributeRequest request) {
        if (productAttributeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.ATTRIBUTE_EXISTS);
        }

        validateCategoryIds(request.getCategoryIds());
        var categories = categoryRepository.findAllById(request.getCategoryIds());

        for (Category category : categories) {
            if (!category.isPlatformCategory() || category.getLevel() > 0) {
                throw new AppException(ErrorCode.INVALID_CATEGORY_TYPE);
            }
        }

        var attribute = ProductAttribute.builder()
                .name(request.getName())
                .description(request.getDescription())
                .categories(new ArrayList<>(categories))
                .build();

        var values = request.getValues().stream()
                .map(v -> {
                    var value = attributeValueMapper.toAttributeValue(v);
                    value.setAttribute(attribute);
                    return value;
                })
                .collect(Collectors.toCollection(ArrayList::new));

        attribute.setValues(values);

        var saved = productAttributeRepository.save(attribute);
        return productAttributeMapper.toResponse(saved);
    }

    @Override
    @Cacheable(value = "attributesByCategory", key = "#categoryId")
    public List<ProductAttributeSimpleResponse> getAttributesByCategoryId(String categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        List<ProductAttribute> attributes = productAttributeRepository.findByCategories_Id(categoryId);
        return attributes.stream()
                .map(productAttributeMapper::toSimpleResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "attributeById", key = "#attributeId")
    public ProductAttributeResponse getAttributeById(String attributeId) {
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));
        return productAttributeMapper.toResponse(attribute);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    // Xóa liên kết giữa các danh mục và thuộc tính
    public ProductAttributeResponse deleteCategoriesOfAttribute(String attributeId, ProductAttributeCategoryUpdateRequest request) {
        List<String> categoryIdsToDelete = request.getCategoryIds();
        validateCategoryIds(categoryIdsToDelete);
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));
        attribute.getCategories().removeIf(cat -> categoryIdsToDelete.contains(cat.getId()));
        productAttributeRepository.save(attribute);
        return productAttributeMapper.toResponse(attribute);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    // Thêm liên kết giữa các danh mục và thuộc tính
    public ProductAttributeResponse addCategoriesToAttribute(String attributeId, ProductAttributeCategoryUpdateRequest request) {
        List<String> categoryIdsToAdd = request.getCategoryIds();
        validateCategoryIds(categoryIdsToAdd);
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));
        var categoriesToAdd = categoryRepository.findAllById(categoryIdsToAdd);
        for (Category category : categoriesToAdd) {
            if (!category.isPlatformCategory() || category.getLevel() > 0) {
                throw new AppException(ErrorCode.INVALID_CATEGORY_TYPE);
            }
            if (!attribute.getCategories().contains(category)) {
                attribute.getCategories().add(category);
            }
        }
        productAttributeRepository.save(attribute);
        return productAttributeMapper.toResponse(attribute);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse updateAttribute(String attributeId, ProductAttributeSimpleUpdateRequest request) {
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));

        if (request.getName() != null && !request.getName().equalsIgnoreCase(attribute.getName())) {
            if (productAttributeRepository.existsByNameIgnoreCase(request.getName())) {
                throw new AppException(ErrorCode.ATTRIBUTE_EXISTS);
            }
            attribute.setName(request.getName());
        }

        if (request.getDescription() != null) {
            attribute.setDescription(request.getDescription());
        }

        var updated = productAttributeRepository.save(attribute);
        return productAttributeMapper.toResponse(updated);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse addValueToAttribute(String attributeId, AttributeValueRequest value) {

        // 1. Lấy entity cha (1 DB call - SELECT)
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));

        // 2. Kiểm tra tồn tại
        if (attributeValueRepository.existsByValueIgnoreCaseAndAttributeId(value.getValue(), attributeId)) {
            throw new AppException(ErrorCode.ATTRIBUTE_VALUE_EXISTS);
        }

        // 3. Map DTO -> Entity (In-memory)
        var newValue = attributeValueMapper.toAttributeValue(value);

        // 4. Thiết lập quan hệ 2 chiều
        newValue.setAttribute(attribute);

        // 5. Save entity con
        var savedValue = attributeValueRepository.save(newValue);

        // 6. Cập nhật collection của entity cha (In-memory)
        attribute.getValues().add(savedValue);

        return productAttributeMapper.toResponse(attribute);
    }


    @Override
    @Transactional
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse deleteValueOfAttribute(String attributeId, AttributeValueRequest value) {

        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));

        // 2. Tìm giá trị cần xóa
        var existingValue = attributeValueRepository.findByValueIgnoreCaseAndAttributeId(value.getValue(), attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND));

        // 3. Xóa mềm giá trị
        existingValue.setActive(false);
        attributeValueRepository.save(existingValue);
        return productAttributeMapper.toResponse(attribute);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse deleteAttribute(String attributeId) {
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));
        // Xóa mềm thuộc tính
        attribute.setActive(false);
        productAttributeRepository.save(attribute);
        return productAttributeMapper.toResponse(attribute);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse toggleAttributeStatus(String attributeId) {
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));

        // Toggle trạng thái
        boolean newStatus = !attribute.isActive();
        attribute.setActive(newStatus);
        productAttributeRepository.save(attribute);

        // Không cascade - chỉ ẩn/hiện thuộc tính khỏi form tạo/sửa product
        // Products hiện tại vẫn giữ nguyên data attribute trong specs
        log.info("Attribute {} status toggled to: {}", attribute.getName(), newStatus);

        return productAttributeMapper.toResponse(attribute);
    }

    @Override
    @CacheEvict(value = {"attributeById", "attributesByCategory"}, allEntries = true)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse toggleAttributeValueStatus(String attributeId, String valueId) {
        var attribute = productAttributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_NOT_FOUND));

        var value = attributeValueRepository.findById(valueId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND));

        // Validate value thuộc attribute này
        if (!value.getAttribute().getId().equals(attributeId)) {
            throw new AppException(ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND);
        }

        // Toggle trạng thái
        boolean newStatus = !value.isActive();
        value.setActive(newStatus);
        attributeValueRepository.save(value);

        // Không cascade - chỉ ẩn/hiện giá trị khỏi dropdown khi tạo/sửa product
        // Products hiện tại vẫn giữ nguyên data
        log.info("Attribute value {} status toggled to: {}", value.getValue(), newStatus);

        return productAttributeMapper.toResponse(attribute);
    }

    // Helper methods valid danh mục
    void validateCategoryIds(List<String> categoryIds) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            // Lấy danh sách ID tồn tại trong DB
            List<String> existingIds = categoryRepository.findExistingIds(categoryIds);

            // Dựng dict/set cho tra cứu nhanh
            Set<String> existingIdSet = new HashSet<>(existingIds);

            // Tìm các ID không tồn tại
            List<String> invalidIds = categoryIds.stream()
                    .filter(id -> !existingIdSet.contains(id))
                    .toList();

            if (!invalidIds.isEmpty()) {
                log.error("CATEGORY_NOT_FOUND: {}", invalidIds);
                throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
            }
        }
    }

}