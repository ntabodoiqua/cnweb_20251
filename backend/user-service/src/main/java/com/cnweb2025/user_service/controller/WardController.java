package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.response.WardResponse;
import com.cnweb2025.user_service.service.WardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wards")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WardController {
    WardService wardService;

    /**
     * Lấy tất cả wards theo provinceId
     * GET /wards/province/{provinceId}
     */
    @GetMapping("/province/{provinceId}")
    public ApiResponse<List<WardResponse>> getWardsByProvinceId(@PathVariable Integer provinceId) {
        log.info("REST request to get all wards for province ID: {}", provinceId);
        return ApiResponse.<List<WardResponse>>builder()
                .message("Fetched wards successfully")
                .result(wardService.getWardsByProvinceId(provinceId))
                .build();
    }

    /**
     * Lấy wards theo provinceId với phân trang (cho ~3300 phần tử)
     * GET /wards/province/{provinceId}/paged?page=0&size=20&sort=name,asc
     */
    @GetMapping("/province/{provinceId}/paged")
    public ApiResponse<Page<WardResponse>> getWardsByProvinceIdWithPagination(
            @PathVariable Integer provinceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        log.info("REST request to get wards for province ID: {} with pagination - Page: {}, Size: {}", 
                provinceId, page, size);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        return ApiResponse.<Page<WardResponse>>builder()
                .message("Fetched wards with pagination successfully")
                .result(wardService.getWardsByProvinceIdWithPagination(provinceId, pageable))
                .build();
    }

    /**
     * Lấy ward theo ID
     * GET /wards/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<WardResponse> getWardById(@PathVariable Integer id) {
        log.info("REST request to get ward by ID: {}", id);
        return ApiResponse.<WardResponse>builder()
                .message("Fetched ward successfully")
                .result(wardService.getWardById(id))
                .build();
    }

    /**
     * Lấy ward theo slug
     * GET /wards/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ApiResponse<WardResponse> getWardBySlug(@PathVariable String slug) {
        log.info("REST request to get ward by slug: {}", slug);
        return ApiResponse.<WardResponse>builder()
                .message("Fetched ward successfully")
                .result(wardService.getWardBySlug(slug))
                .build();
    }

    /**
     * Tìm kiếm tất cả wards theo từ khóa
     * GET /wards/search?keyword=hanoi
     */
    @GetMapping("/search")
    public ApiResponse<List<WardResponse>> searchWards(
            @RequestParam(required = false) String keyword) {
        log.info("REST request to search wards with keyword: {}", keyword);
        return ApiResponse.<List<WardResponse>>builder()
                .message("Search wards completed")
                .result(wardService.searchWards(keyword))
                .build();
    }

    /**
     * Tìm kiếm wards theo từ khóa và provinceId
     * GET /wards/search/province/{provinceId}?keyword=hanoi
     */
    @GetMapping("/search/province/{provinceId}")
    public ApiResponse<List<WardResponse>> searchWardsByProvinceId(
            @PathVariable Integer provinceId,
            @RequestParam(required = false) String keyword) {
        log.info("REST request to search wards with keyword: {} in province ID: {}", keyword, provinceId);
        return ApiResponse.<List<WardResponse>>builder()
                .message("Search wards by province completed")
                .result(wardService.searchWardsByProvinceId(keyword, provinceId))
                .build();
    }

    /**
     * Đếm số lượng wards theo provinceId
     * GET /wards/count/province/{provinceId}
     */
    @GetMapping("/count/province/{provinceId}")
    public ApiResponse<Long> countWardsByProvinceId(@PathVariable Integer provinceId) {
        log.info("REST request to count wards for province ID: {}", provinceId);
        return ApiResponse.<Long>builder()
                .message("Count wards completed")
                .result(wardService.countWardsByProvinceId(provinceId))
                .build();
    }
}
