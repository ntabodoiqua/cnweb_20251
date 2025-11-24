package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.dto.response.StoreSimpleResponse;
import com.vdt2025.product_service.entity.Store;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoreMapper {
    @Mapping(source = "active", target = "isActive")
    StoreResponse toStoreResponse(Store store);
    @Mapping(source = "active", target = "isActive")
    StoreSimpleResponse toStoreSimpleResponse(Store store);
}
