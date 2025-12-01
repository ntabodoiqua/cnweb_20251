package com.cnweb20251.message_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;
import java.util.List;

/**
 * Feign client để gọi Product Service.
 * Sử dụng internal API để lấy thông tin sản phẩm (service-to-service communication).
 */
@FeignClient(name = "product-service", path = "/internal/products")
public interface ProductServiceClient {

    /**
     * Lấy thông tin sản phẩm theo ID (internal endpoint).
     */
    @GetMapping("/{productId}")
    ApiResponse<ProductInfo> getProductInfo(@PathVariable("productId") String productId);

    /**
     * DTO cho thông tin sản phẩm - khớp với ProductResponse trong product-service.
     */
    record ProductInfo(
        String id,
        String name,
        String description,
        String shortDescription,
        Long viewCount,
        Integer soldCount,
        Double averageRating,
        Integer ratingCount,
        boolean isActive,
        CategoryInfo category,
        StoreInfo store,
        BrandInfo brand,
        List<VariantInfo> variants,
        List<ProductImageInfo> images,
        BigDecimal minPrice,
        BigDecimal maxPrice
    ) {}

    /**
     * DTO cho category.
     */
    record CategoryInfo(
        String id,
        String name,
        String slug
    ) {}

    /**
     * DTO cho store.
     */
    record StoreInfo(
        String id,
        String name,
        String logo,
        String ownerUsername
    ) {}

    /**
     * DTO cho brand.
     */
    record BrandInfo(
        String id,
        String name,
        String logo
    ) {}

    /**
     * DTO cho variant.
     */
    record VariantInfo(
        String id,
        String sku,
        String variantName,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer stockQuantity,
        String imageUrl,
        boolean isActive
    ) {}

    /**
     * DTO cho product image.
     */
    record ProductImageInfo(
        String id,
        String url,
        String altText,
        Integer displayOrder,
        Boolean isPrimary
    ) {}
}
