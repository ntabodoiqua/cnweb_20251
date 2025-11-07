package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.request.attribute.ProductAttributeRequest;
import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.ProductAttributeResponse;
import com.vdt2025.product_service.dto.response.ProductAttributeSimpleResponse;
import com.vdt2025.product_service.service.ProductAttributeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-attributes")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductAttributeController {
    ProductAttributeService productAttributeService;
    /**
     * Thêm mới thuộc tính sản phẩm
     * Ví dụ: Chất liệu, Xuất xứ, Màu sắc, ...
     */
    @PostMapping
    public ApiResponse<ProductAttributeResponse> createAttribute(@Valid @RequestBody ProductAttributeRequest request){
        log.info("Creating new product attribute: {}", request.getName());
        var result = productAttributeService.createAttribute(request);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Create attribute successfully")
                .result(result)
                .build();
    }

    /**
     * Lấy thông tin các thuộc tính thuộc 1 danh mục
     * @param categoryId ID danh mục
     */
    @GetMapping("/by-category/{categoryId}")
    public ApiResponse<List<ProductAttributeSimpleResponse>> getAttributesByCategoryId(@PathVariable String categoryId){
        log.info("Fetching product attributes for categoryId: {}", categoryId);
        var result = productAttributeService.getAttributesByCategoryId(categoryId);
        return ApiResponse.<List<ProductAttributeSimpleResponse>>builder()
                .message("Fetch attributes successfully")
                .result(result)
                .build();
    }
}