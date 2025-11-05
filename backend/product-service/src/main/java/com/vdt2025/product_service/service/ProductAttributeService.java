package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.attribute.ProductAttributeRequest;
import com.vdt2025.product_service.dto.response.ProductAttributeResponse;
import com.vdt2025.product_service.dto.response.ProductAttributeSimpleResponse;

import java.util.List;

public interface ProductAttributeService {
    /**
     * Thêm thuộc tính mới
     * @param request ProductAttributeRequest yêu cầu tạo thuộc tính
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse createAttribute(ProductAttributeRequest request);


    /**
     * Lấy thông tin các thuộc tính thuộc 1 danh mục
     * @param categoryId ID danh mục
     * @return List<ProductAttributeResponse>
     */
    List<ProductAttributeSimpleResponse> getAttributesByCategoryId(String categoryId);
}
