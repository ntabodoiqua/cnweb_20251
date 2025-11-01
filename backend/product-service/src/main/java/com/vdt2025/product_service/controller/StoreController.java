package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.service.StoreService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoreController {
    StoreService storeService;
    MessageSource messageSource;

//    Lấy tất cả cửa hàng với phân trang
    @GetMapping
    public ApiResponse<Page<StoreResponse>> getAllStores(Pageable pageable, Locale locale) {
        var result = storeService.getAllStores(pageable);
        return ApiResponse.<Page<StoreResponse>>builder()
                .result(result)
                .message(messageSource.getMessage("success.stores.retrieved", null, locale))
                .build();
    }

    // Vô hiệu hóa cửa hàng theo sellerProfileId
    @PutMapping("/{sellerProfileId}/deactivate")
    public ApiResponse<Void> deactivateStore(@PathVariable String sellerProfileId, Locale locale) {
        log.info("Request to deactivate store for seller profile ID: {}", sellerProfileId);
        storeService.deactivateStoreBySellerProfileId(sellerProfileId);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("success.store.deactivated", null, locale))
                .build();
    }
}
