package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.request.product.ProductCreationRequest;
import com.vdt2025.product_service.dto.request.product.ProductUpdateRequest;
import com.vdt2025.product_service.dto.response.ProductResponse;
import com.vdt2025.product_service.entity.Product;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toProduct(ProductCreationRequest request);

    @Mapping(source = "active", target = "active")
    ProductResponse toProductResponse(Product product);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProduct(@MappingTarget Product product, ProductUpdateRequest request);
}
