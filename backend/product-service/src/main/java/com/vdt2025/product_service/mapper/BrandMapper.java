package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.request.brand.BrandCreationRequest;
import com.vdt2025.product_service.dto.request.brand.BrandUpdateRequest;
import com.vdt2025.product_service.dto.response.BrandResponse;
import com.vdt2025.product_service.entity.Brand;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    Brand toBrand(BrandCreationRequest request);

    @Mapping(target = "isActive", source = "active")
    BrandResponse toBrandResponse(Brand brand);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateBrand(@MappingTarget Brand brand, BrandUpdateRequest request);
}
