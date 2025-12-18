package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.InventoryTransaction;
import com.vdt2025.product_service.entity.InventoryTransaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {

    /**
     * Lấy lịch sử transaction của variant
     */
    Page<InventoryTransaction> findByVariantIdOrderByCreatedAtDesc(String variantId, Pageable pageable);

    /**
     * Lấy transaction theo type
     */
    Page<InventoryTransaction> findByTransactionTypeOrderByCreatedAtDesc(
            TransactionType transactionType, Pageable pageable);

    /**
     * Lấy transaction theo variant và type
     */
    List<InventoryTransaction> findByVariantIdAndTransactionTypeOrderByCreatedAtDesc(
            String variantId, TransactionType transactionType);

    /**
     * Lấy transaction theo reference
     */
    List<InventoryTransaction> findByReferenceTypeAndReferenceId(String referenceType, String referenceId);

    /**
     * Lấy transaction trong khoảng thời gian
     */
    @Query("SELECT t FROM InventoryTransaction t " +
           "WHERE t.variant.id = :variantId " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.createdAt DESC")
    List<InventoryTransaction> findByVariantIdAndDateRange(
            @Param("variantId") String variantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Tính tổng quantity change theo type
     */
    @Query("SELECT SUM(t.quantityChange) FROM InventoryTransaction t " +
           "WHERE t.variant.id = :variantId " +
           "AND t.transactionType = :type")
    Integer sumQuantityChangeByType(
            @Param("variantId") String variantId,
            @Param("type") TransactionType type);
}
