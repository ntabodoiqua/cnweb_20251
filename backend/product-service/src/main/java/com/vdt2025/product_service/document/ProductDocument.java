package com.vdt2025.product_service.document;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Elasticsearch Document cho Product
 * Được tối ưu hóa cho tìm kiếm full-text và filtering
 */
@Document(indexName = "products")
@Setting(settingPath = "elasticsearch/product-settings.json")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDocument {

    @Id
    String id;

    // Tên sản phẩm - sử dụng analyzer tiếng Việt và edge_ngram cho autocomplete
    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer"),
            otherFields = {
                    @InnerField(suffix = "keyword", type = FieldType.Keyword),
                    @InnerField(suffix = "autocomplete", type = FieldType.Text, analyzer = "autocomplete_analyzer", searchAnalyzer = "standard")
            }
    )
    String name;

    // Mô tả sản phẩm
    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    String description;

    // Mô tả ngắn
    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    String shortDescription;

    // Category info
    @Field(type = FieldType.Keyword)
    String categoryId;

    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer"),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword)
    )
    String categoryName;

    // Category hierarchy for breadcrumb search
    @Field(type = FieldType.Keyword)
    List<String> categoryPath;

    // Store info
    @Field(type = FieldType.Keyword)
    String storeId;

    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer"),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword)
    )
    String storeName;

    // Brand info
    @Field(type = FieldType.Keyword)
    String brandId;

    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer"),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword)
    )
    String brandName;

    // Pricing - sử dụng scaled_float cho performance
    @Field(type = FieldType.Scaled_Float, scalingFactor = 100)
    BigDecimal minPrice;

    @Field(type = FieldType.Scaled_Float, scalingFactor = 100)
    BigDecimal maxPrice;

    // Statistics
    @Field(type = FieldType.Long)
    Long viewCount;

    @Field(type = FieldType.Integer)
    Integer soldCount;

    @Field(type = FieldType.Float)
    Double averageRating;

    @Field(type = FieldType.Integer)
    Integer ratingCount;

    // Status
    @Field(type = FieldType.Boolean)
    boolean isActive;

    @Field(type = FieldType.Boolean)
    boolean isDeleted;

    // Image URL for display
    @Field(type = FieldType.Keyword, index = false)
    String thumbnailUrl;

    // Timestamps
    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second)
    LocalDateTime createdAt;

    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second)
    LocalDateTime updatedAt;

    // Variants info (denormalized for search)
    @Field(type = FieldType.Nested)
    List<VariantDocument> variants;

    // Searchable attributes - cho phép tìm kiếm theo thuộc tính (Size, Color, etc.)
    @Field(type = FieldType.Nested)
    List<SearchableAttribute> attributes;

    // Specs as searchable text - flatten specs values for full-text search
    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    String specsText;

    // Specs as structured data for filtering (key-value pairs)
    @Field(type = FieldType.Nested)
    List<SpecEntry> specsEntries;

    // Store categories
    @Field(type = FieldType.Keyword)
    List<String> storeCategoryIds;

    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    List<String> storeCategoryNames;

    // Người tạo
    @Field(type = FieldType.Keyword)
    String createdBy;

    // Suggest field for autocomplete
    @CompletionField(analyzer = "simple", searchAnalyzer = "simple", maxInputLength = 100)
    Completion suggest;

    /**
     * Nested document cho Variant
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantDocument {
        @Field(type = FieldType.Keyword)
        String id;

        @Field(type = FieldType.Keyword)
        String sku;

        @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
        String variantName;

        @Field(type = FieldType.Scaled_Float, scalingFactor = 100)
        BigDecimal price;

        @Field(type = FieldType.Scaled_Float, scalingFactor = 100)
        BigDecimal originalPrice;

        @Field(type = FieldType.Boolean)
        boolean isActive;

        @Field(type = FieldType.Integer)
        Integer stockQuantity;

        // Metadata as searchable text
        @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
        String metadataText;

        // Metadata as structured data for filtering
        @Field(type = FieldType.Nested)
        List<SpecEntry> metadataEntries;
    }

    /**
     * Searchable Attribute cho filtering
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchableAttribute {
        @Field(type = FieldType.Keyword)
        String attributeId;

        @Field(type = FieldType.Keyword)
        String attributeName;

        @Field(type = FieldType.Keyword)
        String valueId;

        @Field(type = FieldType.Keyword)
        String value;
    }

    /**
     * Spec/Metadata entry cho structured search
     * Dùng cho cả product specs và variant metadata
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecEntry {
        @Field(type = FieldType.Keyword)
        String key;

        @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
        String value;

        @Field(type = FieldType.Keyword)
        String unit;
    }

    /**
     * Completion suggestion wrapper
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Completion {
        String[] input;
        Integer weight;
    }
}
