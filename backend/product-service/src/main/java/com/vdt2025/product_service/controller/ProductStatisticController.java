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

    // Truy vấn thống kê cửa hàng cho seller
}
