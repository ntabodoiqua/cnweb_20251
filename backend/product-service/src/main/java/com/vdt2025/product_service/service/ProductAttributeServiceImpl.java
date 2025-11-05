package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.attribute.ProductAttributeRequest;
import com.vdt2025.product_service.dto.response.ProductAttributeResponse;
import com.vdt2025.product_service.dto.response.ProductAttributeSimpleResponse;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.ProductAttribute;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.AttributeValueMapper;
import com.vdt2025.product_service.mapper.ProductAttributeMapper;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.ProductAttributeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ProductAttributeResponse createAttribute(ProductAttributeRequest request) {
        if (productAttributeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.ATTRIBUTE_EXISTS);
        }

        validateCategoryIds(request.getCategoryIds());
        var categories = categoryRepository.findAllById(request.getCategoryIds());

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
