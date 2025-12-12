package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.statistic.ProductStatisticResponse;
import com.vdt2025.product_service.dto.response.statistic.ProductStatisticResponseForSeller;
import com.vdt2025.product_service.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/statistics")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductStatisticController {

    ProductService productService;

    /**
     * Lấy thống kê tổng quan sản phẩm toàn hệ thống
     * GET /products/statistics/overview
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

    /**
     * Lấy thống kê tổng quan sản phẩm cho
     * GET /products/statistics/overview
     * Required: SELLER role
     */
    @GetMapping("/seller-overview/{storeId}")
    public ApiResponse<ProductStatisticResponseForSeller> getProductStatisticsForSeller(@PathVariable String storeId) {
        log.info("Fetching product statistics overview for seller with storeId: {}", storeId);

        ProductStatisticResponseForSeller response = productService.getProductStatisticsForSeller(storeId);

        return ApiResponse.<ProductStatisticResponseForSeller>builder()
                .result(response)
                .build();
    }
}
