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

    /**
     * Thống kê tổng quan sản phẩm toàn hệ thống
     */
    @Query(value = """
        WITH category_stats AS (
            SELECT
                c.id AS category_id,
                to_jsonb(c.name) AS category_name,
                to_jsonb(c.image_url) AS image_url,
                COUNT(DISTINCT p.id) AS product_count,
                COALESCE(SUM(ist.quantity_on_hand), 0) AS product_variant_count,
                COALESCE(SUM(CASE WHEN pv.is_active = true THEN ist.quantity_on_hand ELSE 0 END), 0) AS product_variant_active_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN inventory_stocks ist ON ist.product_variant_id = pv.id
            WHERE c.category_type = 'PLATFORM'  
            GROUP BY c.id
        ),
        brand_stats AS (
            SELECT
                b.id AS brand_id,
                to_jsonb(b.name) AS brand_name,
                to_jsonb(b.logo_url) AS logo_url,
                COUNT(DISTINCT p.id) AS product_count,
                COALESCE(SUM(ist.quantity_on_hand), 0) AS product_variant_count,
                COALESCE(SUM(CASE WHEN pv.is_active = true THEN ist.quantity_on_hand ELSE 0 END), 0) AS product_variant_active_count
            FROM brands b
            LEFT JOIN products p ON p.brand_id = b.id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN inventory_stocks ist ON ist.product_variant_id = pv.id
            GROUP BY b.id
        ),
        all_stores AS (
            SELECT
                s.id,
                s.store_name,
                s.store_description,
                s.logo_name,
                s.logo_url,
                s.banner_name,
                s.banner_url,
                s.contact_email,
                s.contact_phone,
                s.shop_address,
                s.province_id,
                s.ward_id,
                s.is_active,
                s.created_at,
                s.updated_at
            FROM stores s
        ),
        top_rated_products AS (
            SELECT
                p.id,
                p.name,
                p.short_description,
                pi.image_url AS thumbnail_image,
                p.min_price,
                p.max_price,
                p.sold_count,
                p.average_rating,
                p.rating_count,
                p.is_active,
                (
                    SELECT s.store_name FROM stores s WHERE s.id = p.store_id
                ) AS store_name,
                p.store_id,
                (
                    SELECT jsonb_agg(c.name)\s
                    FROM categories c\s
                    JOIN product_store_categories psc ON psc.category_id = c.id\s
                    WHERE psc.product_id = p.id AND c.category_type = 'STORE'
                ) AS store_category_name,
                c.name AS platform_category_name,
                b.name AS brand_name,
                p.created_at,
                (
                    SELECT COALESCE(SUM(ist.quantity_on_hand), 0)
                    FROM product_variants pv
                    JOIN inventory_stocks ist ON ist.product_variant_id = pv.id
                    WHERE pv.product_id = p.id
                ) AS total_available_stock
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id
            LEFT JOIN stores s ON p.store_id = s.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE AND p.average_rating = 5.0 AND p.rating_count > 0\s
            ORDER BY p.rating_count DESC, p.sold_count DESC
            LIMIT 10
        )
            
        SELECT CAST(jsonb_build_object(
            'totalProducts', (SELECT COUNT(*) FROM products),
            'activeProducts', (SELECT COUNT(*) FROM products WHERE is_active = true),
            'totalVariants', (SELECT COALESCE(SUM(quantity_on_hand), 0) FROM inventory_stocks),
            'activeVariants', (SELECT COALESCE(SUM(ist.quantity_on_hand), 0)
                               FROM inventory_stocks ist
                               JOIN product_variants pv ON ist.product_variant_id = pv.id
                               WHERE pv.is_active = true),
            'variantsByCategory', (SELECT jsonb_agg(jsonb_build_object(
                                        'categoryName', category_name,
                                        'imageUrl', image_url,
                                        'productCount', product_count,
                                        'productVariantCount', product_variant_count,
                                        'productVariantActiveCount', product_variant_active_count
                                    ))
                                   FROM category_stats),
            'variantsByBrand', (SELECT jsonb_agg(jsonb_build_object(
                                        'brandName', brand_name,
                                        'logoUrl', logo_url,
                                        'productCount', product_count,
                                        'productVariantCount', product_variant_count,
                                        'productVariantActiveCount', product_variant_active_count
                                     ))
                               FROM brand_stats),
            'stores', (SELECT jsonb_agg(jsonb_build_object(
                                                'id', s.id,
                                                'storeName', s.store_name,
                                                'storeDescription', s.store_description,
                                                'logoName', s.logo_name,
                                                'logoUrl', s.logo_url,
                                                'bannerName', s.banner_name,
                                                'bannerUrl', s.banner_url,
                                                'contactEmail', s.contact_email,
                                                'contactPhone', s.contact_phone,
                                                'shopAddress', s.shop_address,
                                                'provinceId', s.province_id,
                                                'wardId', s.ward_id,
                                                'isActive', s.is_active,
                                                'createdAt', s.created_at,
                                                'updatedAt', s.updated_at
                                            ))
                                                 FROM all_stores s),
            'topRatedProducts', (SELECT jsonb_agg(jsonb_build_object(
                                        'id', p.id,
                                        'name', p.name,
                                        'shortDescription', p.short_description,
                                        'thumbnailImage', p.thumbnail_image,
                                        'minPrice', p.min_price,
                                        'maxPrice', p.max_price,
                                        'soldCount', p.sold_count,
                                        'averageRating', p.average_rating,
                                        'ratingCount', p.rating_count,
                                        'active', p.is_active,
                                        'storeName', p.store_name,
                                        'storeId', p.store_id,
                                        'storeCategoryName', p.store_category_name,
                                        'platformCategoryName', p.platform_category_name,
                                        'brandName', p.brand_name,
                                        'createdAt', p.created_at,
                                        'totalAvailableStock', p.total_available_stock
                                    ))
                                         FROM top_rated_products p)
        ) AS text) AS statistics;
        """, nativeQuery = true)
    String getProductStatisticsOverviewJson();
}
