package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.search.ProductSearchRequest;
import com.vdt2025.product_service.dto.request.search.StoreSearchRequest;
import com.vdt2025.product_service.dto.response.search.GlobalSearchResponse;
import com.vdt2025.product_service.dto.response.search.ProductSearchResponse;
import com.vdt2025.product_service.dto.response.search.StoreSearchResponse;
import com.vdt2025.product_service.facade.ProductSearchFacade;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho tìm kiếm tổng hợp (cả sản phẩm và cửa hàng)
 */
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Global Search", description = "APIs for global search across products and stores")
@Slf4j
public class GlobalSearchController {

    ProductSearchFacade productSearchFacade;
    StoreSearchService storeSearchService;

    /**
     * Tìm kiếm tổng hợp - trả về cả sản phẩm và cửa hàng
     */
    @GetMapping
    @Operation(summary = "Global search", description = "Search across products and stores with a single keyword")
    public ApiResponse<GlobalSearchResponse> globalSearch(
            @Parameter(description = "Search keyword")
            @RequestParam(required = false) String q,
            @Parameter(description = "Number of products to return")
            @RequestParam(defaultValue = "10") int productLimit,
            @Parameter(description = "Number of stores to return")
            @RequestParam(defaultValue = "5") int storeLimit
    ) {
        log.info("Global search request: keyword={}, productLimit={}, storeLimit={}", q, productLimit, storeLimit);
        
        long startTime = System.currentTimeMillis();

        // Search products
        ProductSearchRequest productRequest = ProductSearchRequest.builder()
                .keyword(q)
                .enableHighlight(true)
                .enableFuzzy(true)
                .enableAggregation(false)
                .build();
        
        Pageable productPageable = PageRequest.of(0, Math.min(productLimit, 50));
        ProductSearchResponse productResponse = productSearchFacade.searchWithRealtimeStock(productRequest, productPageable);

        // Search stores
        StoreSearchRequest storeRequest = StoreSearchRequest.builder()
                .keyword(q)
                .enableHighlight(true)
                .enableFuzzy(true)
                .enableAggregation(false)
                .build();
        
        Pageable storePageable = PageRequest.of(0, Math.min(storeLimit, 20));
        StoreSearchResponse storeResponse = storeSearchService.search(storeRequest, storePageable);

        long totalTook = System.currentTimeMillis() - startTime;

        GlobalSearchResponse response = GlobalSearchResponse.builder()
                .products(GlobalSearchResponse.ProductSearchResult.builder()
                        .hits(productResponse.getHits())
                        .totalHits(productResponse.getTotalHits())
                        .took(productResponse.getTook())
                        .build())
                .stores(GlobalSearchResponse.StoreSearchResult.builder()
                        .hits(storeResponse.getHits())
                        .totalHits(storeResponse.getTotalHits())
                        .took(storeResponse.getTook())
                        .build())
                .totalTook(totalTook)
                .build();

        return ApiResponse.<GlobalSearchResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    /**
     * Autocomplete tổng hợp - trả về suggestions cho cả sản phẩm và cửa hàng
     */
    @GetMapping("/suggest")
    @Operation(summary = "Global suggestions", description = "Get autocomplete suggestions for both products and stores")
    public ApiResponse<GlobalSuggestResponse> globalSuggest(
            @Parameter(description = "Search prefix")
            @RequestParam String q,
            @Parameter(description = "Number of product suggestions")
            @RequestParam(defaultValue = "5") int productLimit,
            @Parameter(description = "Number of store suggestions")
            @RequestParam(defaultValue = "3") int storeLimit
    ) {
        // Get product suggestions
        List<String> productSuggestions = productSearchFacade.suggest(q, Math.min(productLimit, 10));
        
        // Get store suggestions
        List<String> storeSuggestions = storeSearchService.suggest(q, Math.min(storeLimit, 5));

        GlobalSuggestResponse response = new GlobalSuggestResponse(productSuggestions, storeSuggestions);

        return ApiResponse.<GlobalSuggestResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    /**
     * Response DTO for global suggestions
     */
    public record GlobalSuggestResponse(
            List<String> products,
            List<String> stores
    ) {}
}
