package com.vdt2025.product_service.facade;

import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.dto.request.search.ProductSearchRequest;
import com.vdt2025.product_service.dto.response.PageCacheDTO;
import com.vdt2025.product_service.dto.response.ProductSummaryResponse;
import com.vdt2025.product_service.dto.response.search.ProductSearchResponse;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.service.ProductService;
import com.vdt2025.product_service.service.search.ProductSearchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Facade: Chịu trách nhiệm điều phối việc tìm kiếm sản phẩm.
 * Nhiệm vụ: Lấy dữ liệu tĩnh từ Cache Service -> Lấy dữ liệu động từ DB -> Ghép lại.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchFacade {
    private final ProductService productService;
    private final ProductSearchService productSearchService;
    private final InventoryStockRepository inventoryStockRepository;

    /**
     * Tìm kiếm sản phẩm bằng Elasticsearch và ghép thông tin tồn kho realtime
     */
    public ProductSearchResponse searchWithRealtimeStock(ProductSearchRequest request, Pageable pageable) {
        // 1. Search từ Elasticsearch
        ProductSearchResponse response = productSearchService.search(request, pageable);

        if (response.getHits() == null || response.getHits().isEmpty()) {
            return response;
        }

        // 2. Lấy danh sách ID sản phẩm
        List<String> productIds = response.getHits().stream()
                .map(hit -> hit.getProduct().getId())
                .collect(Collectors.toList());

        // 3. Query tồn kho realtime từ DB
        List<Object[]> stockData = inventoryStockRepository.countTotalAvailableStockByProductIds(productIds);
        Map<String, Integer> stockMap = stockData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        // 4. Cập nhật thông tin tồn kho vào kết quả
        List<ProductSearchResponse.ProductSearchHit> enrichedHits = response.getHits().stream()
                .map(hit -> {
                    ProductSummaryResponse originalProduct = hit.getProduct();
                    ProductSummaryResponse enrichedProduct = originalProduct.toBuilder()
                            .totalAvailableStock(stockMap.getOrDefault(originalProduct.getId(), 0))
                            .build();
                    
                    hit.setProduct(enrichedProduct);
                    return hit;
                })
                .collect(Collectors.toList());

        response.setHits(enrichedHits);
        return response;
    }

    public PageCacheDTO<ProductSummaryResponse> searchProductsWithStock(ProductFilterRequest filter, Pageable pageable) {
        // Lấy danh sách sản phẩm cơ bản
        PageCacheDTO<ProductSummaryResponse> cachedResult = productService.searchProductsInternal(filter, pageable);

        // Nếu danh sách rỗng, trả về ngay
        if (cachedResult.content().isEmpty()) {
            return cachedResult;
        }

        // Lấy danh sách ID để chuẩn bị query tồn kho
        List<String> productIds = cachedResult.content().stream()
                .map(ProductSummaryResponse::getId)
                .toList();

        // Query tổng tồn kho
        // Trả về dạng List Object[]
        List<Object[]> stockData = inventoryStockRepository.countTotalAvailableStockByProductIds(productIds);

        Map<String, Integer> stockMap = stockData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],             // Key: ProductId
                        row -> ((Long) row[1]).intValue()   // Value: Total Available Stock
                ));

        // Ghép dữ liệu (Hydration)
        // Tạo một List mới hoàn toàn để đảm bảo không thay đổi object gốc trong Cache
        List<ProductSummaryResponse> enrichedContent = cachedResult.content().stream()
                .map(product -> product.toBuilder()
                        .totalAvailableStock(stockMap.getOrDefault(product.getId(), 0)) // Nếu không tìm thấy thì là 0
                        .build())
                .toList();

        // Trả về kết quả đã ghép
        return new PageCacheDTO<>(
                enrichedContent,
                cachedResult.pageNumber(),
                cachedResult.pageSize(),
                cachedResult.totalElements()
        );
    }
}
