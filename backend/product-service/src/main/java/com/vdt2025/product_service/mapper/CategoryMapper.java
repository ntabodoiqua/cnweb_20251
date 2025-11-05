package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.request.category.CategoryCreationRequest;
import com.vdt2025.product_service.dto.request.category.CategoryUpdateRequest;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.entity.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryCreationRequest request);
    @Mapping(source = "active", target = "isActive")
    CategoryResponse toCategoryResponse(Category category);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

    void updateCategory(@MappingTarget Category category, CategoryUpdateRequest request);
}
