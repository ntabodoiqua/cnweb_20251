package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.response.StoreSimpleResponse;
import com.vdt2025.product_service.service.StoreService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/stores")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicStoreController {
    StoreService storeService;

    // Lấy tất cả cửa hàng công khai
    @GetMapping
    public Page<StoreSimpleResponse> getPublicStores(Pageable pageable) {
        log.info("Fetching public stores with pagination: {}", pageable);
        return storeService.getPublicStores(pageable);
    }

}
