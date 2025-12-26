package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.SpecTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecTemplateRepository extends JpaRepository<SpecTemplate, String> {
    
    /**
     * Tìm tất cả template theo category
     */
    List<SpecTemplate> findByCategoryIdAndIsActiveTrue(String categoryId);
    
    /**
     * Tìm tất cả template active
     */
    List<SpecTemplate> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    /**
     * Kiểm tra tồn tại template theo tên và category
     */
    boolean existsByNameAndCategoryId(String name, String categoryId);
}
