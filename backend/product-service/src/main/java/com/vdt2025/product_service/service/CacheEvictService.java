package com.vdt2025.product_service.service;

public interface CacheEvictService {
    void evictUserStores(String username);
    void evictProductDetails(String productId);
    void evictProductCaches(String productId);
    void evictVariantCaches(String variantId);
}
