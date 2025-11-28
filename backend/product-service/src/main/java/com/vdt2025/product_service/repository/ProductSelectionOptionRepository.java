package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductSelectionOption;
import com.vdt2025.product_service.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ProductSelectionOption
 */
@Repository
public interface ProductSelectionOptionRepository extends JpaRepository<ProductSelectionOption, String> {
    
    /**
     * Tìm tất cả options của một selection group
     */
    List<ProductSelectionOption> findBySelectionGroupIdOrderByDisplayOrderAsc(String groupId);
    
    /**
     * Tìm tất cả options active của một selection group
     */
    List<ProductSelectionOption> findBySelectionGroupIdAndIsActiveTrueOrderByDisplayOrderAsc(String groupId);
    
    /**
     * Tìm option theo group ID và option ID
     */
    Optional<ProductSelectionOption> findByIdAndSelectionGroupId(String id, String groupId);
    
    /**
     * Kiểm tra value đã tồn tại trong group chưa
     */
    boolean existsBySelectionGroupIdAndValueIgnoreCase(String groupId, String value);
    
    /**
     * Kiểm tra value đã tồn tại (trừ option hiện tại)
     */
    boolean existsBySelectionGroupIdAndValueIgnoreCaseAndIdNot(String groupId, String value, String id);
    
    /**
     * Tìm options theo danh sách IDs (với eager fetch variants)
     */
    @Query("""
        SELECT DISTINCT o FROM ProductSelectionOption o
        LEFT JOIN FETCH o.variants v
        WHERE o.id IN :optionIds
        AND o.isActive = true
    """)
    List<ProductSelectionOption> findByIdInWithVariants(@Param("optionIds") List<String> optionIds);
    
    /**
     * Tìm variant dựa trên combination của options
     * Query này tìm variant có ĐÚNG tất cả options được chỉ định
     */
    @Query("""
        SELECT v FROM ProductVariant v
        JOIN v.selectionOptions o
        WHERE v.product.id = :productId
        AND v.isActive = true
        AND o.id IN :optionIds
        GROUP BY v.id
        HAVING COUNT(DISTINCT o.id) = :count
    """)
    Optional<ProductVariant> findVariantByOptionIds(
        @Param("productId") String productId,
        @Param("optionIds") List<String> optionIds,
        @Param("count") Long count
    );
    
    /**
     * Lấy max displayOrder của group
     */
    @Query("SELECT COALESCE(MAX(o.displayOrder), 0) FROM ProductSelectionOption o WHERE o.selectionGroup.id = :groupId")
    Integer findMaxDisplayOrderByGroupId(@Param("groupId") String groupId);
    
    /**
     * Đếm số options của một group
     */
    long countBySelectionGroupId(String groupId);
    
    /**
     * Tìm tất cả options của một product (qua group)
     */
    @Query("""
        SELECT o FROM ProductSelectionOption o
        JOIN o.selectionGroup g
        WHERE g.product.id = :productId
        ORDER BY g.displayOrder ASC, o.displayOrder ASC
    """)
    List<ProductSelectionOption> findAllByProductId(@Param("productId") String productId);
}
