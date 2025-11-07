package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductVariant;
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
     * Cập nhật số lượng tồn kho
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity - :quantity WHERE v.id = :variantId AND v.stockQuantity >= :quantity")
    int decreaseStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);
    
    /**
     * Tăng số lượng tồn kho
     */
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity + :quantity WHERE v.id = :variantId")
    int increaseStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);
    
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
}
