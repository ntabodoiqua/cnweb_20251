package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.brand.BrandCreationRequest;
import com.vdt2025.product_service.dto.request.brand.BrandFilterRequest;
import com.vdt2025.product_service.dto.request.brand.BrandUpdateRequest;
import com.vdt2025.product_service.dto.response.BrandResponse;
import com.vdt2025.product_service.service.BrandServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrandController {
    BrandServiceImp brandService;

    // Controller để lấy danh sách các brand
    @GetMapping
    public ApiResponse<Page<BrandResponse>> getBrands(
            @ModelAttribute BrandFilterRequest filter,
            Pageable pageable
    ) {
        Page<BrandResponse> brands = brandService.searchBrands(filter, pageable);
        return ApiResponse.<Page<BrandResponse>>builder()
                .result(brands)
                .build();
    }

    // Lấy brand theo id
    @GetMapping("/{id}")
    public ApiResponse<BrandResponse> getBrandById(@PathVariable String id) {
        BrandResponse brand = brandService.getBrandById(id);
        return ApiResponse.<BrandResponse>builder()
                .result(brand)
                .build();
    }

    // Tạo brand mới
    @PostMapping
    public ApiResponse<BrandResponse> createBrand(@RequestBody BrandCreationRequest request) {
        BrandResponse brand = brandService.createBrand(request);
        return ApiResponse.<BrandResponse>builder()
                .result(brand)
                .build();
    }

    // Cập nhật ảnh đại diện cho brand
//    @PostMapping("/{id}/thumbnail")
//    public ApiResponse<String> setBrandThumbnail(
//            @PathVariable String id,
//            @RequestParam("file") MultipartFile file) {
//        String thumbnailUrl = brandService.setBrandThumbnail(id, file);
//        return ApiResponse.<String>builder()
//                .result(thumbnailUrl)
//                .build();
//    }

    // Cập nhật brand
    @PutMapping("/{id}")
    public ApiResponse<BrandResponse> updateBrand(
            @PathVariable String id,
            @RequestBody BrandUpdateRequest request) {
        BrandResponse updatedBrand = brandService.updateBrand(id, request);
        return ApiResponse.<BrandResponse>builder()
                .result(updatedBrand)
                .build();
    }

    // Xóa brand
//    @DeleteMapping("/{id}")
//    public ApiResponse<String> deleteBrand(@PathVariable String id) {
//        brandService.deleteBrand(id);
//        return ApiResponse.<String>builder()
//                .result("Brand has been deleted")
//                .build();
//    }
}
