package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.document.ProductDocument;
import com.vdt2025.product_service.document.ProductDocument.*;
import com.vdt2025.product_service.entity.*;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.repository.ProductImageRepository;
import com.vdt2025.product_service.repository.ProductVariantRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.hibernate.LazyInitializationException;
import org.springframework.data.elasticsearch.core.suggest.Completion;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Supplier;
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

    CategoryRepository categoryRepository;
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
        Category category = safeGet(() -> product.getCategory());
        List<String> categoryPath = buildCategoryPath(category);

        // Get store categories - safe access for lazy loaded collection
        List<String> storeCategoryIds = new ArrayList<>();
        List<String> storeCategoryNames = new ArrayList<>();
        List<Category> storeCategories = safeGetList(() -> product.getStoreCategories());
        for (Category cat : storeCategories) {
            storeCategoryIds.add(cat.getId());
            storeCategoryNames.add(cat.getName());
        }

        // Get variants with attributes
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        List<VariantDocument> variantDocs = mapVariants(variants);
        List<SearchableAttribute> attributes = extractAttributes(variants);

        // Build specs text and entries for search
        String specsText = buildSpecsText(product.getSpecs());
        List<SpecEntry> specsEntries = buildSpecsEntries(product.getSpecs());

        // Build selection groups and searchable text - safe access for lazy loaded
        List<ProductSelectionGroup> selectionGroups = safeGetList(() -> product.getSelectionGroups());
        List<SelectionGroupDocument> selectionGroupDocs = mapSelectionGroups(selectionGroups);
        String selectionOptionsText = buildSelectionOptionsText(selectionGroups);

        // Calculate total available stock
        Integer totalAvailableStock = calculateTotalAvailableStock(variants);

        // Build completion suggestions
        Completion suggest = buildSuggestion(product);

        return ProductDocument.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
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
                .selectionGroups(selectionGroupDocs)
                .selectionOptionsText(selectionOptionsText)
                .totalAvailableStock(totalAvailableStock)
                .suggest(suggest)
                .build();
    }

    /**
     * Xây dựng category path cho hierarchy search
     * Load fresh category với parent hierarchy từ DB để tránh LazyInitializationException
     */
    private List<String> buildCategoryPath(Category category) {
        List<String> path = new ArrayList<>();
        if (category == null) {
            return path;
        }

        try {
            // Load category với parent hierarchy từ DB
            Category fullCategory = categoryRepository.findByIdWithParentHierarchy(category.getId())
                    .orElse(category);
            
            Category current = fullCategory;
            int maxDepth = 10; // Prevent infinite loop
            int depth = 0;
            
            while (current != null && depth < maxDepth) {
                path.add(0, current.getId()); // Add to beginning
                // Get parent safely - since we loaded with JOIN FETCH, this should work
                Category parent = current.getParentCategory();
                current = parent;
                depth++;
            }
        } catch (Exception e) {
            log.warn("Error building category path for category {}: {}", category.getId(), e.getMessage());
            // Fallback: just add current category id
            path.add(category.getId());
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
     * Using Spring Data Elasticsearch's Completion type
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

        // Create Completion object using Spring Data Elasticsearch's Completion
        Completion completion = new Completion(inputs.toArray(new String[0]));
        completion.setWeight(weight);
        return completion;
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

    // ========== Selection Groups Mapping ==========

    /**
     * Map SelectionGroups entities sang documents
     * Note: groups đã được safe-access trước khi truyền vào
     */
    private List<SelectionGroupDocument> mapSelectionGroups(List<ProductSelectionGroup> groups) {
        if (groups == null || groups.isEmpty()) {
            return new ArrayList<>();
        }

        return groups.stream()
                .filter(ProductSelectionGroup::isActive)
                .map(this::mapSelectionGroup)
                .collect(Collectors.toList());
    }

    /**
     * Map một SelectionGroup entity sang document
     */
    private SelectionGroupDocument mapSelectionGroup(ProductSelectionGroup group) {
        List<SelectionOptionDocument> optionDocs = new ArrayList<>();
        
        List<ProductSelectionOption> options = safeGetList(() -> group.getOptions());
        if (!options.isEmpty()) {
            optionDocs = options.stream()
                    .filter(ProductSelectionOption::isActive)
                    .map(this::mapSelectionOption)
                    .collect(Collectors.toList());
        }

        return SelectionGroupDocument.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .displayOrder(group.getDisplayOrder())
                .isRequired(group.isRequired())
                .affectsVariant(group.isAffectsVariant())
                .options(optionDocs)
                .build();
    }

    /**
     * Map một SelectionOption entity sang document
     */
    private SelectionOptionDocument mapSelectionOption(ProductSelectionOption option) {
        List<String> linkedVariantIds = new ArrayList<>();
        
        List<ProductVariant> variants = safeGetList(() -> option.getVariants());
        if (!variants.isEmpty()) {
            linkedVariantIds = variants.stream()
                    .filter(v -> !v.isDeleted() && v.isActive())
                    .map(ProductVariant::getId)
                    .collect(Collectors.toList());
        }

        return SelectionOptionDocument.builder()
                .id(option.getId())
                .value(option.getValue())
                .label(option.getLabel())
                .displayOrder(option.getDisplayOrder())
                .imageUrl(option.getImageUrl())
                .colorCode(option.getColorCode())
                .isAvailable(option.isAvailable())
                .linkedVariantIds(linkedVariantIds)
                .build();
    }

    /**
     * Build searchable text từ tất cả selection options
     * Cho phép full-text search theo tên option
     * Ví dụ: "iPhone 15 Pro, iPhone 14, Samsung S24, Đen Carbon, Trong suốt"
     * Note: groups đã được safe-access trước khi truyền vào
     */
    private String buildSelectionOptionsText(List<ProductSelectionGroup> groups) {
        if (groups == null || groups.isEmpty()) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        
        for (ProductSelectionGroup group : groups) {
            List<ProductSelectionOption> options = safeGetList(() -> group.getOptions());
            if (!group.isActive() || options.isEmpty()) continue;
            
            // Add group name
            sb.append(group.getName()).append(": ");
            
            // Add all option values
            List<String> optionValues = options.stream()
                    .filter(ProductSelectionOption::isActive)
                    .map(opt -> {
                        String label = opt.getLabel();
                        String value = opt.getValue();
                        return (label != null && !label.isBlank()) ? label : value;
                    })
                    .collect(Collectors.toList());
            
            sb.append(String.join(", ", optionValues)).append(". ");
        }

        return sb.length() > 0 ? sb.toString().trim() : null;
    }

    /**
     * Calculate total available stock across all active variants
     */
    private Integer calculateTotalAvailableStock(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return 0;
        }

        return variants.stream()
                .filter(v -> !v.isDeleted() && v.isActive())
                .mapToInt(v -> Optional.ofNullable(v.getInventoryStock())
                        .map(InventoryStock::getAvailableQuantity)
                        .orElse(0))
                .sum();
    }

    // ========== Safe Lazy Loading Helpers ==========

    /**
     * Safely access a lazy-loaded collection, returning empty list if not initialized
     */
    private <T> List<T> safeGetList(Supplier<List<T>> supplier) {
        try {
            List<T> list = supplier.get();
            if (list != null && Hibernate.isInitialized(list)) {
                return list;
            }
            return new ArrayList<>();
        } catch (LazyInitializationException e) {
            log.warn("LazyInitializationException when accessing collection: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Safely access a lazy-loaded entity, returning null if not initialized
     */
    private <T> T safeGet(Supplier<T> supplier) {
        try {
            T entity = supplier.get();
            if (entity != null && Hibernate.isInitialized(entity)) {
                return entity;
            }
            return null;
        } catch (LazyInitializationException e) {
            log.warn("LazyInitializationException when accessing entity: {}", e.getMessage());
            return null;
        }
    }
}
