package com.cnweb.inventory_service.repository;

import com.cnweb.inventory_service.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    
    /**
     * Tìm inventory theo productId và storeId
     */
    Optional<Inventory> findByProductIdAndStoreId(String productId, String storeId);
    
    /**
     * Tìm inventory theo productId và storeId với pessimistic lock
     * (để tránh race condition khi reserve/release)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.productId = :productId AND i.storeId = :storeId")
    Optional<Inventory> findByProductIdAndStoreIdWithLock(@Param("productId") String productId, 
                                                           @Param("storeId") String storeId);
    
    /**
     * Tìm tất cả inventory của một store
     */
    List<Inventory> findByStoreId(String storeId);
    
    /**
     * Tìm tất cả inventory của một product (từ tất cả các store)
     */
    List<Inventory> findByProductId(String productId);
    
    /**
     * Tìm các inventory cần bổ sung hàng (totalQuantity < minStockLevel)
     */
    @Query("SELECT i FROM Inventory i WHERE i.totalQuantity < i.minStockLevel")
    List<Inventory> findInventoriesNeedingRestock();
    
    /**
     * Tìm các inventory cần bổ sung hàng của một store
     */
    @Query("SELECT i FROM Inventory i WHERE i.storeId = :storeId AND i.totalQuantity < i.minStockLevel")
    List<Inventory> findInventoriesNeedingRestockByStore(@Param("storeId") String storeId);
    
    /**
     * Kiểm tra xem có tồn tại inventory cho product và store không
     */
    boolean existsByProductIdAndStoreId(String productId, String storeId);
    
    /**
     * Xóa inventory theo productId và storeId
     */
    void deleteByProductIdAndStoreId(String productId, String storeId);
}
