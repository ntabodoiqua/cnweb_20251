package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.banner.BannerOrderUpdateRequest;
import com.vdt2025.product_service.dto.request.banner.BannerUpdateRequest;
import com.vdt2025.product_service.dto.response.BannerResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BannerService {
    /**
     * Tạo banner mới
     * @return BannerResponse sau khi tạo
     * Constrains: - Số lượng ảnh tối đa 5
     *              - displayOrder không được trùng nhau
     */
    BannerResponse createBanner(MultipartFile file, Integer displayOrder, String storeId);

    /**
     * Cập nhật thông tin banner
     * @return BannerResponse sau khi cập nhật
     */
    BannerResponse updateBanner(String bannerId, BannerUpdateRequest request, MultipartFile file);

    /**
     * Lấy banner theo ID
     */
    BannerResponse getBannerById(String bannerId);

    /**
     * Xóa banner
     * @return void
     */
    void deleteBanner(String bannerId, String storeId);

    /**
     * Cập nhật thứ tự hiển thị banner
     * @return void
     */
    void updateBannerDisplayOrder(List<BannerOrderUpdateRequest> bannerOrders);

    /**
     * Lấy danh sách banner theo thứ tự hiển thị (tất cả)
     */
    List<BannerResponse> getAllBanners();

    /**
     * Lấy danh sách banner của platform (storeId = null)
     */
    List<BannerResponse> getPlatformBanners();

    /**
     * Lấy danh sách banner của store cụ thể
     */
    List<BannerResponse> getStoreBanners(String storeId);

    /**
     * Lấy danh sách banner của store hiện tại (dựa trên user đang đăng nhập)
     */
    List<BannerResponse> getMyStoreBanners(String storeId);
}
