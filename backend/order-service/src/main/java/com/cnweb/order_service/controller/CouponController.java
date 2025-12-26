package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.request.CouponCreationRequest;
import com.cnweb.order_service.dto.response.CouponResponse;
import com.cnweb.order_service.service.CouponService;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Coupon", description = "Coupon management APIs")
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    @Operation(summary = "Create coupon", description = "Create a new coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponCreationRequest request) {
        CouponResponse coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                .code(201)
                .message("Coupon created successfully")
                .result(coupon)
                .build());
    }

    @GetMapping
    @Operation(summary = "Get all coupons", description = "Get all coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.<List<CouponResponse>>builder()
                .code(200)
                .message("Coupons retrieved successfully")
                .result(coupons)
                .build());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get coupon by code", description = "Get coupon details by code")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
        CouponResponse coupon = couponService.getCouponByCode(code);
        return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                .code(200)
                .message("Coupon retrieved successfully")
                .result(coupon)
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    @Operation(summary = "Delete coupon", description = "Delete a coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable String id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Coupon deleted successfully")
                .build());
    }
}