package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.StockUpdateRequest;
import com.vdt2025.product_service.dto.request.FindVariantRequest;
import com.vdt2025.product_service.dto.request.product.*;
import com.vdt2025.product_service.dto.response.*;
import com.vdt2025.product_service.dto.response.statistic.ProductStatisticResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface cho Product với best practices cho e-commerce
 */
public interface ProductService {

    // ========== CRUD Operations ==========

    /**
     * Tạo sản phẩm mới
     */
    ProductResponse createProduct(ProductCreationRequest request);

    /**
     * Lấy thông tin chi tiết sản phẩm theo ID
     */
    ProductResponse getProductById(String id);

    /**
     * Thống kê tổng quan sản phẩm toàn hệ thống
     */
    ProductStatisticResponse getProductStatisticsOverview();

    /**
     * Cập nhật thông tin sản phẩm
     */
    ProductResponse updateProduct(String id, ProductUpdateRequest request);

    /**
     * Cập nhật ảnh sản phẩm
     * @return ProductImageResponse sau khi cập nhật
     * Constrains: - Số lượng ảnh tối đa 5
     *              - displayOrder không được trùng nhau
     */
    ProductImageResponse updateProductImage(String id, MultipartFile file, Integer displayOrder);

    /**
     * Xóa ảnh sản phẩm theo ID ảnh
     * @return void
     */
    void deleteProductImage(String productId, String imageId);

    /**
     * Cập nhật thứ tự hiển thị ảnh sản phẩm
     * @return List<ProductImageResponse> sau khi cập nhật
     */
    List<ProductImageResponse> updateProductImageOrder(String productId, List<ImageOrderUpdateRequest> imageOrders);

    /**
     * Xóa sản phẩm (soft delete - chuyển isActive = false)
     */
    void deleteProduct(String id);

    /**
     * Xóa vĩnh viễn sản phẩm (hard delete)
     */
    void permanentDeleteProduct(String id);

    // ========== Search & Filter ==========

    /**
     * Tìm kiếm sản phẩm với filter và pagination
     * Trả về ProductSummaryResponse để tối ưu performance
     */
    PageCacheDTO<ProductSummaryResponse> searchProductsInternal(ProductFilterRequest filter, Pageable pageable);

    // ========== Variant Management ==========

    /**
     * Thêm variant cho sản phẩm
     */
    VariantResponse addVariant(String productId, VariantCreationRequest request);

    /**
     * Cập nhật variant
     */
    VariantResponse updateVariant(String productId, String variantId, VariantUpdateRequest request);

    /**
     * Xóa variant
     */
    void deleteVariant(String productId, String variantId);

    /**
     * Lấy danh sách variants của sản phẩm
     */
    List<VariantResponse> getVariantsByProductId(String productId);


    /**
     * Thêm thuộc tính cho variant
     */
    VariantResponse addVariantAttribute(String productId, String variantId, VariantAttributeRequest request);

    /**
     * Xóa thuộc tính của variant
     */
    VariantResponse removeVariantAttribute(String productId, String variantId, VariantAttributeRequest request);

    /**
     * Cập nhật ảnh cho variant
     * @param productId ID sản phẩm
     * @param variantId ID variant
     * @param file File ảnh
     * @return VariantResponse sau khi cập nhật
     */
    VariantResponse updateVariantImage(String productId, String variantId, MultipartFile file);

    /**
     * Xóa ảnh của variant
     * @param productId ID sản phẩm
     * @param variantId ID variant
     * @return VariantResponse sau khi xóa ảnh
     */
    VariantResponse deleteVariantImage(String productId, String variantId);

    // ========== Status Management ==========

    /**
     * Cập nhật trạng thái sản phẩm (active/inactive)
     */
    ProductResponse updateProductStatus(String id, boolean isActive);

    /**
     * Cập nhật trạng thái nhiều sản phẩm cùng lúc
     */
    void bulkUpdateStatus(BulkStatusUpdateRequest request);

    /**
     * Cập nhật trạng thái variant (active/inactive)
     */
    VariantResponse updateVariantStatus(String productId, String variantId, boolean isActive);

    /**
     * Cập nhật trạng thái nhiều variant cùng lúc
     */
    List<VariantResponse> bulkUpdateVariantStatus(String productId, BulkVariantStatusUpdateRequest request);

    // ========== Statistics & Metrics ==========

    /**
     * Tăng view count cho sản phẩm
     */
    void incrementViewCount(String productId);

    /**
     * Cập nhật sold count khi hoàn thành đơn hàng
     */
    void updateSoldCount(String productId, Integer quantity);

    /**
     * Cập nhật sold count cho nhiều variants cùng lúc (batch operation)
     * Sẽ cập nhật cả soldQuantity của ProductVariant và soldCount của Product tương ứng
     * 
     * @param variantQuantityMap Map chứa variantId -> quantity đã bán
     */
    void updateSoldCountBatch(java.util.Map<String, Integer> variantQuantityMap);

    // ========== Variant Selection (for E-commerce UI) ==========

    /**
     * Lấy danh sách options để chọn variant
     * Dùng để render UI chọn thuộc tính (Màu sắc, Size, ...)
     *
     * @param productId ID sản phẩm
     * @return ProductVariantSelectionResponse chứa:
     *         - Danh sách attribute groups (Màu sắc, Size, ...)
     *         - Các options có thể chọn cho mỗi group
     *         - Variant matrix để quick lookup
     */
    ProductVariantSelectionResponse getProductVariantSelectionOptions(String productId);

    /**
     * Tìm variant dựa trên combination của attribute values
     * Dùng khi user chọn xong tất cả attributes (Đỏ + Size M)
     *
     * @param productId ID sản phẩm
     * @param request Chứa danh sách attribute value IDs đã chọn
     * @return VariantResponse của variant matching
     * @throws com.vdt2025.product_service.exception.AppException nếu không tìm thấy variant
     */
    VariantResponse findVariantByAttributes(String productId, FindVariantRequest request);

    // ========== Internal Service Communication ==========
    /**
     * Get lightweight variant info for internal service calls
     */
    List<VariantInternalDTO> getVariantsForInternal(List<String> variantIds);

    /**
     * Validate multiple variants
     * Used by order-service to check product availability before creating order
     */
    List<VariantValidationDTO> validateVariants(List<String> variantIds);

    // ========== Specs & Metadata Management ==========

    /**
     * Cập nhật thông tin đặc tả kỹ thuật (specs) của Product
     */
    ProductSpecsResponse updateProductSpecs(String productId, ProductSpecsUpdateRequest request);

    /**
     * Lấy thông tin đặc tả kỹ thuật (specs) của Product
     */
    ProductSpecsResponse getProductSpecs(String productId);

    /**
     * Xóa toàn bộ specs của Product
     */
    void deleteProductSpecs(String productId);

    /**
     * Cập nhật metadata của ProductVariant
     */
    VariantMetadataResponse updateVariantMetadata(String productId, String variantId, VariantMetadataUpdateRequest request);

    /**
     * Lấy metadata của ProductVariant
     */
    VariantMetadataResponse getVariantMetadata(String productId, String variantId);

    /**
     * Xóa toàn bộ metadata của ProductVariant
     */
    void deleteVariantMetadata(String productId, String variantId);
}
