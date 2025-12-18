package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.search.StoreSearchRequest;
import com.vdt2025.product_service.dto.response.search.StoreSearchResponse;
import com.vdt2025.product_service.service.search.StoreSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho tìm kiếm cửa hàng với Elasticsearch
 */
@RestController
@RequestMapping("/stores/search")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Store Search", description = "APIs for store search using Elasticsearch")
@Slf4j
public class StoreSearchController {

    StoreSearchService storeSearchService;

    /**
     * Tìm kiếm cửa hàng với full-text search và filtering
     */
    @PostMapping
    @Operation(summary = "Search stores", description = "Full-text search stores with filters")
    public ApiResponse<StoreSearchResponse> search(
            @RequestBody StoreSearchRequest request,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("Store search request: keyword={}, page={}, size={}", request.getKeyword(), page, size);

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        StoreSearchResponse response = storeSearchService.search(request, pageable);

        return ApiResponse.<StoreSearchResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    /**
     * Tìm kiếm nhanh cửa hàng với GET request
     */
    @GetMapping
    @Operation(summary = "Quick store search", description = "Simple search stores with keyword and basic filters")
    public ApiResponse<StoreSearchResponse> quickSearch(
            @Parameter(description = "Search keyword")
            @RequestParam(required = false) String q,
            @Parameter(description = "Province ID")
            @RequestParam(required = false) Integer provinceId,
            @Parameter(description = "Ward ID")
            @RequestParam(required = false) Integer wardId,
            @Parameter(description = "Minimum rating")
            @RequestParam(required = false) Double minRating,
            @Parameter(description = "Minimum products count")
            @RequestParam(required = false) Integer minProducts,
            @Parameter(description = "Sort by: relevance, rating, products, sold, followers, newest")
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
        StoreSearchRequest request = StoreSearchRequest.builder()
                .keyword(q)
                .provinceId(provinceId)
                .wardId(wardId)
                .minRating(minRating)
                .minProducts(minProducts)
                .sortBy(sortBy)
                .sortDirection(sortDir)
                .enableAggregation(aggregations)
                .enableHighlight(true)
                .enableFuzzy(true)
                .build();

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        StoreSearchResponse response = storeSearchService.search(request, pageable);

        return ApiResponse.<StoreSearchResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    /**
     * Autocomplete/Suggestion cho tìm kiếm cửa hàng
     */
    @GetMapping("/suggest")
    @Operation(summary = "Get store suggestions", description = "Autocomplete suggestions for store names")
    public ApiResponse<List<String>> suggest(
            @Parameter(description = "Search prefix")
            @RequestParam String q,
            @Parameter(description = "Number of suggestions")
            @RequestParam(defaultValue = "10") int size
    ) {
        List<String> suggestions = storeSearchService.suggest(q, Math.min(size, 20));

        return ApiResponse.<List<String>>builder()
                .code(1000)
                .result(suggestions)
                .build();
    }

    /**
     * Health check cho Store Elasticsearch index
     */
    @GetMapping("/health")
    @Operation(summary = "Store search health check")
    public ApiResponse<StoreSearchHealthResponse> health() {
        boolean healthy = storeSearchService.isHealthy();

        return ApiResponse.<StoreSearchHealthResponse>builder()
                .code(healthy ? 1000 : 5000)
                .result(new StoreSearchHealthResponse(healthy))
                .build();
    }

    /**
     * Reindex một store (Admin only)
     */
    @PostMapping("/reindex/{storeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reindex a store", description = "Admin only - reindex a specific store")
    public ApiResponse<Void> reindexStore(@PathVariable String storeId) {
        log.info("Reindexing store: {}", storeId);
        storeSearchService.indexStore(storeId);

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Store reindex initiated")
                .build();
    }

    /**
     * Full reindex all stores (Admin only)
     */
    @PostMapping("/reindex-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Full store reindex", description = "Admin only - reindex all stores")
    public ApiResponse<Void> reindexAll() {
        log.info("Starting full store reindex");
        storeSearchService.reindexAll();

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Full store reindex initiated")
                .build();
    }

    /**
     * Response DTO for health check
     */
    public record StoreSearchHealthResponse(
            boolean healthy
    ) {}
}
