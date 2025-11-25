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
    Optional<Coupon> findByCode(String code);
    boolean existsByCode(String code);
}
