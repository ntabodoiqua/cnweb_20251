package com.vdt2025.product_service.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;
import org.springframework.data.elasticsearch.core.suggest.Completion;

import java.time.LocalDateTime;

/**
 * Elasticsearch Document cho Store (Cửa hàng)
 * Được tối ưu hóa cho tìm kiếm full-text
 */
@Document(indexName = "stores")
@Setting(settingPath = "elasticsearch/product-settings.json")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class StoreDocument {

    @Id
    String id;

    // Seller profile ID
    @Field(type = FieldType.Keyword)
    String sellerProfileId;

    // Username của người bán
    @Field(type = FieldType.Keyword)
    String userName;

    // Tên cửa hàng - sử dụng analyzer tiếng Việt và edge_ngram cho autocomplete
    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer"),
            otherFields = {
                    @InnerField(suffix = "keyword", type = FieldType.Keyword),
                    @InnerField(suffix = "autocomplete", type = FieldType.Text, analyzer = "autocomplete_analyzer", searchAnalyzer = "standard")
            }
    )
    String storeName;

    // Mô tả cửa hàng
    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    String storeDescription;

    // Logo URL
    @Field(type = FieldType.Keyword, index = false)
    String logoUrl;

    // Banner URL
    @Field(type = FieldType.Keyword, index = false)
    String bannerUrl;

    // Thông tin liên hệ
    @Field(type = FieldType.Keyword)
    String contactEmail;

    @Field(type = FieldType.Keyword)
    String contactPhone;

    // Địa chỉ cửa hàng - có thể tìm kiếm
    @Field(type = FieldType.Text, analyzer = "vietnamese_analyzer")
    String shopAddress;

    // Province/Ward IDs cho lọc theo khu vực
    @Field(type = FieldType.Integer)
    Integer provinceId;

    @Field(type = FieldType.Integer)
    Integer wardId;

    // Trạng thái hoạt động
    @Field(type = FieldType.Boolean)
    @JsonProperty("isActive")
    boolean isActive;

    // Thống kê
    @Field(type = FieldType.Integer)
    Integer totalProducts;

    @Field(type = FieldType.Integer)
    Integer totalSold;

    @Field(type = FieldType.Float)
    Double averageRating;

    @Field(type = FieldType.Integer)
    Integer followerCount;

    // Timestamps
    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second)
    LocalDateTime createdAt;

    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second)
    LocalDateTime updatedAt;

    // Suggest field for autocomplete
    @CompletionField(analyzer = "simple", searchAnalyzer = "simple", maxInputLength = 100)
    Completion suggest;
}
