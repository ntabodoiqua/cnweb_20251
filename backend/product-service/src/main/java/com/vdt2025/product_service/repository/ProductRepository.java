package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {
    // Tìm kiếm các sản phẩm thuộc danh mục theo tên
    @Query(value = "SELECT * FROM product WHERE category_id = :categoryId", nativeQuery = true)
    List<Product> findAllByCategoryId(String categoryId);

    boolean existsByName(String name);
}
