package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.response.ProvinceResponse;
import com.cnweb2025.user_service.service.ProvinceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/provinces")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProvinceController {
    ProvinceService provinceService;

    /**
     * Lấy tất cả provinces (34 tỉnh thành)
     * GET /provinces
     */
    @GetMapping
    public ApiResponse<List<ProvinceResponse>> getAllProvinces() {
        log.info("REST request to get all provinces");
        return ApiResponse.<List<ProvinceResponse>>builder()
                .message("Fetched all provinces successfully")
                .result(provinceService.getAllProvinces())
                .build();
    }

    /**
     * Lấy province theo ID
     * GET /provinces/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<ProvinceResponse> getProvinceById(@PathVariable Integer id) {
        log.info("REST request to get province by ID: {}", id);
        return ApiResponse.<ProvinceResponse>builder()
                .message("Fetched province successfully")
                .result(provinceService.getProvinceById(id))
                .build();
    }

    /**
     * Lấy province theo slug
     * GET /provinces/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ApiResponse<ProvinceResponse> getProvinceBySlug(@PathVariable String slug) {
        log.info("REST request to get province by slug: {}", slug);
        return ApiResponse.<ProvinceResponse>builder()
                .message("Fetched province successfully")
                .result(provinceService.getProvinceBySlug(slug))
                .build();
    }

    /**
     * Tìm kiếm provinces theo từ khóa
     * GET /provinces/search?keyword=hanoi
     */
    @GetMapping("/search")
    public ApiResponse<List<ProvinceResponse>> searchProvinces(
            @RequestParam(required = false) String keyword) {
        log.info("REST request to search provinces with keyword: {}", keyword);
        return ApiResponse.<List<ProvinceResponse>>builder()
                .message("Search provinces completed")
                .result(provinceService.searchProvinces(keyword))
                .build();
    }
}
