package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ProductVariant
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

    /**
     * Tìm tất cả variants của một sản phẩm
     */
    List<ProductVariant> findByProductId(String productId);

    /**
     * Tìm tất cả variants theo danh sách IDs kèm theo Product và InventoryStock (eager fetch)
     */
    // Trong ProductVariantRepository.java
    @Query("SELECT v FROM ProductVariant v " +
            "JOIN FETCH v.product p " +
            "JOIN FETCH p.store s " +
            "LEFT JOIN FETCH v.inventoryStock " +
            "WHERE v.id IN :ids")
    List<ProductVariant> findAllByIdWithDetails(@Param("ids") List<String> ids);


    /**
     * Tìm variant theo SKU
     */
    Optional<ProductVariant> findBySku(String sku);

    /**
     * Kiểm tra SKU đã tồn tại
     */
    boolean existsBySku(String sku);
    
    /**
     * Tìm variant theo product ID và variant ID
     */
    Optional<ProductVariant> findByProductIdAndId(String productId, String variantId);

    /**
     * Tìm tất cả variants đang active của một sản phẩm
     */
    List<ProductVariant> findByProductIdAndIsActiveTrue(String productId);

    /**
     * Cập nhật sold quantity
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.soldQuantity = v.soldQuantity + :quantity WHERE v.id = :variantId")
    int updateSoldQuantity(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Tìm variant dựa trên combination của attribute values
     * Query này sử dụng HAVING COUNT để đảm bảo variant có ĐÚNG tất cả attribute values được chỉ định
     *
     * Ví dụ: Tìm variant có Màu Đỏ (val-1) và Size M (val-3)
     * - Variant phải có cả 2 attribute values này
     * - Variant không được có thêm attribute values khác
     *
     * @param productId ID của product
     * @param attributeValueIds Danh sách ID của attribute values (Đỏ, Size M, ...)
     * @param count Số lượng attribute values (dùng để check EXACT match)
     * @return Optional<ProductVariant>
     */
    @Query("""
        SELECT v FROM ProductVariant v
        JOIN v.attributeValues av
        WHERE v.product.id = :productId
        AND v.isActive = true
        AND av.id IN :attributeValueIds
        GROUP BY v.id
        HAVING COUNT(DISTINCT av.id) = :count
        AND SIZE(v.attributeValues) = :count
    """)
    Optional<ProductVariant> findByProductIdAndAttributeValues(
        @Param("productId") String productId,
        @Param("attributeValueIds") List<String> attributeValueIds,
        @Param("count") Long count
    );

    /**
     * Lấy tất cả variants active của product kèm theo attribute values (eager fetch)
     * Dùng LEFT JOIN FETCH để tránh N+1 query problem
     */
    @Query("""
        SELECT DISTINCT v FROM ProductVariant v
        LEFT JOIN FETCH v.attributeValues av
        LEFT JOIN FETCH av.attribute
        WHERE v.product.id = :productId
        AND v.isActive = true
        ORDER BY v.createdAt DESC
    """)
    List<ProductVariant> findByProductIdWithAttributeValues(@Param("productId") String productId);

    List<ProductVariant> findByProductIdAndIdIn(String productId, List<String> variantIds);

    @Modifying
    @Query(
            value = """
            UPDATE product_variants
            SET is_active = :status
            WHERE product_id IN (:productIds)
        """,
            nativeQuery = true
    )
    int bulkUpdateVariantStatusNative(
            @Param("productIds") List<String> productIds,
            @Param("status") boolean status);
    
    /**
     * Lấy variants với selection options (eager fetch)
     */
    @Query("""
        SELECT DISTINCT v FROM ProductVariant v
        LEFT JOIN FETCH v.selectionOptions so
        LEFT JOIN FETCH so.selectionGroup sg
        WHERE v.product.id = :productId
        AND v.isActive = true
        ORDER BY v.createdAt DESC
    """)
    List<ProductVariant> findByProductIdWithSelectionOptions(@Param("productId") String productId);
    
    /**
     * Lấy variants với selection options VÀ inventory stock (eager fetch)
     * Dùng cho getProductSelectionConfig để tránh N+1
     */
    @Query("""
        SELECT DISTINCT v FROM ProductVariant v
        LEFT JOIN FETCH v.selectionOptions so
        LEFT JOIN FETCH so.selectionGroup sg
        LEFT JOIN FETCH v.inventoryStock
        WHERE v.product.id = :productId
        AND v.isActive = true
    """)
    List<ProductVariant> findByProductIdWithSelectionsAndStock(@Param("productId") String productId);
}
