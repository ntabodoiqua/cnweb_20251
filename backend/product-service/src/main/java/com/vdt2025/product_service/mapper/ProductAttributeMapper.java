package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.response.ProductAttributeResponse;
import com.vdt2025.product_service.dto.response.ProductAttributeSimpleResponse;
import com.vdt2025.product_service.entity.ProductAttribute;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AttributeValueMapper.class, CategoryMapper.class})
public interface ProductAttributeMapper {
    @Mapping(target = "isActive", source = "active")
    ProductAttributeResponse toResponse(ProductAttribute attribute);
    @Mapping(target = "isActive", source = "active")
    ProductAttributeSimpleResponse toSimpleResponse(ProductAttribute attribute);
}
