package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.response.WardResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WardService {
    /**
     * Lấy tất cả wards theo provinceId
     * @param provinceId ID của province
     * @return danh sách wards của province
     */
    List<WardResponse> getWardsByProvinceId(Integer provinceId);
    
    /**
     * Lấy wards theo provinceId với phân trang (cho ~3300 phần tử)
     * @param provinceId ID của province
     * @param pageable thông tin phân trang
     * @return Page của WardResponse
     */
    Page<WardResponse> getWardsByProvinceIdWithPagination(Integer provinceId, Pageable pageable);
    
    /**
     * Lấy ward theo ID
     * @param id ID của ward
     * @return WardResponse
     */
    WardResponse getWardById(Integer id);
    
    /**
     * Lấy ward theo slug
     * @param slug slug của ward
     * @return WardResponse
     */
    WardResponse getWardBySlug(String slug);
    
    /**
     * Tìm kiếm wards theo từ khóa
     * @param keyword từ khóa tìm kiếm
     * @return danh sách wards phù hợp
     */
    List<WardResponse> searchWards(String keyword);
    
    /**
     * Tìm kiếm wards theo từ khóa và provinceId
     * @param keyword từ khóa tìm kiếm
     * @param provinceId ID của province
     * @return danh sách wards phù hợp
     */
    List<WardResponse> searchWardsByProvinceId(String keyword, Integer provinceId);
    
    /**
     * Đếm số lượng wards theo provinceId
     * @param provinceId ID của province
     * @return số lượng wards
     */
    long countWardsByProvinceId(Integer provinceId);
}
