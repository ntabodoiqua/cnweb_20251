package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.InventoryStock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho InventoryStock với best practices:
 * - Pessimistic Locking: Sử dụng SELECT FOR UPDATE để lock row khi cần atomic operations
 * - Optimistic Locking: Entity có @Version field để tránh race condition
 * - Batch Operations: Hỗ trợ bulk update cho performance
 * - Query Optimization: Index trên các điều kiện WHERE quan trọng
 */
@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, String> {
    
    /**
     * Tìm inventory theo variant ID (read-only)
     */
    Optional<InventoryStock> findByProductVariantId(String id);

    /**
     * Tìm inventory theo danh sách variant IDs (read-only, batch query)
     * Dùng cho hydration pattern - lấy stock realtime cho nhiều variants cùng lúc
     */
    List<InventoryStock> findByProductVariantIdIn(List<String> variantIds);

    /**
     * Tìm inventory theo variant ID với Pessimistic Write Lock
     * Sử dụng khi cần atomic update (reserve, confirm, release)
     * Lock sẽ được giữ cho đến khi transaction commit/rollback
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM InventoryStock i WHERE i.productVariant.id = :variantId")
    Optional<InventoryStock> findByProductVariantIdWithLock(@Param("variantId") String variantId);

    /**
     * Tìm các inventory có available stock thấp (dưới threshold)
     * Dùng cho alert low stock
     */
    @Query("SELECT i FROM InventoryStock i WHERE (i.quantityOnHand - i.quantityReserved) < :threshold")
    List<InventoryStock> findLowStockItems(@Param("threshold") Integer threshold);

    /**
     * Tìm các inventory đang có reserved stock
     * Dùng cho monitoring pending orders
     */
    @Query("SELECT i FROM InventoryStock i WHERE i.quantityReserved > 0")
    List<InventoryStock> findItemsWithReservedStock();

    /**
     * Giảm số lượng tồn kho (Dùng cho seller khi bỏ hàng)
     * Điều kiện:
     * - quantityOnHand >= quantity (đủ hàng)
     * - (quantityOnHand - quantity) >= quantityReserved (sau khi trừ vẫn đủ cover reserved)
     * 
     * @return số lượng rows được update (0 = failed, 1 = success)
     */
    @Modifying
    @Query("UPDATE InventoryStock i " +
           "SET i.quantityOnHand = i.quantityOnHand - :quantity " +
           "WHERE i.productVariant.id = :variantId " +
           "AND i.quantityOnHand >= :quantity " +
           "AND (i.quantityOnHand - :quantity) >= i.quantityReserved")
    int decreaseStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Tăng số lượng tồn kho (Thường dùng khi nhập hàng/hoàn hàng)
     * Không có điều kiện phức tạp, chỉ cần đảm bảo inventory tồn tại
     * 
     * @return số lượng rows được update
     */
    @Modifying
    @Query("UPDATE InventoryStock i " +
           "SET i.quantityOnHand = i.quantityOnHand + :quantity " +
           "WHERE i.productVariant.id = :variantId")
    int increaseStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Giữ chỗ hàng (Tăng reserved) - KHÔNG NÊN DÙNG TRỰC TIẾP
     * Điều kiện: (quantityOnHand - quantityReserved) >= quantity
     * 
     * WARNING: Query này có race condition risk, nên sử dụng service method với locking
     * 
     * @return số lượng rows được update (0 = failed - not enough stock)
     * @deprecated Use InventoryService.reserveStock() instead for proper locking
     */
    @Deprecated
    @Modifying
    @Query("UPDATE InventoryStock i " +
           "SET i.quantityReserved = i.quantityReserved + :quantity " +
           "WHERE i.productVariant.id = :variantId " +
           "AND (i.quantityOnHand - i.quantityReserved) >= :quantity")
    int reserveStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Xác nhận bán (Trừ cả Hand và Reserved) - KHÔNG NÊN DÙNG TRỰC TIẾP
     * Dùng khi Payment Success
     * Điều kiện: quantityReserved >= quantity (đảm bảo đã reserve trước đó)
     * 
     * WARNING: Query này có race condition risk, nên sử dụng service method với locking
     * 
     * @return số lượng rows được update
     * @deprecated Use InventoryService.confirmSale() instead for proper locking
     */
    @Deprecated
    @Modifying
    @Query("UPDATE InventoryStock i " +
           "SET i.quantityOnHand = i.quantityOnHand - :quantity, " +
           "    i.quantityReserved = i.quantityReserved - :quantity " +
           "WHERE i.productVariant.id = :variantId " +
           "AND i.quantityReserved >= :quantity")
    int confirmStockDeduction(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Xả hàng giữ chỗ (Hủy đơn chưa thanh toán / Timeout) - KHÔNG NÊN DÙNG TRỰC TIẾP
     * Logic: Chỉ giảm Reserved, giữ nguyên OnHand
     * Điều kiện: quantityReserved >= quantity
     * 
     * WARNING: Query này có race condition risk, nên sử dụng service method với locking
     * 
     * @return số lượng rows được update
     * @deprecated Use InventoryService.releaseReservation() instead for proper locking
     */
    @Deprecated
    @Modifying
    @Query("UPDATE InventoryStock i " +
           "SET i.quantityReserved = i.quantityReserved - :quantity " +
           "WHERE i.productVariant.id = :variantId " +
           "AND i.quantityReserved >= :quantity")
    int releaseReservedStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Batch update inventory quantities
     * Chỉ dùng cho admin tools hoặc migration
     */
    @Modifying
    @Query("UPDATE InventoryStock i " +
           "SET i.quantityOnHand = :newQuantity " +
           "WHERE i.productVariant.id = :variantId " +
           "AND i.quantityReserved <= :newQuantity")
    int setStockQuantity(@Param("variantId") String variantId, @Param("newQuantity") Integer newQuantity);

    /**
     * Kiểm tra có đủ stock available không
     */
    @Query("SELECT CASE WHEN (i.quantityOnHand - i.quantityReserved) >= :quantity THEN true ELSE false END " +
           "FROM InventoryStock i WHERE i.productVariant.id = :variantId")
    boolean hasAvailableStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);

    /**
     * Lấy số lượng available stock
     */
    @Query("SELECT (i.quantityOnHand - i.quantityReserved) " +
           "FROM InventoryStock i WHERE i.productVariant.id = :variantId")
    Optional<Integer> getAvailableStock(@Param("variantId") String variantId);

    /**
     * Tính tổng tồn kho khả dụng cho một danh sách Product IDs.
     * Logic: Tổng (OnHand - Reserved) của tất cả variants thuộc về product đó.
     * * @param productIds Danh sách ID của Product (Product cha)
     * @return List Object[] gồm: [String productId, Long totalAvailable]
     */
    @Query("SELECT v.product.id, SUM(i.quantityOnHand - i.quantityReserved) " +
            "FROM InventoryStock i " +
            "JOIN i.productVariant v " +
            "WHERE v.product.id IN :productIds " +
            "GROUP BY v.product.id")
    List<Object[]> countTotalAvailableStockByProductIds(@Param("productIds") List<String> productIds);

    /**
     * Lấy thông tin tồn kho của tất cả variants thuộc 1 sản phẩm
     * Trả về: [variantId, quantityOnHand, quantityReserved]
     */
    @Query("SELECT i.productVariant.id, i.quantityOnHand, i.quantityReserved " +
            "FROM InventoryStock i " +
            "WHERE i.productVariant.product.id = :productId")
    List<Object[]> findAllStockByProductId(@Param("productId") String productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM InventoryStock i WHERE i.productVariant.id IN :variantIds")
    List<InventoryStock> findAllByProductVariantIdInWithLock(@Param("variantIds") List<String> variantIds);
}

