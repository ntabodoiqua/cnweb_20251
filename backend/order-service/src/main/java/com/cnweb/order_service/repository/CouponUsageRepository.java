package com.cnweb.order_service.repository;

import com.cnweb.order_service.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CouponUsageRepository - Repository cho CouponUsage entity
 */
@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, String> {

    /**
     * Tìm tất cả usage của user cho một coupon
     */
    List<CouponUsage> findByUserIdAndCouponId(String userId, String couponId);

    /**
     * Đếm số lần user đã sử dụng coupon
     */
    int countByUserIdAndCouponId(String userId, String couponId);

    /**
     * Đếm số lần user đã sử dụng coupon code
     */
    int countByUserIdAndCouponCode(String userId, String couponCode);

    /**
     * Tìm tất cả usages của một coupon
     */
    List<CouponUsage> findByCouponId(String couponId);

    /**
     * Tìm tất cả usages của một user
     */
    List<CouponUsage> findByUserId(String userId);

    /**
     * Kiểm tra user đã sử dụng coupon cho order chưa
     */
    boolean existsByUserIdAndOrderId(String userId, String orderId);

    /**
     * Tìm usage theo order
     */
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.orderId = :orderId")
    List<CouponUsage> findByOrderId(@Param("orderId") String orderId);
}
