package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.request.CouponCreationRequest;
import com.cnweb.order_service.dto.response.CouponResponse;
import com.cnweb.order_service.dto.response.CouponValidationResponse;
import com.cnweb.order_service.entity.Coupon;

import java.math.BigDecimal;
import java.util.List;

public interface CouponService {
    CouponResponse createCoupon(CouponCreationRequest request);
    CouponResponse getCouponById(String id);
    CouponResponse getCouponByCode(String code);
    List<CouponResponse> getAllCoupons();
    void deleteCoupon(String id);
    
    /**
     * Validate coupon and calculate discount
     * @param code Coupon code
     * @param orderAmount Total order amount (eligible for discount)
     * @param userId User ID
     * @param storeId Store ID (optional, for store-specific checks)
     * @return Validation result with discount amount
     */
    CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount, String userId, String storeId);

    /**
     * Mark coupon as used
     */
    void useCoupon(String couponId, String userId, String orderId);
    
    /**
     * Revert coupon usage (e.g. when order is cancelled)
     */
    void revertCouponUsage(String couponId, String userId, String orderId);
}
