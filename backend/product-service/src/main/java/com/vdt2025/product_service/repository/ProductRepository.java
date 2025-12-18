package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Product với các query methods cho e-commerce
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

    /**
     * Tìm kiếm các sản phẩm thuộc danh mục
     */
    @Query(value = "SELECT * FROM products WHERE category_id = :categoryId", nativeQuery = true)
    List<Product> findAllByCategoryId(String categoryId);

    /**
     * Tìm sản phẩm theo store ID với pagination
     */
    Page<Product> findByStoreId(String storeId, Pageable pageable);

    /**
     * Tìm sản phẩm theo category ID với pagination
     */
    Page<Product> findByCategoryId(String categoryId, Pageable pageable);

    /**
     * Tìm sản phẩm active theo store
     */
    Page<Product> findByStoreIdAndIsActiveTrue(String storeId, Pageable pageable);

    /**
     * Tìm sản phẩm chưa bị xóa theo store
     */
    Page<Product> findByStoreIdAndIsDeletedFalse(String storeId, Pageable pageable);

    /**
     * Tìm sản phẩm active theo category
     */
    Page<Product> findByCategoryIdAndIsActiveTrue(String categoryId, Pageable pageable);

    /**
     * Tìm sản phẩm active theo brand
     */
    Page<Product> findByBrandIdAndIsActiveTrue(String categoryId, Pageable pageable);

    // Tìm sản phẩm thuộc brand và set active = false
    @Modifying
    @Query("UPDATE Product p SET p.isActive = false WHERE p.brand.id = :brandId")
    void deactivateProductsByBrandId(@Param("brandId") String brandId);


    /**
     * Kiểm tra sản phẩm tồn tại theo tên
     */
    boolean existsByNameAndStoreId(String name, String storeId);

    /**
     * Kiểm tra sản phẩm tồn tại theo tên và store (trừ product hiện tại)
     */
    boolean existsByNameAndStoreIdAndIdNot(String name, String storeId, String productId);

    /**
     * Tăng view count
     */
    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :productId")
    int incrementViewCount(@Param("productId") String productId);

    /**
     * Cập nhật sold count
     */
    @Modifying
    @Query("UPDATE Product p SET p.soldCount = p.soldCount + :quantity WHERE p.id = :productId")
    int updateSoldCount(@Param("productId") String productId, @Param("quantity") Integer quantity);

    /**
     * Cập nhật rating
     */
    @Modifying
    @Query("UPDATE Product p SET p.averageRating = :averageRating, p.ratingCount = :ratingCount WHERE p.id = :productId")
    int updateRating(@Param("productId") String productId, @Param("averageRating") Double averageRating, @Param("ratingCount") Integer ratingCount);


    // Lấy danh sách productId mà user này có quyền sửa
    @Query(
            value = """
            SELECT p.id 
            FROM products p
            JOIN stores s ON p.store_id = s.id
            WHERE p.id IN (:ids)
              AND s.user_name = :username
        """,
            nativeQuery = true
    )
    List<String> findAccessibleProductIdsNative(
            @Param("ids") List<String> ids,
            @Param("username") String username);

    // Bulk update status product (native)
    @Modifying
    @Query(
            value = """
            UPDATE products
            SET is_active = :status
            WHERE id IN (:ids)
        """,
            nativeQuery = true
    )
    int bulkUpdateStatusNative(
            @Param("ids") List<String> ids,
            @Param("status") boolean status);

    /**
     * Fetch products với tất cả relations cần thiết cho Elasticsearch indexing
     * Sử dụng JOIN FETCH để tránh LazyInitializationException
     * Note: Removed bag fetches to avoid MultipleBagFetchException
     */
    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.category c
        LEFT JOIN FETCH c.parentCategory
        LEFT JOIN FETCH p.store
        LEFT JOIN FETCH p.brand
        WHERE p.isDeleted = false
        ORDER BY p.createdAt DESC
    """)
    List<Product> findAllForElasticsearchIndexing();

    /**
     * Fetch products với pagination cho Elasticsearch sync
     * Note: Cannot use JOIN FETCH with pagination directly, so use EntityGraph
     */
    @Query("""
        SELECT p FROM Product p
        WHERE p.isDeleted = false
        ORDER BY p.createdAt DESC
    """)
    @org.springframework.data.jpa.repository.EntityGraph(
        attributePaths = {"category", "store", "brand", "storeCategories"}
    )
    Page<Product> findAllForElasticsearchSync(Pageable pageable);

    /**
     * Fetch single product với tất cả relations cho Elasticsearch
     * Note: Removed bag fetches (storeCategories, selectionGroups) to avoid MultipleBagFetchException.
     * These will be lazy loaded within the transaction.
     */
    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.category c
        LEFT JOIN FETCH c.parentCategory
        LEFT JOIN FETCH p.store
        LEFT JOIN FETCH p.brand
        WHERE p.id = :productId
    """)
    java.util.Optional<Product> findByIdForElasticsearch(@Param("productId") String productId);
}