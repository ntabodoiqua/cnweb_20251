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
    int countByUserIdAndCouponId(String userId, String couponId);
}
