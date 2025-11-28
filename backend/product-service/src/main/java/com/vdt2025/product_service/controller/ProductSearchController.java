package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.search.ProductSearchRequest;
import com.vdt2025.product_service.dto.response.search.ProductSearchResponse;
import com.vdt2025.product_service.service.search.ElasticsearchSyncService;
import com.vdt2025.product_service.service.search.ProductSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho tìm kiếm sản phẩm với Elasticsearch
 */
@RestController
@RequestMapping("/products/search")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Product Search", description = "APIs for product search using Elasticsearch")
@Slf4j
public class ProductSearchController {

    ProductSearchService productSearchService;
    ElasticsearchSyncService syncService;

    /**
     * Tìm kiếm sản phẩm với full-text search và filtering
     */
    @PostMapping
    @Operation(summary = "Search products", description = "Full-text search with filters and aggregations")
    public ApiResponse<ProductSearchResponse> search(
            @RequestBody ProductSearchRequest request,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("Search request: keyword={}, page={}, size={}", request.getKeyword(), page, size);

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        ProductSearchResponse response = productSearchService.search(request, pageable);

        return ApiResponse.<ProductSearchResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    /**
     * Tìm kiếm nhanh với GET request (cho SEO-friendly URLs)
     */
    @GetMapping
    @Operation(summary = "Quick search", description = "Simple search with keyword and basic filters")
    public ApiResponse<ProductSearchResponse> quickSearch(
            @Parameter(description = "Search keyword")
            @RequestParam(required = false) String q,
            @Parameter(description = "Category ID")
            @RequestParam(required = false) String categoryId,
            @Parameter(description = "Store ID")
            @RequestParam(required = false) String storeId,
            @Parameter(description = "Brand ID")
            @RequestParam(required = false) String brandId,
            @Parameter(description = "Minimum price")
            @RequestParam(required = false) Double priceFrom,
            @Parameter(description = "Maximum price")
            @RequestParam(required = false) Double priceTo,
            @Parameter(description = "Minimum rating")
            @RequestParam(required = false) Double minRating,
            @Parameter(description = "Sort by: relevance, price, sold, rating, newest")
            @RequestParam(defaultValue = "relevance") String sortBy,
            @Parameter(description = "Sort direction: asc, desc")
            @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Page number")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Enable aggregations")
            @RequestParam(defaultValue = "false") boolean aggregations
    ) {
        ProductSearchRequest request = ProductSearchRequest.builder()
                .keyword(q)
                .categoryId(categoryId)
                .storeId(storeId)
                .brandId(brandId)
                .priceFrom(priceFrom != null ? java.math.BigDecimal.valueOf(priceFrom) : null)
                .priceTo(priceTo != null ? java.math.BigDecimal.valueOf(priceTo) : null)
                .minRating(minRating)
                .sortBy(sortBy)
                .sortDirection(sortDir)
                .enableAggregation(aggregations)
                .enableHighlight(true)
                .enableFuzzy(true)
                .build();

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        ProductSearchResponse response = productSearchService.search(request, pageable);

        return ApiResponse.<ProductSearchResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    /**
     * Autocomplete/Suggestion cho search box
     */
    @GetMapping("/suggest")
    @Operation(summary = "Get search suggestions", description = "Autocomplete suggestions based on prefix")
    public ApiResponse<List<String>> suggest(
            @Parameter(description = "Search prefix")
            @RequestParam String q,
            @Parameter(description = "Number of suggestions")
            @RequestParam(defaultValue = "10") int size
    ) {
        List<String> suggestions = productSearchService.suggest(q, Math.min(size, 20));

        return ApiResponse.<List<String>>builder()
                .code(1000)
                .result(suggestions)
                .build();
    }

    /**
     * Health check cho Elasticsearch
     */
    @GetMapping("/health")
    @Operation(summary = "Elasticsearch health check")
    public ApiResponse<ElasticsearchHealthResponse> health() {
        boolean healthy = productSearchService.isHealthy();
        ElasticsearchSyncService.SyncStats stats = syncService.getSyncStats();

        return ApiResponse.<ElasticsearchHealthResponse>builder()
                .code(healthy ? 1000 : 5000)
                .result(new ElasticsearchHealthResponse(
                        healthy,
                        stats.indexedCount(),
                        stats.totalInDb(),
                        stats.syncInProgress()
                ))
                .build();
    }

    /**
     * Reindex một product (Admin only)
     */
    @PostMapping("/reindex/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reindex a product", description = "Admin only - reindex a specific product")
    public ApiResponse<Void> reindexProduct(@PathVariable String productId) {
        log.info("Reindexing product: {}", productId);
        productSearchService.indexProduct(productId);

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Product reindex initiated")
                .build();
    }

    /**
     * Full reindex (Admin only)
     */
    @PostMapping("/reindex-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Full reindex", description = "Admin only - reindex all products")
    public ApiResponse<Void> reindexAll() {
        log.info("Starting full reindex");

        if (syncService.isSyncInProgress()) {
            return ApiResponse.<Void>builder()
                    .code(4000)
                    .message("Sync already in progress")
                    .build();
        }

        syncService.syncAll();

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Full reindex initiated")
                .build();
    }

    /**
     * Get sync stats (Admin only)
     */
    @GetMapping("/sync-stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get sync statistics", description = "Admin only - get Elasticsearch sync statistics")
    public ApiResponse<ElasticsearchSyncService.SyncStats> getSyncStats() {
        return ApiResponse.<ElasticsearchSyncService.SyncStats>builder()
                .code(1000)
                .result(syncService.getSyncStats())
                .build();
    }

    /**
     * Response DTO for health check
     */
    public record ElasticsearchHealthResponse(
            boolean healthy,
            long indexedCount,
            long totalInDb,
            boolean syncInProgress
    ) {}
}
