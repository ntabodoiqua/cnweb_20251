package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.response.ProductImageResponse;
import com.vdt2025.product_service.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    @Mapping(target = "product", ignore = true)
    ProductImage toProductImage(ProductImageResponse response);

    @Mapping(target = "isPrimary", source = "primary")
    ProductImageResponse toProductImageResponse(ProductImage productImage);
}