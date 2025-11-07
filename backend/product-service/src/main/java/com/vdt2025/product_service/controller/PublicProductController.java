package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.FindVariantRequest;
import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.dto.response.*;
import com.vdt2025.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public Controller cho Product (không cần authentication)
 * Dành cho khách hàng xem sản phẩm
 * Best practices:
 * - Chỉ cho phép read operations
 * - Filter để chỉ hiển thị sản phẩm active
 * - Tối ưu performance với caching
 * - Pagination để tránh load nhiều data
 */
@RestController
@RequestMapping("/public/products")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicProductController {
    
    ProductService productService;

    /**
     * Tìm kiếm/xem danh sách sản phẩm (chỉ hiển thị sản phẩm active)
     * GET /public/products
     * 
     * Query params:
     * - keyword: tìm kiếm theo tên hoặc mô tả
     * - categoryId: filter theo danh mục
     * - storeId: filter theo cửa hàng
     * - brandId: filter theo thương hiệu
     * - priceFrom, priceTo: filter theo khoảng giá
     * - ratingFrom: filter theo đánh giá
     * - sortBy: name, price, soldCount, createdAt, averageRating
     * - page, size, sort: pagination
     */
    @GetMapping
    public ApiResponse<Page<ProductSummaryResponse>> getProducts(
            @ModelAttribute ProductFilterRequest filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        log.info("Public: Searching products with filter: {}", filter);
        
        // Force filter to only show active products
        filter.setIsActive(true);

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
     * Xem chi tiết sản phẩm
     * GET /public/products/{productId}
     */
    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> getProductDetail(@PathVariable String productId) {
        log.info("Public: Fetching product detail: {}", productId);
        
        // Increment view count
        productService.incrementViewCount(productId);
        
        ProductResponse response = productService.getProductById(productId);
        
        return ApiResponse.<ProductResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Xem danh sách variants của sản phẩm
     * GET /public/products/{productId}/variants
     */
    @GetMapping("/{productId}/variants")
    public ApiResponse<List<VariantResponse>> getProductVariants(@PathVariable String productId) {
        log.info("Public: Fetching variants for product: {}", productId);
        
        List<VariantResponse> response = productService.getVariantsByProductId(productId);
        
        return ApiResponse.<List<VariantResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Xem sản phẩm theo store
     * GET /public/products/store/{storeId}
     */
    @GetMapping("/store/{storeId}")
    public ApiResponse<Page<ProductSummaryResponse>> getProductsByStore(
            @PathVariable String storeId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        log.info("Public: Fetching products for store: {}", storeId);
        
        Page<ProductSummaryResponse> response = productService.getProductsByStoreId(storeId, pageable);
        
        return ApiResponse.<Page<ProductSummaryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Xem sản phẩm theo category
     * GET /public/products/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ApiResponse<Page<ProductSummaryResponse>> getProductsByCategory(
            @PathVariable String categoryId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        log.info("Public: Fetching products for category: {}", categoryId);
        
        Page<ProductSummaryResponse> response = productService.getProductsByCategoryId(categoryId, pageable);
        
        return ApiResponse.<Page<ProductSummaryResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Xem sản phẩm bán chạy (best sellers)
     * GET /public/products/best-sellers
     */
    @GetMapping("/best-sellers")
    public ApiResponse<Page<ProductSummaryResponse>> getBestSellers(
            @PageableDefault(size = 20, sort = "soldCount", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        log.info("Public: Fetching best-selling products");
        
        ProductFilterRequest filter = ProductFilterRequest.builder()
                .isActive(true)
                .build();

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
     * Xem sản phẩm đánh giá cao (top rated)
     * GET /public/products/top-rated
     */
    @GetMapping("/top-rated")
    public ApiResponse<Page<ProductSummaryResponse>> getTopRated(
            @RequestParam(defaultValue = "4.0") Double minRating,
            @PageableDefault(size = 20, sort = "averageRating", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        log.info("Public: Fetching top-rated products (min rating: {})", minRating);
        
        ProductFilterRequest filter = ProductFilterRequest.builder()
                .isActive(true)
                .ratingFrom(minRating)
                .build();

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
     * Xem sản phẩm mới (new arrivals)
     * GET /public/products/new-arrivals
     */
    @GetMapping("/new-arrivals")
    public ApiResponse<Page<ProductSummaryResponse>> getNewArrivals(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        log.info("Public: Fetching new arrivals");
        
        ProductFilterRequest filter = ProductFilterRequest.builder()
                .isActive(true)
                .build();

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
     * Lấy thông tin để chọn variant (Màu sắc, Size, ...)
     * GET /public/products/{productId}/variant-options
     * 
     * Use case:
     * - User vào trang chi tiết sản phẩm
     * - Frontend call API này để lấy danh sách thuộc tính có thể chọn
     * - Render UI với dropdown/buttons cho từng thuộc tính
     * 
     * Response structure:
     * {
     *   "productId": "prod-123",
     *   "productName": "Áo Sơ Mi Nam",
     *   "attributeGroups": [
     *     {
     *       "attributeId": "attr-1",
     *       "attributeName": "Màu sắc",
     *       "options": [
     *         {"valueId": "val-1", "value": "Đỏ", "available": true},
     *         {"valueId": "val-2", "value": "Xanh", "available": true}
     *       ]
     *     },
     *     {
     *       "attributeId": "attr-2",
     *       "attributeName": "Size",
     *       "options": [
     *         {"valueId": "val-3", "value": "M", "available": true},
     *         {"valueId": "val-4", "value": "L", "available": true},
     *         {"valueId": "val-5", "value": "XL", "available": true}
     *       ]
     *     }
     *   ],
     *   "variantMatrix": {
     *     "val-1,val-3": "variant-1",  // Đỏ + M -> variant-1
     *     "val-1,val-4": "variant-2",  // Đỏ + L -> variant-2
     *     ...
     *   },
     *   "totalVariants": 6
     * }
     */
    @GetMapping("/{productId}/variant-options")
    public ApiResponse<ProductVariantSelectionResponse> getVariantSelectionOptions(
            @PathVariable String productId) {
        log.info("Public: Fetching variant selection options for product: {}", productId);
        
        ProductVariantSelectionResponse response = productService.getProductVariantSelectionOptions(productId);
        
        return ApiResponse.<ProductVariantSelectionResponse>builder()
                .message("Fetch variant selection options successfully")
                .result(response)
                .build();
    }
    
    /**
     * Tìm variant dựa trên combination của attributes đã chọn
     * POST /public/products/{productId}/find-variant
     * 
     * Use case:
     * - User đã chọn xong tất cả thuộc tính (Màu: Đỏ, Size: XL)
     * - Frontend call API này để lấy thông tin variant tương ứng
     * - Hiển thị giá, số lượng tồn, ảnh của variant đó
     * 
     * Request body:
     * {
     *   "attributeValueIds": ["val-1", "val-5"]  // Đỏ + XL
     * }
     * 
     * Response:
     * {
     *   "id": "variant-2",
     *   "sku": "ASM-DO-XL",
     *   "variantName": "Áo Sơ Mi - Đỏ - XL",
     *   "price": 299000,
     *   "stockQuantity": 50,
     *   "attributeValues": [
     *     {"id": "val-1", "value": "Đỏ", "attributeName": "Màu sắc"},
     *     {"id": "val-5", "value": "XL", "attributeName": "Size"}
     *   ],
     *   ...
     * }
     */
    @PostMapping("/{productId}/find-variant")
    public ApiResponse<VariantResponse> findVariantByAttributes(
            @PathVariable String productId,
            @Valid @RequestBody FindVariantRequest request) {
        log.info("Public: Finding variant for product {} with attributes: {}", 
                productId, request.getAttributeValueIds());
        
        VariantResponse response = productService.findVariantByAttributes(productId, request);
        
        return ApiResponse.<VariantResponse>builder()
                .message("Found variant successfully")
                .result(response)
                .build();
    }
}
