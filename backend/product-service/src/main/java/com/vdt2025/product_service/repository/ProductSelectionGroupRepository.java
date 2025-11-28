package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductSelectionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ProductSelectionGroup
 */
@Repository
public interface ProductSelectionGroupRepository extends JpaRepository<ProductSelectionGroup, String> {
    
    /**
     * Tìm tất cả selection groups của một product
     */
    List<ProductSelectionGroup> findByProductIdOrderByDisplayOrderAsc(String productId);
    
    /**
     * Tìm tất cả selection groups active của một product
     */
    List<ProductSelectionGroup> findByProductIdAndIsActiveTrueOrderByDisplayOrderAsc(String productId);
    
    /**
     * Tìm selection group theo product ID và group ID
     */
    Optional<ProductSelectionGroup> findByIdAndProductId(String id, String productId);
    
    /**
     * Kiểm tra tên group đã tồn tại trong product chưa
     */
    boolean existsByProductIdAndNameIgnoreCase(String productId, String name);
    
    /**
     * Kiểm tra tên group đã tồn tại (trừ group hiện tại)
     */
    boolean existsByProductIdAndNameIgnoreCaseAndIdNot(String productId, String name, String id);
    
    /**
     * Lấy selection groups kèm options (eager fetch)
     */
    @Query("""
        SELECT DISTINCT g FROM ProductSelectionGroup g
        LEFT JOIN FETCH g.options o
        WHERE g.product.id = :productId
        AND g.isActive = true
        ORDER BY g.displayOrder ASC, o.displayOrder ASC
    """)
    List<ProductSelectionGroup> findByProductIdWithOptions(@Param("productId") String productId);
    
    /**
     * Đếm số groups của một product
     */
    long countByProductId(String productId);
    
    /**
     * Lấy max displayOrder của product
     */
    @Query("SELECT COALESCE(MAX(g.displayOrder), 0) FROM ProductSelectionGroup g WHERE g.product.id = :productId")
    Integer findMaxDisplayOrderByProductId(@Param("productId") String productId);
}
