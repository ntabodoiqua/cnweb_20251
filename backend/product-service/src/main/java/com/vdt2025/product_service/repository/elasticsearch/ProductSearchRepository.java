package com.vdt2025.product_service.repository.elasticsearch;

import com.vdt2025.product_service.document.ProductDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Elasticsearch Repository cho ProductDocument
 * Cung cấp các phương thức tìm kiếm cơ bản và custom queries
 */
@Repository
public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {

    /**
     * Tìm kiếm theo tên sản phẩm (full-text search)
     */
    Page<ProductDocument> findByNameContaining(String name, Pageable pageable);

    /**
     * Tìm kiếm theo category
     */
    Page<ProductDocument> findByCategoryId(String categoryId, Pageable pageable);

    /**
     * Tìm kiếm theo store
     */
    Page<ProductDocument> findByStoreId(String storeId, Pageable pageable);

    /**
     * Tìm kiếm theo brand
     */
    Page<ProductDocument> findByBrandId(String brandId, Pageable pageable);

    /**
     * Tìm sản phẩm active
     */
    Page<ProductDocument> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);

    /**
     * Tìm theo category và active
     */
    Page<ProductDocument> findByCategoryIdAndIsActiveTrueAndIsDeletedFalse(String categoryId, Pageable pageable);

    /**
     * Tìm theo store và active
     */
    Page<ProductDocument> findByStoreIdAndIsActiveTrueAndIsDeletedFalse(String storeId, Pageable pageable);

    /**
     * Tìm theo khoảng giá
     */
    Page<ProductDocument> findByMinPriceBetweenAndIsActiveTrueAndIsDeletedFalse(
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    /**
     * Tìm sản phẩm thuộc nhiều categories
     */
    Page<ProductDocument> findByCategoryIdIn(List<String> categoryIds, Pageable pageable);

    /**
     * Tìm sản phẩm theo category path (hỗ trợ hierarchy)
     */
    Page<ProductDocument> findByCategoryPathContaining(String categoryId, Pageable pageable);

    /**
     * Xóa tất cả document theo productId
     */
    void deleteById(String id);

    /**
     * Xóa theo store
     */
    void deleteByStoreId(String storeId);

    /**
     * Kiểm tra tồn tại
     */
    boolean existsById(String id);

    /**
     * Đếm số sản phẩm active
     */
    long countByIsActiveTrueAndIsDeletedFalse();

    /**
     * Đếm số sản phẩm theo category
     */
    long countByCategoryId(String categoryId);

    /**
     * Đếm số sản phẩm theo store
     */
    long countByStoreId(String storeId);
}
