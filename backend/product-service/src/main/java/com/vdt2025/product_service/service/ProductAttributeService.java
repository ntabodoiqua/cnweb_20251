package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.attribute.AttributeValueRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeCategoryUpdateRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeSimpleUpdateRequest;
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


    /**
     * Lấy thông tin thuộc tính sản phẩm theo ID
     * @param attributeId ID thuộc tính sản phẩm
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse getAttributeById(String attributeId);


    /**
     * Cập nhật thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @param request ProductAttributeSimpleUpdateRequest yêu cầu cập nhật thuộc tính
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse updateAttribute(String attributeId, ProductAttributeSimpleUpdateRequest request);

    /**
     * Xóa các danh mục mà thuộc tính đang được áp dụng
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Danh sách ID danh mục cần xóa
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse deleteCategoriesOfAttribute(String attributeId, ProductAttributeCategoryUpdateRequest request);

    /**
     * Thêm các danh mục mà thuộc tính sẽ được áp dụng
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Danh sách ID danh mục cần thêm
     */
    ProductAttributeResponse addCategoriesToAttribute(String attributeId, ProductAttributeCategoryUpdateRequest request);

    /**
     * Thêm giá trị cho thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @param value Danh sách giá trị cần thêm
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse addValueToAttribute(String attributeId, AttributeValueRequest value);

    /**
     * Xóa giá trị của thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @param value Giá trị cần xóa
     */
    ProductAttributeResponse deleteValueOfAttribute(String attributeId, AttributeValueRequest value);

    /**
     * Xóa thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse deleteAttribute(String attributeId);

    /**
     * Toggle trạng thái active của thuộc tính
     * Không cascade - chỉ ẩn thuộc tính khỏi form tạo/sửa product
     * @param attributeId ID thuộc tính sản phẩm
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse toggleAttributeStatus(String attributeId);

    /**
     * Toggle trạng thái active của giá trị thuộc tính
     * Không cascade - chỉ ẩn giá trị khỏi dropdown
     * @param attributeId ID thuộc tính sản phẩm
     * @param valueId ID giá trị cần toggle
     * @return ProductAttributeResponse
     */
    ProductAttributeResponse toggleAttributeValueStatus(String attributeId, String valueId);
}