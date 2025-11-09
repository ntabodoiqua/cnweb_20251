package com.vdt2025.product_service.dto.response;

import com.vdt2025.product_service.entity.Category;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    String id;
    String name;
    String description;
    String imageName;
    String imageUrl;
    boolean isActive;
    Category.CategoryType categoryType;
    Integer level;
    String storeId;
    String storeName;
    String parentId;
    String parentName;
    List<CategoryResponse> subCategories;
    Integer productCount;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    /**
     * Convert từ Entity sang Response DTO
     */
    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageName(category.getImageName())
                .imageUrl(category.getImageUrl())
                .isActive(category.isActive())
                .categoryType(category.getCategoryType())
                .level(category.getLevel())
                .storeId(category.getStore() != null ? category.getStore().getId() : null)
                .storeName(category.getStore() != null ? category.getStore().getStoreName() : null)
                .parentId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .createdBy(category.getCreatedBy())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Convert từ Entity sang Response DTO (bao gồm subcategories)
     */
    public static CategoryResponse fromEntityWithSubCategories(Category category) {
        CategoryResponse response = fromEntity(category);
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            response.setSubCategories(
                    category.getSubCategories().stream()
                            .map(CategoryResponse::fromEntity)
                            .collect(Collectors.toList())
            );
        }
        return response;
    }
}