package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.request.banner.BannerOrderUpdateRequest;
import com.vdt2025.product_service.dto.request.banner.BannerUpdateRequest;
import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.BannerResponse;
import com.vdt2025.product_service.service.BannerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;

/**
 * Controller quản lý Banner Slides
 * - Admin: Quản lý banner platform (storeId = null)
 * - Seller: Quản lý banner của store cụ thể
 */
@RestController
@RequestMapping("/banner-slides")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BannerSlideController {
    BannerService bannerService;
    MessageSource messageSource;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Lấy tất cả banner (public)
     * GET /banner-slides
     */
    @GetMapping
    public ApiResponse<List<BannerResponse>> getAllBanners(Locale locale) {
        log.info("Getting all banners");
        List<BannerResponse> banners = bannerService.getAllBanners();
        return ApiResponse.<List<BannerResponse>>builder()
                .result(banners)
                .message(messageSource.getMessage("success.banners.retrieved", null, "Banners retrieved successfully", locale))
                .build();
    }

    /**
     * Lấy banner của platform (public)
     * GET /banner-slides/platform
     */
    @GetMapping("/platform")
    public ApiResponse<List<BannerResponse>> getPlatformBanners(Locale locale) {
        log.info("Getting platform banners");
        List<BannerResponse> banners = bannerService.getPlatformBanners();
        return ApiResponse.<List<BannerResponse>>builder()
                .result(banners)
                .message(messageSource.getMessage("success.banners.retrieved", null, "Banners retrieved successfully", locale))
                .build();
    }

    /**
     * Lấy banner của store cụ thể (public)
     * GET /banner-slides/store/{storeId}
     */
    @GetMapping("/store/{storeId}")
    public ApiResponse<List<BannerResponse>> getStoreBanners(
            @PathVariable String storeId,
            Locale locale) {
        log.info("Getting banners for store: {}", storeId);
        List<BannerResponse> banners = bannerService.getStoreBanners(storeId);
        return ApiResponse.<List<BannerResponse>>builder()
                .result(banners)
                .message(messageSource.getMessage("success.banners.retrieved", null, "Banners retrieved successfully", locale))
                .build();
    }

    /**
     * Lấy thông tin banner theo ID (public)
     * GET /banner-slides/{bannerId}
     */
    @GetMapping("/{bannerId}")
    public ApiResponse<BannerResponse> getBannerById(
            @PathVariable String bannerId,
            Locale locale) {
        log.info("Getting banner by ID: {}", bannerId);
        BannerResponse banner = bannerService.getBannerById(bannerId);
        return ApiResponse.<BannerResponse>builder()
                .result(banner)
                .message(messageSource.getMessage("success.banner.retrieved", null, "Banner retrieved successfully", locale))
                .build();
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Admin tạo banner cho platform
     * POST /banner-slides/admin
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BannerResponse> createPlatformBanner(
            @RequestParam("file") MultipartFile file,
            @RequestParam("displayOrder") Integer displayOrder,
            Locale locale) {
        log.info("Admin creating platform banner with displayOrder: {}", displayOrder);
        BannerResponse banner = bannerService.createBanner(file, displayOrder, null);
        return ApiResponse.<BannerResponse>builder()
                .result(banner)
                .message(messageSource.getMessage("success.banner.created", null, "Banner created successfully", locale))
                .build();
    }

    /**
     * Admin cập nhật banner platform
     * PUT /banner-slides/admin/{bannerId}
     */
    @PutMapping("/admin/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BannerResponse> updatePlatformBanner(
            @PathVariable String bannerId,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Locale locale) {
        log.info("Admin updating platform banner: {}", bannerId);
        BannerUpdateRequest request = BannerUpdateRequest.builder()
                .displayOrder(displayOrder)
                .build();
        BannerResponse banner = bannerService.updateBanner(bannerId, request, file);
        return ApiResponse.<BannerResponse>builder()
                .result(banner)
                .message(messageSource.getMessage("success.banner.updated", null, "Banner updated successfully", locale))
                .build();
    }

    /**
     * Admin xóa banner platform
     * DELETE /banner-slides/admin/{bannerId}
     */
    @DeleteMapping("/admin/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deletePlatformBanner(
            @PathVariable String bannerId,
            Locale locale) {
        log.info("Admin deleting platform banner: {}", bannerId);
        bannerService.deleteBanner(bannerId, null);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("success.banner.deleted", null, "Banner deleted successfully", locale))
                .build();
    }

    /**
     * Admin cập nhật thứ tự hiển thị các banner platform
     * PUT /banner-slides/admin/display-order
     */
    @PutMapping("/admin/display-order")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> updatePlatformBannerDisplayOrder(
            @Valid @RequestBody List<BannerOrderUpdateRequest> bannerOrders,
            Locale locale) {
        log.info("Admin updating display order for {} banners", bannerOrders.size());
        bannerService.updateBannerDisplayOrder(bannerOrders);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("success.banner.order.updated", null, "Banner display order updated successfully", locale))
                .build();
    }

    // ==================== SELLER ENDPOINTS ====================

    /**
     * Seller lấy banner của store mình
     * GET /banner-slides/seller/my-store/{storeId}
     */
    @GetMapping("/seller/my-store/{storeId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<List<BannerResponse>> getMyStoreBanners(
            @PathVariable String storeId,
            Locale locale) {
        log.info("Seller getting banners for store: {}", storeId);
        List<BannerResponse> banners = bannerService.getMyStoreBanners(storeId);
        return ApiResponse.<List<BannerResponse>>builder()
                .result(banners)
                .message(messageSource.getMessage("success.banners.retrieved", null, "Banners retrieved successfully", locale))
                .build();
    }

    /**
     * Seller tạo banner cho store của mình
     * POST /banner-slides/seller/{storeId}
     */
    @PostMapping("/seller/{storeId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<BannerResponse> createStoreBanner(
            @PathVariable String storeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("displayOrder") Integer displayOrder,
            Locale locale) {
        log.info("Seller creating banner for store: {} with displayOrder: {}", storeId, displayOrder);
        BannerResponse banner = bannerService.createBanner(file, displayOrder, storeId);
        return ApiResponse.<BannerResponse>builder()
                .result(banner)
                .message(messageSource.getMessage("success.banner.created", null, "Banner created successfully", locale))
                .build();
    }

    /**
     * Seller cập nhật banner của store mình
     * PUT /banner-slides/seller/{storeId}/{bannerId}
     */
    @PutMapping("/seller/{storeId}/{bannerId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<BannerResponse> updateStoreBanner(
            @PathVariable String storeId,
            @PathVariable String bannerId,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Locale locale) {
        log.info("Seller updating banner: {} for store: {}", bannerId, storeId);
        BannerUpdateRequest request = BannerUpdateRequest.builder()
                .displayOrder(displayOrder)
                .storeId(storeId)
                .build();
        BannerResponse banner = bannerService.updateBanner(bannerId, request, file);
        return ApiResponse.<BannerResponse>builder()
                .result(banner)
                .message(messageSource.getMessage("success.banner.updated", null, "Banner updated successfully", locale))
                .build();
    }

    /**
     * Seller xóa banner của store mình
     * DELETE /banner-slides/seller/{storeId}/{bannerId}
     */
    @DeleteMapping("/seller/{storeId}/{bannerId}")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<Void> deleteStoreBanner(
            @PathVariable String storeId,
            @PathVariable String bannerId,
            Locale locale) {
        log.info("Seller deleting banner: {} for store: {}", bannerId, storeId);
        bannerService.deleteBanner(bannerId, storeId);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("success.banner.deleted", null, "Banner deleted successfully", locale))
                .build();
    }

    /**
     * Seller cập nhật thứ tự hiển thị các banner của store mình
     * PUT /banner-slides/seller/{storeId}/display-order
     */
    @PutMapping("/seller/{storeId}/display-order")
    @PreAuthorize("hasRole('SELLER')")
    public ApiResponse<Void> updateStoreBannerDisplayOrder(
            @PathVariable String storeId,
            @Valid @RequestBody List<BannerOrderUpdateRequest> bannerOrders,
            Locale locale) {
        log.info("Seller updating display order for {} banners in store: {}", bannerOrders.size(), storeId);
        bannerService.updateBannerDisplayOrder(bannerOrders);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("success.banner.order.updated", null, "Banner display order updated successfully", locale))
                .build();
    }
}
