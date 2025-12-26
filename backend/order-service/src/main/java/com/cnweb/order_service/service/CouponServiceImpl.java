package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.request.CouponCreationRequest;
import com.cnweb.order_service.dto.response.CouponResponse;
import com.cnweb.order_service.dto.response.CouponValidationResponse;
import com.cnweb.order_service.entity.Coupon;
import com.cnweb.order_service.entity.CouponUsage;
import com.cnweb.order_service.mapper.CouponMapper;
import com.cnweb.order_service.repository.CouponRepository;
import com.cnweb.order_service.repository.CouponUsageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CouponServiceImpl implements CouponService {

    CouponRepository couponRepository;
    CouponUsageRepository couponUsageRepository;
    CouponMapper couponMapper;

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponCreationRequest request) {
        if (couponRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }
        Coupon coupon = couponMapper.toCoupon(request);
        coupon = couponRepository.save(coupon);
        return couponMapper.toCouponResponse(coupon);
    }

    @Override
    public CouponResponse getCouponById(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        return couponMapper.toCouponResponse(coupon);
    }

    @Override
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        return couponMapper.toCouponResponse(coupon);
    }

    @Override
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toCouponResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCoupon(String id) {
        couponRepository.deleteById(id);
    }

    @Override
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount, String userId, String storeId) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        // 1. Check basic validity (active, date, total usage)
        if (!coupon.isValid()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Coupon is expired or inactive")
                    .build();
        }

        // 2. Check store specific
        if (coupon.isStoreSpecific()) {
            if (storeId == null || !storeId.equals(coupon.getStoreId())) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Coupon is not applicable for this store")
                        .build();
            }
        }

        // 3. Check min order amount
        if (!coupon.isApplicableForOrder(orderAmount)) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Order amount does not meet minimum requirement: " + coupon.getMinOrderAmount())
                    .build();
        }

        // 4. Check user usage limit
        int userUsageCount = couponUsageRepository.countByUserIdAndCouponId(userId, coupon.getId());
        if (!coupon.canBeUsedByUser(userUsageCount)) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("You have reached the usage limit for this coupon")
                    .build();
        }

        // 5. Calculate discount
        BigDecimal discount = coupon.calculateDiscount(orderAmount);

        return CouponValidationResponse.builder()
                .valid(true)
                .message("Coupon applied successfully")
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .discountAmount(discount)
                .finalAmount(orderAmount.subtract(discount).max(BigDecimal.ZERO))
                .build();
    }

    @Override
    @Transactional
    public void useCoupon(String couponId, String userId, String orderId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        coupon.incrementUsedCount();
        couponRepository.save(coupon);

        CouponUsage usage = CouponUsage.builder()
                .userId(userId)
                .couponId(couponId)
                .couponCode(coupon.getCode())
                .orderId(orderId)
                .build();
        couponUsageRepository.save(usage);
    }

    @Override
    @Transactional
    public void revertCouponUsage(String couponId, String userId, String orderId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        if (coupon.getUsedCount() > 0) {
            coupon.setUsedCount(coupon.getUsedCount() - 1);
            couponRepository.save(coupon);
        }

        // Find and delete usage record
        // Note: In real system, we might want to keep it with status 'REVERTED'
        // For now, let's assume we delete it or we need a method in repo to find it
        // couponUsageRepository.deleteByUserIdAndCouponIdAndOrderId(userId, couponId, orderId);
    }
}
