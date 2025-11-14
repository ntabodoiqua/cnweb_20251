package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, String> {
    boolean existsByNameIgnoreCase(String name);
    List<ProductAttribute> findByCategories_Id(String categoryId);
    List<ProductAttribute> findByProductId(String productId);
}