package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.product_service.dto.request.store.StoreSimpleRequest;
import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.service.StoreService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoreController {
    StoreService storeService;
    MessageSource messageSource;
    UserServiceClient userServiceClient;

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

    // Lấy tất cả cửa hàng của người bán hiện tại với phân trang
    @GetMapping("/myStores")
    public ApiResponse<Page<StoreResponse>> getMyStores(Pageable pageable, Locale locale) {
        var username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Request to get stores for current seller: {}", username);
        try {
            var cached = storeService.getStoresOfCurrentSeller(pageable);
            var result = new PageImpl<>(
                    cached.content(),
                    PageRequest.of(cached.pageNumber(), cached.pageSize()),
                    cached.totalElements()
            );
            return ApiResponse.<Page<StoreResponse>>builder()
                    .result(result)
                    .message(messageSource.getMessage("success.stores.retrieved", null, locale))
                    .build();
        } catch (Exception e) {
            log.error("Error retrieving stores for seller {}: {}", username, e.getMessage());
            throw e;
        }
    }

    // Chỉnh sửa thông tin cửa hàng cơ bản
    @PutMapping("/{storeId}")
    public ApiResponse<StoreResponse> updateStoreBasicInfo(
            @PathVariable String storeId,
            @RequestBody StoreSimpleRequest request) {
        var result = storeService.updateStoreBasicInfo(storeId, request);
        return ApiResponse.<StoreResponse>builder()
                .result(result)
                .message("success.store.updated")
                .build();
    }

    // Cập nhật logo/banner cửa hàng
    @PutMapping("/{storeId}/media")
    public ApiResponse<StoreResponse> updateStoreMedia(
            @PathVariable String storeId,
            @RequestParam("type") Integer mediaType,
            @RequestParam("file") MultipartFile file) {
        var result = storeService.updateStoreMedia(storeId, mediaType, file);
        return ApiResponse.<StoreResponse>builder()
                .result(result)
                .message("success.store.media.updated")
                .build();
    }
}
