package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.product.*;
import com.vdt2025.product_service.dto.response.ProductImageResponse;
import com.vdt2025.product_service.dto.response.ProductResponse;
import com.vdt2025.product_service.dto.response.ProductSummaryResponse;
import com.vdt2025.product_service.dto.response.VariantResponse;
import com.vdt2025.product_service.dto.response.*;
import com.vdt2025.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller cho Product Management (Seller & Admin)
 * Best practices:
 * - RESTful API design
 * - Validation với @Valid
 * - Consistent response format
 * - Proper HTTP status codes
 * - Pagination support
 * - Comprehensive CRUD operations
 */
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductManagementController {

    ProductService productService;

    // ========== CRUD Operations ==========

    /**
     * Tạo sản phẩm mới
     * POST /products
     * Required: SELLER hoặc ADMIN role
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreationRequest request) {
        log.info("Creating new product: {}", request.getName());

        ProductResponse response = productService.createProduct(request);

        return ApiResponse.<ProductResponse>builder()
                .message("Product created successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy thông tin chi tiết sản phẩm
     * GET /products/{productId}
     */
    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String productId) {
        log.info("Fetching product with ID: {}", productId);

        // Increment view count
        productService.incrementViewCount(productId);

        ProductResponse response = productService.getProductById(productId);

        return ApiResponse.<ProductResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Cập nhật thông tin sản phẩm
     * PUT /products/{productId}
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PutMapping("/{productId}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable String productId,
            @Valid @RequestBody ProductUpdateRequest request) {
        log.info("Updating product with ID: {}", productId);

        ProductResponse response = productService.updateProduct(productId, request);

        return ApiResponse.<ProductResponse>builder()
                .message("Product updated successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật ảnh sản phầm
     * POST /products/{productId}/images
     * Required: SELLER (owner) hoặc ADMIN role
     * Constrain: Số lượng ảnh tối đa 5, displayOrder không được trùng nhau
     */
    @PostMapping("/{productId}/images")
    public ApiResponse<ProductImageResponse> updateProductImage(
            @PathVariable String productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("displayOrder") Integer displayOrder) {
        log.info("Updating image for product ID: {}", productId);
        ProductImageResponse response = productService.updateProductImage(productId, file, displayOrder);
        return ApiResponse.<ProductImageResponse>builder()
                .message("Product image updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa ảnh sản phẩm
     * DELETE /products/{productId}/images/{imageId}
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @DeleteMapping("/{productId}/images/{imageId}")
    public ApiResponse<String> deleteProductImage(@PathVariable String productId, @PathVariable String imageId) {
        log.info("Deleting product image with ID: {}", imageId);
        productService.deleteProductImage(productId, imageId);
        return ApiResponse.<String>builder()
                .message("Product image deleted successfully")
                .result("Image with ID " + imageId + " has been removed")
                .build();
    }

    /**
     * Cập nhật thứ tự hiển thị ảnh sản phẩm
     * PUT /products/{productId}/images/order
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PutMapping("/{productId}/images/order")
    public ApiResponse<List<ProductImageResponse>> updateProductImageOrder(
            @PathVariable String productId,
            @Valid @RequestBody List<ImageOrderUpdateRequest> imageOrders) {
        log.info("Updating image order for product ID: {}", productId);
        List<ProductImageResponse> response = productService.updateProductImageOrder(productId, imageOrders);
        return ApiResponse.<List<ProductImageResponse>>builder()
                .message("Product image order updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa sản phẩm (soft delete)
     * DELETE /products/{productId}
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @DeleteMapping("/{productId}")
    public ApiResponse<String> deleteProduct(@PathVariable String productId) {
        log.info("Deleting product with ID: {}", productId);

        productService.deleteProduct(productId);

        return ApiResponse.<String>builder()
                .message("Product deleted successfully")
                .result("Product with ID " + productId + " has been deactivated")
                .build();
    }

    /**
     * Xóa vĩnh viễn sản phẩm (hard delete)
     * DELETE /products/{productId}/permanent
     * Required: ADMIN role only
     */
    @DeleteMapping("/{productId}/permanent")
    public ApiResponse<String> permanentDeleteProduct(@PathVariable String productId) {
        log.info("Permanently deleting product with ID: {}", productId);

        productService.permanentDeleteProduct(productId);

        return ApiResponse.<String>builder()
                .message("Product permanently deleted")
                .result("Product with ID " + productId + " has been permanently removed")
                .build();
    }

    // ========== Search & Filter ==========

    /**
     * Tìm kiếm sản phẩm với filter và pagination
     * GET /products
     * Query params: keyword, categoryId, storeId, brandId, priceFrom, priceTo, etc.
     * Pagination: page, size, sort
     */
    @GetMapping
    public ApiResponse<Page<ProductSummaryResponse>> searchProducts(
            @ModelAttribute ProductFilterRequest filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("Searching products with filter: {}", filter);

        PageCacheDTO<ProductSummaryResponse> dto = productService.searchProductsCacheable(filter, pageable);

        return ApiResponse.<Page<ProductSummaryResponse>>builder()
                .result(new PageImpl<>(
                        dto.content(),
                        PageRequest.of(dto.pageNumber(), dto.pageSize()),
                        dto.totalElements()
                ))
                .build();
    }

    /**
     * Lấy sản phẩm theo store
     * GET /products/by-store/{storeId}
     */
    @GetMapping("/by-store/{storeId}")
    public ApiResponse<Page<ProductSummaryResponse>> getProductsByStore(
            @PathVariable String storeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("Fetching products for store: {}", storeId);

        Page<ProductSummaryResponse> response = productService.getProductsByStoreId(storeId, pageable);

        return ApiResponse.<Page<ProductSummaryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Lấy sản phẩm theo category
     * GET /products/by-category/{categoryId}
     */
    @GetMapping("/by-category/{categoryId}")
    public ApiResponse<Page<ProductSummaryResponse>> getProductsByCategory(
            @PathVariable String categoryId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        log.info("Fetching products for category: {}", categoryId);

        Page<ProductSummaryResponse> response = productService.getProductsByCategoryId(categoryId, pageable);

        return ApiResponse.<Page<ProductSummaryResponse>>builder()
                .result(response)
                .build();
    }

    // ========== Variant Management ==========

    /**
     * Thêm variant cho sản phẩm
     * POST /products/{productId}/variants
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PostMapping("/{productId}/variants")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VariantResponse> addVariant(
            @PathVariable String productId,
            @Valid @RequestBody VariantCreationRequest request) {
        log.info("Adding variant to product: {}", productId);

        VariantResponse response = productService.addVariant(productId, request);

        return ApiResponse.<VariantResponse>builder()
                .message("Variant added successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật variant
     * PUT /products/{productId}/variants/{variantId}
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PutMapping("/{productId}/variants/{variantId}")
    public ApiResponse<VariantResponse> updateVariant(
            @PathVariable String productId,
            @PathVariable String variantId,
            @Valid @RequestBody VariantUpdateRequest request) {
        log.info("Updating variant {} for product {}", variantId, productId);

        VariantResponse response = productService.updateVariant(productId, variantId, request);

        return ApiResponse.<VariantResponse>builder()
                .message("Variant updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa variant
     * DELETE /products/{productId}/variants/{variantId}
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @DeleteMapping("/{productId}/variants/{variantId}")
    public ApiResponse<String> deleteVariant(
            @PathVariable String productId,
            @PathVariable String variantId) {
        log.info("Deleting variant {} from product {}", variantId, productId);

        productService.deleteVariant(productId, variantId);

        return ApiResponse.<String>builder()
                .message("Variant deleted successfully")
                .result("Variant with ID " + variantId + " has been removed")
                .build();
    }

    /**
     * Lấy danh sách variants của sản phẩm
     * GET /products/{productId}/variants
     */
    @GetMapping("/{productId}/variants")
    public ApiResponse<List<VariantResponse>> getVariants(@PathVariable String productId) {
        log.info("Fetching variants for product: {}", productId);

        List<VariantResponse> response = productService.getVariantsByProductId(productId);

        return ApiResponse.<List<VariantResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Thêm thuộc tính cho variant
     * POST /products/{productId}/variants/{variantId}/attributes
     */
    @PostMapping("/{productId}/variants/{variantId}/attributes")
    public ApiResponse<VariantResponse> addVariantAttribute(
            @PathVariable String productId,
            @PathVariable String variantId,
            @Valid @RequestBody VariantAttributeRequest request) {
        log.info("Adding attribute to variant {} of product {}", variantId, productId);
        VariantResponse response = productService.addVariantAttribute(productId, variantId, request);
        return ApiResponse.<VariantResponse>builder()
                .message("Variant attribute added successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa thuộc tính của variant
     * DELETE /products/{productId}/variants/{variantId}/attributes
     */
    @DeleteMapping("/{productId}/variants/{variantId}/attributes")
    public ApiResponse<VariantResponse> removeVariantAttribute(
            @PathVariable String productId,
            @PathVariable String variantId,
            @Valid @RequestBody VariantAttributeRequest request) {
        log.info("Removing attribute from variant {} of product {}", variantId, productId);
        VariantResponse response = productService.removeVariantAttribute(productId, variantId, request);
        return ApiResponse.<VariantResponse>builder()
                .message("Variant attribute removed successfully")
                .result(response)
                .build();
    }

    // ========== Status Management ==========

    /**
     * Cập nhật trạng thái sản phẩm
     * PATCH /products/{productId}/status
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PatchMapping("/{productId}/status")
    public ApiResponse<ProductResponse> updateProductStatus(
            @PathVariable String productId,
            @RequestParam boolean isActive) {
        log.info("Updating product {} status to {}", productId, isActive);

        ProductResponse response = productService.updateProductStatus(productId, isActive);

        return ApiResponse.<ProductResponse>builder()
                .message("Product status updated successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật trạng thái nhiều sản phẩm cùng lúc
     * PATCH /products/bulk-status
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PatchMapping("/bulk-status")
    public ApiResponse<Void> bulkUpdateStatus(
            @Valid @RequestBody BulkStatusUpdateRequest request) {
        log.info("Bulk updating status for {} products", request.getProductIds().size());

        productService.bulkUpdateStatus(request);

        return ApiResponse.<Void>builder()
                .message("Bulk status update completed")
                .build();
    }

    /**
     * Cập nhật trạng thái variant
     * PATCH /products/{productId}/variants/{variantId}/status
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PatchMapping("/{productId}/variants/{variantId}/status")
    public ApiResponse<VariantResponse> updateVariantStatus(
            @PathVariable String productId,
            @PathVariable String variantId,
            @RequestParam boolean isActive) {
        log.info("Updating variant {} of product {} status to {}", variantId, productId, isActive);
        VariantResponse response = productService.updateVariantStatus(productId, variantId, isActive);
        return ApiResponse.<VariantResponse>builder()
                .message("Variant status updated successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật trạng thái nhiều variant cùng lúc
     * PATCH /products/{productId}/variants/bulk-status
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PatchMapping("/{productId}/variants/bulk-status")
    public ApiResponse<List<VariantResponse>> bulkUpdateVariantStatus(
            @PathVariable String productId,
            @Valid @RequestBody BulkVariantStatusUpdateRequest request) {
        log.info("Bulk updating status for {} variants of product {}", request.getVariantIds().size(), productId);
        List<VariantResponse> response = productService.bulkUpdateVariantStatus(productId, request);
        return ApiResponse.<List<VariantResponse>>builder()
                .message("Bulk variant status update completed")
                .result(response)
                .build();
    }

    // ========== Inventory Management ==========

    /**
     * Cập nhật số lượng tồn kho
     * PATCH /products/{productId}/variants/{variantId}/stock
     * Required: SELLER (owner) hoặc ADMIN role
     */
    @PatchMapping("/{productId}/variants/{variantId}/stock")
    public ApiResponse<VariantResponse> updateStock(
            @PathVariable String productId,
            @PathVariable String variantId,
            @RequestParam Integer quantity) {
        log.info("Updating stock for variant {} to {}", variantId, quantity);

        VariantResponse response = productService.updateVariantStock(productId, variantId, quantity);

        return ApiResponse.<VariantResponse>builder()
                .message("Stock updated successfully")
                .result(response)
                .build();
    }
}