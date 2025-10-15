package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.product.ProductCreationRequest;
import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.dto.request.product.ProductUpdateRequest;
import com.vdt2025.product_service.dto.response.ProductResponse;
import com.vdt2025.product_service.service.ProductServiceImp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {
    ProductServiceImp productService;

    // Thêm sản phẩm mới
    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody ProductCreationRequest request) {
        log.info("Creating new product: {}", request.getName());
        ProductResponse productResponse = productService.createProduct(request);
        return ApiResponse.<ProductResponse>builder()
                .result(productResponse)
                .build();
    }

    // Cập nhật thumbnail sản phẩm
    @PostMapping("/{productId}/thumbnail")
    public ApiResponse<String> updateProductThumbnail(
            @PathVariable String productId,
            @RequestParam("file") MultipartFile file) {
        log.info("Updating thumbnail for product ID: {}", productId);
        String result = productService.setProductThumbnail(productId, file);
        return ApiResponse.<String>builder()
                .message("Thumbnail updated successfully")
                .result(result)
                .build();
    }

    // Cập nhật thông tin sản phẩm
    @PutMapping("/{productId}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable String productId,
            @RequestBody ProductUpdateRequest request) {
        log.info("Updating product with ID: {}", productId);
        ProductResponse productResponse = productService.updateProduct(productId, request);
        return ApiResponse.<ProductResponse>builder()
                .result(productResponse)
                .build();
    }

    // Xóa sản phẩm theo ID
    @DeleteMapping("/{productId}")
    public ApiResponse<String> deleteProduct(@PathVariable String productId) {
        log.info("Deleting product with ID: {}", productId);
        productService.deleteProduct(productId);
        return ApiResponse.<String>builder()
                .message("Product deleted successfully")
                .result("Product with ID " + productId + " has been deleted.")
                .build();
    }

    // Lấy thông tin sản phẩm theo ID
    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String productId) {
        log.info("Fetching product with ID: {}", productId);
        ProductResponse productResponse = productService.getProductById(productId);
        return ApiResponse.<ProductResponse>builder()
                .result(productResponse)
                .build();
    }

    // Lấy danh sách sản phẩm với phân trang
    @GetMapping
    public ApiResponse<Page<ProductResponse>> getProducts(
            @ModelAttribute ProductFilterRequest filter,
            Pageable pageable) {
        log.info("Fetching products with filter: {}", filter);
        var result = productService.searchProducts(filter, pageable);
        return ApiResponse.<Page<ProductResponse>>builder()
                .result(result)
                .build();
    }
}
