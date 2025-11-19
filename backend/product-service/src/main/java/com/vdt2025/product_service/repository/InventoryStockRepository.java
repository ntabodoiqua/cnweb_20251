package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, String> {
    Optional<InventoryStock> findByProductVariantId(String id);
}
