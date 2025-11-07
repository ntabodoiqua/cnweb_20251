package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.request.attribute.AttributeValueRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeCategoryUpdateRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeRequest;
import com.vdt2025.product_service.dto.request.attribute.ProductAttributeSimpleUpdateRequest;
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

    /**
     * Lấy thông tin thuộc tính sản phẩm theo ID
     * @param attributeId ID thuộc tính sản phẩm
     */
    @GetMapping("/{attributeId}")
    public ApiResponse<ProductAttributeResponse> getAttributeById(@PathVariable String attributeId){
        log.info("Fetching product attribute for attributeId: {}", attributeId);
        var result = productAttributeService.getAttributeById(attributeId);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Fetch attribute successfully")
                .result(result)
                .build();
    }

    /**
     * Cập nhật thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Yêu cầu cập nhật thuộc tính sản phẩm
     */
    @PutMapping("/{attributeId}")
    public ApiResponse<ProductAttributeResponse> updateAttribute(@PathVariable String attributeId,
                                                                 @Valid @RequestBody ProductAttributeSimpleUpdateRequest request){
        log.info("Updating product attribute for attributeId: {}", attributeId);
        var result = productAttributeService.updateAttribute(attributeId, request);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Update attribute successfully")
                .result(result)
                .build();
    }

    /**
     * Xóa các danh mục mà thuộc tính đang được áp dụng
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Danh sách ID danh mục cần xóa
     */
    @DeleteMapping("/{attributeId}/categories")
    public ApiResponse<ProductAttributeResponse> deleteCategoriesOfAttribute(@PathVariable String attributeId,
                                                                             @Valid @RequestBody ProductAttributeCategoryUpdateRequest request) {
        log.info("Deleting categories from product attribute for attributeId: {}", attributeId);
        var result = productAttributeService.deleteCategoriesOfAttribute(attributeId, request);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Delete categories from attribute successfully")
                .result(result)
                .build();
    }

    /**
     * Thêm các danh mục mà thuộc tính sẽ được áp dụng
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Danh sách ID danh mục cần thêm
     */
    @PostMapping("/{attributeId}/categories")
    public ApiResponse<ProductAttributeResponse> addCategoriesToAttribute(@PathVariable String attributeId,
                                                                          @Valid @RequestBody ProductAttributeCategoryUpdateRequest request) {
        log.info("Adding categories to product attribute for attributeId: {}", attributeId);
        var result = productAttributeService.addCategoriesToAttribute(attributeId, request);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Add categories to attribute successfully")
                .result(result)
                .build();
    }

    /**
     * Thêm giá trị cho thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Giá trị cần thêm
     */
    @PostMapping("/{attributeId}/values")
    public ApiResponse<ProductAttributeResponse> addValueToAttribute(@PathVariable String attributeId,
                                                                    @Valid @RequestBody AttributeValueRequest request) {
        log.info("Adding value to product attribute for attributeId: {}", attributeId);
        var result = productAttributeService.addValueToAttribute(attributeId, request);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Add value to attribute successfully")
                .result(result)
                .build();
    }

    /**
     * Xóa giá trị của thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     * @param request Giá trị cần xóa
     */
    @DeleteMapping("/{attributeId}/values")
    public ApiResponse<ProductAttributeResponse> deleteValueOfAttribute(@PathVariable String attributeId,
                                                                          @Valid @RequestBody AttributeValueRequest request) {
          log.info("Deleting value from product attribute for attributeId: {}", attributeId);
          var result = productAttributeService.deleteValueOfAttribute(attributeId, request);
          return ApiResponse.<ProductAttributeResponse>builder()
                 .message("Delete value from attribute successfully")
                 .result(result)
                 .build();
    }

    /**
     * Xóa thuộc tính sản phẩm
     * @param attributeId ID thuộc tính sản phẩm
     */
    @DeleteMapping("/{attributeId}")
    public ApiResponse<ProductAttributeResponse> deleteAttribute(@PathVariable String attributeId){
        log.info("Deleting product attribute for attributeId: {}", attributeId);
        var result = productAttributeService.deleteAttribute(attributeId);
        return ApiResponse.<ProductAttributeResponse>builder()
                .message("Delete attribute successfully")
                .result(result)
                .build();
    }
}
