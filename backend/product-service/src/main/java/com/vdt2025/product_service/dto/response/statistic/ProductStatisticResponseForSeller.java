package com.vdt2025.product_service.dto.response.statistic;

import com.vdt2025.product_service.dto.response.ProductSummaryResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductStatisticResponseForSeller {
    // Tổng số sản phẩm
    long totalProducts;

    // Sản phẩm đang hoạt động
    long activeProducts;

    // Tổng số biến thể sản phẩm
    long totalVariants;

    // Biến thể sản phẩm đang hoạt động
    long activeVariants;

    // Top 10 sản phẩm đc đánh giá 5 sao
    List<ProductSummaryResponse> topRatedProducts;

    // Top 10 sản phẩm bán chạy nhất
    List<ProductSummaryResponse> topSellingProducts;

    // Biến thể sản phẩm sắp hết hàng (dưới 10 đơn vị trong kho)
    List<ProductVariantLowStockResponse> lowStockVariants;

    // Số sản phẩm theo danh mục
    List<CategoryStatisticResponse> variantsByCategory;

    // Số sản phẩm theo thương hiệu
    List<BrandStatisticResponse> variantsByBrand;
}
