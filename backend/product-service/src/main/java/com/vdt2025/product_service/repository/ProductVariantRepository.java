package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ProductVariant
 */
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
}
