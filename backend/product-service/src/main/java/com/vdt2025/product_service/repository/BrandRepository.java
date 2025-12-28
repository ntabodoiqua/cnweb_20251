package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, String>, JpaSpecificationExecutor<Brand> {
    boolean existsByNameIgnoreCase(String name);
    
    Optional<Brand> findByName(String name);

    Optional<Brand> findByIdAndIsActiveTrue(String id);

    /**
     * Đếm số brand đang active
     */
    long countByIsActiveTrue();
}
