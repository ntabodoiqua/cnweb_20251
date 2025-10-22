package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.response.ProvinceResponse;

import java.util.List;

public interface ProvinceService {
    /**
     * Lấy tất cả provinces (34 tỉnh thành)
     * @return danh sách tất cả provinces
     */
    List<ProvinceResponse> getAllProvinces();
    
    /**
     * Lấy province theo ID
     * @param id ID của province
     * @return ProvinceResponse
     */
    ProvinceResponse getProvinceById(Integer id);
    
    /**
     * Lấy province theo slug
     * @param slug slug của province
     * @return ProvinceResponse
     */
    ProvinceResponse getProvinceBySlug(String slug);
    
    /**
     * Tìm kiếm provinces theo từ khóa
     * @param keyword từ khóa tìm kiếm
     * @return danh sách provinces phù hợp
     */
    List<ProvinceResponse> searchProvinces(String keyword);
}
