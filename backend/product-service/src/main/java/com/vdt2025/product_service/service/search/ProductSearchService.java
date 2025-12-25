package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.dto.request.search.ProductSearchRequest;
import com.vdt2025.product_service.dto.response.search.ProductSearchResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho tìm kiếm sản phẩm với ElasticSearch
 */
public interface ProductSearchService {

    /**
     * Tìm kiếm sản phẩm với full-text search và filtering
     */
    ProductSearchResponse search(ProductSearchRequest request, Pageable pageable);

    /**
     * Autocomplete/Suggestion cho search box
     */
    List<String> suggest(String prefix, int size);

    /**
     * Tìm kiếm nhanh chỉ trả về IDs (cho internal use)
     */
    List<String> searchIds(ProductSearchRequest request, Pageable pageable);

    /**
     * Reindex một sản phẩm
     */
    void indexProduct(String productId);

    /**
     * Reindex nhiều sản phẩm
     */
    void indexProducts(List<String> productIds);

    /**
     * Xóa sản phẩm khỏi index
     */
    void deleteFromIndex(String productId);

    /**
     * Reindex toàn bộ sản phẩm từ database
     */
    void reindexAll();

    /**
     * Kiểm tra health của Elasticsearch
     */
    boolean isHealthy();
}
