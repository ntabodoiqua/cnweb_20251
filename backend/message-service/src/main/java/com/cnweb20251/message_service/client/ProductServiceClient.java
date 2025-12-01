package com.cnweb20251.message_service.client;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Feign client để gọi Product Service.
 * Sử dụng internal API để lấy thông tin sản phẩm và store (service-to-service communication).
 */
@FeignClient(name = "product-service", path = "/internal/products")
public interface ProductServiceClient {

    /**
     * Lấy thông tin sản phẩm theo ID (internal endpoint).
     */
    @GetMapping("/{productId}")
    ApiResponse<ProductInfo> getProductInfo(@PathVariable("productId") String productId);

    /**
     * Lấy thông tin store theo ID (internal endpoint).
     */
    @GetMapping("/stores/{storeId}")
    ApiResponse<StoreDetailInfo> getStoreInfo(@PathVariable("storeId") String storeId);

    /**
     * Kiểm tra user có phải owner của store không.
     */
    @GetMapping("/stores/{storeId}/validate-owner")
    ApiResponse<Boolean> validateStoreOwner(@PathVariable("storeId") String storeId, @RequestParam("username") String username);

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
     * DTO cho thông tin chi tiết store - khớp với StoreSimpleResponse trong product-service.
     */
    record StoreDetailInfo(
        String id,
        String storeName,
        String storeDescription,
        String logoName,
        String logoUrl,
        String bannerName,
        String bannerUrl,
        String contactEmail,
        String contactPhone,
        String shopAddress,
        Integer provinceId,
        Integer wardId,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
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
     * DTO cho store (trong ProductInfo).
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
