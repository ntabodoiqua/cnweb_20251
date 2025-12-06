package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.statistic.ProductStatisticResponse;
import com.vdt2025.product_service.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/products/statistics")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductStatisticController {

    ProductService productService;

    /**
     * Lấy thống kê tổng quan sản phẩm toàn hệ thống
     * GET /admin/products/statistics/overview
     * Required: ADMIN role
     */
    @GetMapping("/overview")
    public ApiResponse<ProductStatisticResponse> getProductStatisticsOverview() {
        log.info("Fetching product statistics overview for admin");

        ProductStatisticResponse response = productService.getProductStatisticsOverview();

        return ApiResponse.<ProductStatisticResponse>builder()
                .result(response)
                .build();
    }

//    @GetMapping("/by-shop")
//    public ApiResponse<List<ProductStatisticResponse>> getProductStatisticsByShop() {
//        log.info("Fetching product statistics by shop for admin");
//
//        List<ProductStatisticResponse> response = productService.getProductStatisticsByShop();
//
//        return ApiResponse.<List<ProductStatisticResponse>>builder()
//                .result(response)
//                .build();
//    }
//
//    /**
//     * Lấy thống kê sản phẩm chi tiết của 1 cửa hàng
//     * GET /admin/products/statistics/shop/{shopId}
//     * Required: ADMIN role
//     */
//    @GetMapping("/shop/{shopId}")
//    public ApiResponse<ProductStatisticResponse> getProductStatisticsOfShop(@PathVariable String shopId) {
//        log.info("Fetching product statistics for shopId={}", shopId);
//
//        ProductStatisticResponse response = productService.getProductStatisticsOfShop(shopId);
//
//        return ApiResponse.<ProductStatisticResponse>builder()
//                .result(response)
//                .build();
//    }
}
