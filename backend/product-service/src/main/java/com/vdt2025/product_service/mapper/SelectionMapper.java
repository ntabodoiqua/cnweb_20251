package com.vdt2025.product_service.mapper;

import com.vdt2025.product_service.dto.response.SelectionGroupResponse;
import com.vdt2025.product_service.dto.response.SelectionOptionResponse;
import com.vdt2025.product_service.entity.ProductSelectionGroup;
import com.vdt2025.product_service.entity.ProductSelectionOption;
import com.vdt2025.product_service.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper cho Selection entities
 */
@Mapper(componentModel = "spring")
public interface SelectionMapper {
    
    /**
     * Map SelectionGroup entity sang response
     */
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "options", source = "options", qualifiedByName = "mapOptions")
    @Mapping(target = "totalOptions", expression = "java(group.getOptions() != null ? group.getOptions().size() : 0)")
    SelectionGroupResponse toGroupResponse(ProductSelectionGroup group);
    
    /**
     * Map SelectionOption entity sang response
     */
    @Mapping(target = "linkedVariantIds", source = "variants", qualifiedByName = "extractVariantIds")
    @Mapping(target = "linkedVariantCount", expression = "java(option.getVariants() != null ? option.getVariants().size() : 0)")
    SelectionOptionResponse toOptionResponse(ProductSelectionOption option);
    
    /**
     * Map danh sách options
     */
    @Named("mapOptions")
    default List<SelectionOptionResponse> mapOptions(List<ProductSelectionOption> options) {
        if (options == null) {
            return Collections.emptyList();
        }
        return options.stream()
                .map(this::toOptionResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Extract variant IDs từ danh sách variants
     */
    @Named("extractVariantIds")
    default List<String> extractVariantIds(List<ProductVariant> variants) {
        if (variants == null) {
            return Collections.emptyList();
        }
        return variants.stream()
                .map(ProductVariant::getId)
                .collect(Collectors.toList());
    }
    
    /**
     * Map danh sách groups
     */
    default List<SelectionGroupResponse> toGroupResponseList(List<ProductSelectionGroup> groups) {
        if (groups == null) {
            return Collections.emptyList();
        }
        return groups.stream()
                .map(this::toGroupResponse)
                .collect(Collectors.toList());
    }
}
