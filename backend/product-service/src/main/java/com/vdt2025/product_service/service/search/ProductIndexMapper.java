package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.document.ProductDocument;
import com.vdt2025.product_service.document.ProductDocument.*;
import com.vdt2025.product_service.entity.*;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.repository.ProductImageRepository;
import com.vdt2025.product_service.repository.ProductVariantRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Mapper để chuyển đổi từ JPA Entity sang Elasticsearch Document
 * Denormalize data cho tối ưu tìm kiếm
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductIndexMapper {

    ProductVariantRepository variantRepository;
    ProductImageRepository productImageRepository;
    InventoryStockRepository inventoryStockRepository;

    /**
     * Chuyển đổi Product entity sang ProductDocument
     */
    public ProductDocument toDocument(Product product) {
        if (product == null) {
            return null;
        }

        // Get thumbnail image
        String thumbnailUrl = productImageRepository
                .findFirstByProductIdOrderByDisplayOrderAsc(product.getId())
                .map(ProductImage::getImageUrl)
                .orElse(null);

        // Get category path for hierarchy search
        List<String> categoryPath = buildCategoryPath(product.getCategory());

        // Get store categories
        List<String> storeCategoryIds = new ArrayList<>();
        List<String> storeCategoryNames = new ArrayList<>();
        if (product.getStoreCategories() != null) {
            for (Category cat : product.getStoreCategories()) {
                storeCategoryIds.add(cat.getId());
                storeCategoryNames.add(cat.getName());
            }
        }

        // Get variants with attributes
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        List<VariantDocument> variantDocs = mapVariants(variants);
        List<SearchableAttribute> attributes = extractAttributes(variants);

        // Build specs text and entries for search
        String specsText = buildSpecsText(product.getSpecs());
        List<SpecEntry> specsEntries = buildSpecsEntries(product.getSpecs());

        // Build completion suggestions
        Completion suggest = buildSuggestion(product);

        return ProductDocument.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryPath(categoryPath)
                .storeId(product.getStore() != null ? product.getStore().getId() : null)
                .storeName(product.getStore() != null ? product.getStore().getStoreName() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .minPrice(product.getMinPrice())
                .maxPrice(product.getMaxPrice())
                .viewCount(product.getViewCount())
                .soldCount(product.getSoldCount())
                .averageRating(product.getAverageRating())
                .ratingCount(product.getRatingCount())
                .isActive(product.isActive())
                .isDeleted(product.isDeleted())
                .thumbnailUrl(thumbnailUrl)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .variants(variantDocs)
                .attributes(attributes)
                .specsText(specsText)
                .specsEntries(specsEntries)
                .storeCategoryIds(storeCategoryIds)
                .storeCategoryNames(storeCategoryNames)
                .createdBy(product.getCreatedBy())
                .suggest(suggest)
                .build();
    }

    /**
     * Xây dựng category path cho hierarchy search
     */
    private List<String> buildCategoryPath(Category category) {
        List<String> path = new ArrayList<>();
        Category current = category;

        while (current != null) {
            path.add(0, current.getId()); // Add to beginning
            current = current.getParentCategory();
        }

        return path;
    }

    /**
     * Map variants to document
     */
    private List<VariantDocument> mapVariants(List<ProductVariant> variants) {
        return variants.stream()
                .filter(v -> !v.isDeleted())
                .map(v -> {
                    // Get stock quantity
                    Integer stockQty = Optional.ofNullable(v.getInventoryStock())
                            .map(InventoryStock::getAvailableQuantity)
                            .orElse(0);

                    // Build metadata text and entries
                    String metadataText = buildSpecsText(v.getMetadata());
                    List<SpecEntry> metadataEntries = buildSpecsEntries(v.getMetadata());

                    return VariantDocument.builder()
                            .id(v.getId())
                            .sku(v.getSku())
                            .variantName(v.getVariantName())
                            .price(v.getPrice())
                            .originalPrice(v.getOriginalPrice())
                            .isActive(v.isActive())
                            .stockQuantity(stockQty)
                            .metadataText(metadataText)
                            .metadataEntries(metadataEntries)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Extract unique attributes from all variants
     */
    private List<SearchableAttribute> extractAttributes(List<ProductVariant> variants) {
        Set<String> seen = new HashSet<>();
        List<SearchableAttribute> attributes = new ArrayList<>();

        for (ProductVariant variant : variants) {
            if (variant.getAttributeValues() == null) continue;

            for (AttributeValue attrValue : variant.getAttributeValues()) {
                String key = attrValue.getAttribute().getId() + ":" + attrValue.getId();
                if (!seen.contains(key)) {
                    seen.add(key);
                    attributes.add(SearchableAttribute.builder()
                            .attributeId(attrValue.getAttribute().getId())
                            .attributeName(attrValue.getAttribute().getName())
                            .valueId(attrValue.getId())
                            .value(attrValue.getValue())
                            .build());
                }
            }
        }

        return attributes;
    }

    /**
     * Build searchable text from specs/metadata map
     * Kết hợp tất cả values thành một chuỗi text để full-text search
     */
    private String buildSpecsText(Map<String, ?> specs) {
        if (specs == null || specs.isEmpty()) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, ?> entry : specs.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> specAttr = (Map<String, Object>) value;
                Object specValue = specAttr.get("value");
                Object unit = specAttr.get("unit");

                if (specValue != null) {
                    sb.append(key).append(": ").append(specValue);
                    if (unit != null) {
                        sb.append(" ").append(unit);
                    }
                    sb.append(". ");
                }
            } else if (value != null) {
                sb.append(key).append(": ").append(value).append(". ");
            }
        }

        return sb.length() > 0 ? sb.toString().trim() : null;
    }

    /**
     * Build structured spec entries for filtering
     */
    private List<SpecEntry> buildSpecsEntries(Map<String, ?> specs) {
        if (specs == null || specs.isEmpty()) {
            return new ArrayList<>();
        }

        List<SpecEntry> entries = new ArrayList<>();
        for (Map.Entry<String, ?> entry : specs.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> specAttr = (Map<String, Object>) value;
                Object specValue = specAttr.get("value");
                Object unit = specAttr.get("unit");

                if (specValue != null) {
                    entries.add(SpecEntry.builder()
                            .key(key)
                            .value(specValue.toString())
                            .unit(unit != null ? unit.toString() : null)
                            .build());
                }
            } else if (value != null) {
                entries.add(SpecEntry.builder()
                        .key(key)
                        .value(value.toString())
                        .unit(null)
                        .build());
            }
        }

        return entries;
    }

    /**
     * Build completion suggestion for autocomplete
     */
    private Completion buildSuggestion(Product product) {
        List<String> inputs = new ArrayList<>();

        // Add product name
        inputs.add(product.getName());

        // Add brand name if exists
        if (product.getBrand() != null) {
            inputs.add(product.getBrand().getName());
            inputs.add(product.getBrand().getName() + " " + product.getName());
        }

        // Add category name
        if (product.getCategory() != null) {
            inputs.add(product.getCategory().getName());
        }

        // Weight based on popularity
        int weight = calculateWeight(product);

        return Completion.builder()
                .input(inputs.toArray(new String[0]))
                .weight(weight)
                .build();
    }

    /**
     * Calculate suggestion weight based on product popularity
     */
    private int calculateWeight(Product product) {
        int weight = 1;

        // Boost by sold count
        if (product.getSoldCount() != null) {
            weight += Math.min(product.getSoldCount() / 10, 50);
        }

        // Boost by rating
        if (product.getAverageRating() != null) {
            weight += (int) (product.getAverageRating() * 5);
        }

        // Boost by view count
        if (product.getViewCount() != null) {
            weight += Math.min(product.getViewCount() / 100, 20);
        }

        return Math.min(weight, 100); // Cap at 100
    }
}
