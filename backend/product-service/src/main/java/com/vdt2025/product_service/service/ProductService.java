package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.product.*;
import com.vdt2025.product_service.dto.response.ProductImageResponse;
import com.vdt2025.product_service.dto.response.ProductResponse;
import com.vdt2025.product_service.dto.response.ProductSummaryResponse;
import com.vdt2025.product_service.dto.response.VariantResponse;
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
    void deleteProductImage(String imageId);

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
    Page<ProductSummaryResponse> searchProducts(ProductFilterRequest filter, Pageable pageable);
    
    /**
     * Tìm kiếm sản phẩm theo store
     */
    Page<ProductSummaryResponse> getProductsByStoreId(String storeId, Pageable pageable);
    
    /**
     * Tìm kiếm sản phẩm theo category
     */
    Page<ProductSummaryResponse> getProductsByCategoryId(String categoryId, Pageable pageable);

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

    // ========== Status Management ==========
    
    /**
     * Cập nhật trạng thái sản phẩm (active/inactive)
     */
    ProductResponse updateProductStatus(String id, boolean isActive);
    
    /**
     * Cập nhật trạng thái nhiều sản phẩm cùng lúc
     */
    List<ProductResponse> bulkUpdateStatus(BulkStatusUpdateRequest request);

    // ========== Inventory Management ==========
    
    /**
     * Cập nhật số lượng tồn kho cho variant
     */
    VariantResponse updateVariantStock(String productId, String variantId, Integer quantity);
    
    /**
     * Giảm số lượng tồn kho khi có đơn hàng (reserved stock)
     */
    void decreaseStock(String variantId, Integer quantity);
    
    /**
     * Tăng số lượng tồn kho khi hủy đơn hàng
     */
    void increaseStock(String variantId, Integer quantity);

    // ========== Statistics & Metrics ==========
    
    /**
     * Tăng view count cho sản phẩm
     */
    void incrementViewCount(String productId);
    
    /**
     * Cập nhật sold count khi hoàn thành đơn hàng
     */
    void updateSoldCount(String productId, Integer quantity);
}

