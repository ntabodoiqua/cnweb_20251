package com.cnweb.inventory_service.mapper;

import com.cnweb.inventory_service.dto.request.CreateInventoryRequest;
import com.cnweb.inventory_service.dto.response.InventoryResponse;
import com.cnweb.inventory_service.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "availableQuantity", source = "initialQuantity")
    @Mapping(target = "totalQuantity", source = "initialQuantity")
    @Mapping(target = "reservedQuantity", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Inventory toEntity(CreateInventoryRequest request);
    
    @Mapping(target = "needsRestock", expression = "java(inventory.needsRestock())")
    InventoryResponse toResponse(Inventory inventory);
}
