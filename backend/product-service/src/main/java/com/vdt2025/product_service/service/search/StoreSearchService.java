package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.dto.request.search.StoreSearchRequest;
import com.vdt2025.product_service.dto.response.search.StoreSearchResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho tìm kiếm cửa hàng với Elasticsearch
 */
public interface StoreSearchService {

    /**
     * Tìm kiếm cửa hàng với full-text search và filtering
     */
    StoreSearchResponse search(StoreSearchRequest request, Pageable pageable);

    /**
     * Autocomplete/suggestions cho tìm kiếm cửa hàng
     */
    List<String> suggest(String prefix, int size);

    /**
     * Index một cửa hàng vào Elasticsearch
     */
    void indexStore(String storeId);

    /**
     * Index nhiều cửa hàng
     */
    void indexStores(List<String> storeIds);

    /**
     * Xóa cửa hàng khỏi index
     */
    void deleteFromIndex(String storeId);

    /**
     * Reindex tất cả cửa hàng
     */
    void reindexAll();

    /**
     * Kiểm tra Elasticsearch health
     */
    boolean isHealthy();
}
