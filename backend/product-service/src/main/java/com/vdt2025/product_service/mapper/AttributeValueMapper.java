package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.request.attribute.AttributeValueRequest;
import com.vdt2025.product_service.dto.response.AttributeValueResponse;
import com.vdt2025.product_service.entity.AttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttributeValueMapper {
    AttributeValue toAttributeValue(AttributeValueRequest request);
    @Mapping(target = "isActive", source = "active")
    AttributeValueResponse toResponse(AttributeValue attributeValue);
}
