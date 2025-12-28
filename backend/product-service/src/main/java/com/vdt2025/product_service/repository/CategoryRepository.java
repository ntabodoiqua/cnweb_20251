package com.vdt2025.product_service.repository;
import com.vdt2025.product_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String>, JpaSpecificationExecutor<Category> {
    boolean existsByName(String name);

    Optional<Category> findByName(String name);

    /**
     * Kiểm tra tên category có tồn tại trong platform categories
     */
    boolean existsByNameAndCategoryType(String name, Category.CategoryType categoryType);

    /**
     * Kiểm tra tên category có tồn tại trong store categories của một store cụ thể
     */
    boolean existsByNameAndCategoryTypeAndStoreId(String name, Category.CategoryType categoryType, String storeId);

    /**
     * Lấy tất cả platform categories (root level - không có parent)
     */
    @Query("SELECT c FROM Category c WHERE c.categoryType = 'PLATFORM' AND c.parentCategory IS NULL")
    List<Category> findAllPlatformRootCategories();

    /**
     * Lấy tất cả platform categories (bao gồm cả sub-categories)
     */
    List<Category> findAllByCategoryType(Category.CategoryType categoryType);

    /**
     * Lấy tất cả store categories của một store cụ thể
     */
    @Query("SELECT c FROM Category c WHERE c.categoryType = 'STORE' AND c.store.id = :storeId")
    List<Category> findAllByStoreId(@Param("storeId") String storeId);

    /**
     * Lấy sub-categories của một parent category
     */
    List<Category> findAllByParentCategoryId(String parentId);

    /**
     * Tìm category theo ID và loại
     */
    Optional<Category> findByIdAndCategoryType(String id, Category.CategoryType categoryType);

    /**
     * Tìm category theo ID và store ID (cho store categories)
     */
    @Query("SELECT c FROM Category c WHERE c.id = :categoryId AND c.store.id = :storeId AND c.categoryType = 'STORE'")
    Optional<Category> findByIdAndStoreId(@Param("categoryId") String categoryId, @Param("storeId") String storeId);

    @Query("SELECT c.id FROM Category c WHERE c.id IN :ids")
    List<String> findExistingIds(@Param("ids") List<String> ids);

    boolean existsByIdAndStoreId(String id, String storeId);

    List<Category> findByStoreId(String storeId);

    /**
     * Load category với parent hierarchy cho Elasticsearch indexing
     */
    @Query("""
        SELECT c FROM Category c
        LEFT JOIN FETCH c.parentCategory p1
        LEFT JOIN FETCH p1.parentCategory p2
        LEFT JOIN FETCH p2.parentCategory p3
        WHERE c.id = :categoryId
    """)
    Optional<Category> findByIdWithParentHierarchy(@Param("categoryId") String categoryId);

    /**
     * Đếm số category platform đang active
     */
    long countByCategoryTypeAndIsActiveTrue(Category.CategoryType categoryType);
}