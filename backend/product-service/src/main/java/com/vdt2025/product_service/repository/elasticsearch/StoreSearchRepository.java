package com.vdt2025.product_service.repository.elasticsearch;

import com.vdt2025.product_service.document.StoreDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

/**
 * Elasticsearch Repository cho Store
 */
@Repository
public interface StoreSearchRepository extends ElasticsearchRepository<StoreDocument, String> {
}
