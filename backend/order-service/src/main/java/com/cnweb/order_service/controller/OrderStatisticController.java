package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.response.CustomerStatisticResponse;
import com.cnweb.order_service.dto.response.OrderStatisticResponse;
import com.cnweb.order_service.service.OrderService;
import com.vdt2025.common_dto.dto.response.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderStatisticController {
    OrderService orderService;

    @GetMapping("/revenue/{storeId}")
    public ApiResponse<OrderStatisticResponse> getOrderStatistics(@PathVariable String storeId) {
        log.info("Fetching product statistics overview for seller");

        OrderStatisticResponse response = orderService.getOrderStatistics(storeId);

        return ApiResponse.<OrderStatisticResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/customer/{storeId}")
    public ApiResponse<CustomerStatisticResponse> getCustomerStatistics(@PathVariable String storeId) {
        log.info("Fetching customer statistics overview for seller");

        CustomerStatisticResponse response = orderService.getCustomerStatistics(storeId);

        return ApiResponse.<CustomerStatisticResponse>builder()
                .result(response)
                .build();
    }
}
