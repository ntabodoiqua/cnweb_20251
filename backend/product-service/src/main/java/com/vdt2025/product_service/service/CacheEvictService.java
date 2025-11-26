package com.vdt2025.product_service.service;

public interface CacheEvictService {
    void evictUserStores(String username);
    void evictProductDetails(String productId);
    void evictProductCaches(String productId);
    void evictVariantCaches(String variantId);
    
    /**
     * Xóa toàn bộ cache tìm kiếm sản phẩm
     * Được gọi khi thêm/xóa sản phẩm để đảm bảo kết quả tìm kiếm luôn chính xác
     */
    void evictProductSearchCache();
}
