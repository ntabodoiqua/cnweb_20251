package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.brand.BrandCreationRequest;
import com.vdt2025.product_service.dto.request.brand.BrandFilterRequest;
import com.vdt2025.product_service.dto.request.brand.BrandUpdateRequest;
import com.vdt2025.product_service.dto.response.BrandResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface BrandService {

    BrandResponse createBrand(BrandCreationRequest request);

    BrandResponse updateBrand(String id, BrandUpdateRequest request);

    BrandResponse getBrandById(String id);

    void deleteBrand(String id);

    String setBrandThumbnail(String id, MultipartFile file);

    Page<BrandResponse> searchBrands(BrandFilterRequest filter, Pageable pageable);

    /**
     * Toggle trạng thái active của brand
     * Khi disable: cascade disable tất cả products thuộc brand
     * Khi enable: chỉ enable brand, không auto-enable products
     */
    BrandResponse toggleBrandStatus(String id);
}
