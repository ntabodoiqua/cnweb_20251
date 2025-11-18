package com.cnweb.order_service.repository;

import com.cnweb.order_service.entity.Coupon;
import com.cnweb.order_service.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * CouponRepository - Repository cho Coupon entity
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, String>, JpaSpecificationExecutor<Coupon> {

    /**
     * Tìm coupon theo code
     */
    Optional<Coupon> findByCode(String code);

    /**
     * Tìm coupon theo code và active
     */
    Optional<Coupon> findByCodeAndIsActive(String code, boolean isActive);

    /**
     * Kiểm tra code đã tồn tại chưa
     */
    boolean existsByCode(String code);

    /**
     * Tìm tất cả coupons của store
     */
    Page<Coupon> findByStoreId(String storeId, Pageable pageable);

    /**
     * Tìm tất cả coupons active của store
     */
    Page<Coupon> findByStoreIdAndIsActive(String storeId, boolean isActive, Pageable pageable);

    /**
     * Tìm tất cả coupons public (không thuộc store cụ thể nào)
     */
    Page<Coupon> findByIsStoreSpecificFalseAndIsActive(boolean isActive, Pageable pageable);

    /**
     * Tìm coupons theo loại giảm giá
     */
    List<Coupon> findByDiscountTypeAndIsActive(DiscountType discountType, boolean isActive);

    /**
     * Tìm coupons đang hiệu lực
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND c.validFrom <= :now AND c.validTo >= :now " +
           "AND (c.maxUsageTotal IS NULL OR c.usedCount < c.maxUsageTotal)")
    List<Coupon> findValidCoupons(@Param("now") LocalDateTime now);

    /**
     * Tìm coupons đang hiệu lực cho store cụ thể hoặc public
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND c.validFrom <= :now AND c.validTo >= :now " +
           "AND (c.maxUsageTotal IS NULL OR c.usedCount < c.maxUsageTotal) " +
           "AND (c.storeId = :storeId OR c.isStoreSpecific = false)")
    List<Coupon> findValidCouponsForStore(
        @Param("storeId") String storeId, 
        @Param("now") LocalDateTime now
    );

    /**
     * Tìm coupons sắp hết hạn
     */
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND c.validTo BETWEEN :startDate AND :endDate")
    List<Coupon> findExpiringCoupons(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Tìm coupons đã hết lượt sử dụng
     */
    @Query("SELECT c FROM Coupon c WHERE c.maxUsageTotal IS NOT NULL " +
           "AND c.usedCount >= c.maxUsageTotal")
    List<Coupon> findFullyUsedCoupons();
}
