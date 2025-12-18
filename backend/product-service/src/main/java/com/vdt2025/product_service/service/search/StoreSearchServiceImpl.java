package com.vdt2025.product_service.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregate;
import co.elastic.clients.elasticsearch._types.aggregations.StatsAggregate;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.search.HitsMetadata;
import co.elastic.clients.json.JsonData;
import com.vdt2025.product_service.document.StoreDocument;
import com.vdt2025.product_service.dto.request.search.StoreSearchRequest;
import com.vdt2025.product_service.dto.response.search.StoreSearchResponse;
import com.vdt2025.product_service.dto.response.search.StoreSearchResponse.*;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.repository.StoreRepository;
import com.vdt2025.product_service.repository.elasticsearch.StoreSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation của StoreSearchService sử dụng Elasticsearch
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StoreSearchServiceImpl implements StoreSearchService {

    ElasticsearchClient elasticsearchClient;
    ElasticsearchOperations elasticsearchOperations;
    StoreSearchRepository storeSearchRepository;
    StoreRepository storeRepository;
    StoreIndexMapper storeIndexMapper;

    private static final String INDEX_NAME = "stores";

    @Override
    public StoreSearchResponse search(StoreSearchRequest request, Pageable pageable) {
        log.info("Searching stores with keyword: {}, page: {}, size: {}",
                request.getKeyword(), pageable.getPageNumber(), pageable.getPageSize());

        try {
            // Build search request
            SearchRequest searchRequest = buildSearchRequest(request, pageable);

            // Execute search
            SearchResponse<StoreDocument> response = elasticsearchClient.search(
                    searchRequest, StoreDocument.class);

            // Map response
            return mapSearchResponse(response, pageable, request);

        } catch (IOException e) {
            log.error("Error searching stores: {}", e.getMessage(), e);
            throw new RuntimeException("Store search failed", e);
        }
    }

    @Override
    public List<String> suggest(String prefix, int size) {
        if (!StringUtils.hasText(prefix) || prefix.length() < 2) {
            return Collections.emptyList();
        }

        log.debug("Getting store suggestions for prefix: {}", prefix);

        try {
            SearchRequest request = SearchRequest.of(s -> s
                    .index(INDEX_NAME)
                    .size(size)
                    .query(q -> q
                            .bool(b -> b
                                    .must(m -> m
                                            .multiMatch(mm -> mm
                                                    .query(prefix)
                                                    .fields(Arrays.asList(
                                                            "storeName.autocomplete^3",
                                                            "storeName^2",
                                                            "storeDescription"
                                                    ))
                                                    .type(TextQueryType.BestFields)
                                                    .fuzziness("AUTO")
                                                    .prefixLength(2)
                                            )
                                    )
                                    .filter(f -> f.term(t -> t.field("isActive").value(true)))
                            )
                    )
                    .source(src -> src
                            .filter(sf -> sf
                                    .includes(Arrays.asList("storeName"))
                            )
                    )
            );

            SearchResponse<StoreDocument> response = elasticsearchClient.search(request, StoreDocument.class);

            return response.hits().hits().stream()
                    .map(hit -> hit.source())
                    .filter(doc -> doc != null && doc.getStoreName() != null)
                    .map(StoreDocument::getStoreName)
                    .distinct()
                    .limit(size)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting store suggestions: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void indexStore(String storeId) {
        log.info("Indexing store: {}", storeId);

        storeRepository.findById(storeId).ifPresent(store -> {
            if (store.isActive()) {
                StoreDocument document = storeIndexMapper.toDocument(store);
                storeSearchRepository.save(document);
                log.info("Store {} indexed successfully", storeId);
            } else {
                // Remove inactive store from index
                storeSearchRepository.deleteById(storeId);
                log.info("Store {} removed from index (inactive)", storeId);
            }
        });
    }

    @Override
    @Async("elasticsearchTaskExecutor")
    @Transactional(readOnly = true)
    public void indexStores(List<String> storeIds) {
        log.info("Indexing {} stores", storeIds.size());

        List<Store> stores = storeRepository.findAllById(storeIds);
        List<StoreDocument> documents = stores.stream()
                .filter(Store::isActive)
                .map(storeIndexMapper::toDocument)
                .collect(Collectors.toList());

        storeSearchRepository.saveAll(documents);
        log.info("{} stores indexed successfully", documents.size());
    }

    @Override
    public void deleteFromIndex(String storeId) {
        log.info("Deleting store from index: {}", storeId);
        storeSearchRepository.deleteById(storeId);
    }

    @Override
    @Async("elasticsearchTaskExecutor")
    @Transactional(readOnly = true)
    public void reindexAll() {
        log.info("Starting full reindex of all stores");

        // Delete and recreate index
        IndexOperations indexOps = elasticsearchOperations.indexOps(StoreDocument.class);
        if (indexOps.exists()) {
            indexOps.delete();
        }
        indexOps.create();
        indexOps.putMapping(indexOps.createMapping());

        // Batch index all active stores
        int batchSize = 100;
        int page = 0;
        long totalIndexed = 0;

        while (true) {
            List<Store> stores = storeRepository.findAllByIsActiveTrue(
                    org.springframework.data.domain.PageRequest.of(page, batchSize)
            ).getContent();

            if (stores.isEmpty()) {
                break;
            }

            List<StoreDocument> documents = stores.stream()
                    .map(storeIndexMapper::toDocument)
                    .collect(Collectors.toList());

            storeSearchRepository.saveAll(documents);
            totalIndexed += documents.size();
            page++;

            log.info("Indexed store batch {}, total: {}", page, totalIndexed);
        }

        log.info("Store reindex completed. Total stores indexed: {}", totalIndexed);
    }

    @Override
    public boolean isHealthy() {
        try {
            return elasticsearchClient.ping().value();
        } catch (Exception e) {
            log.error("Elasticsearch health check failed: {}", e.getMessage());
            return false;
        }
    }

    // ========== Private Helper Methods ==========

    private SearchRequest buildSearchRequest(StoreSearchRequest request, Pageable pageable) {
        return SearchRequest.of(s -> {
            s.index(INDEX_NAME)
                    .query(buildQuery(request))
                    .from((int) pageable.getOffset())
                    .size(pageable.getPageSize());

            // Add sorting
            addSorting(s, request);

            // Add highlighting if enabled
            if (Boolean.TRUE.equals(request.getEnableHighlight())) {
                s.highlight(h -> h
                        .fields("storeName", hf -> hf
                                .preTags("<em>")
                                .postTags("</em>")
                                .numberOfFragments(0)
                        )
                        .fields("storeDescription", hf -> hf
                                .preTags("<em>")
                                .postTags("</em>")
                                .fragmentSize(150)
                                .numberOfFragments(3)
                        )
                        .fields("shopAddress", hf -> hf
                                .preTags("<em>")
                                .postTags("</em>")
                                .numberOfFragments(0)
                        )
                );
            }

            // Add aggregations if enabled
            if (Boolean.TRUE.equals(request.getEnableAggregation())) {
                addAggregations(s);
            }

            return s;
        });
    }

    private Query buildQuery(StoreSearchRequest request) {
        List<Query> mustQueries = new ArrayList<>();
        List<Query> filterQueries = new ArrayList<>();

        // Full-text search on keyword
        if (StringUtils.hasText(request.getKeyword())) {
            String keyword = request.getKeyword().trim();

            Query multiMatch = MultiMatchQuery.of(m -> m
                    .query(keyword)
                    .fields(Arrays.asList(
                            "storeName^3",
                            "storeName.autocomplete^2",
                            "storeDescription^1.5",
                            "shopAddress"
                    ))
                    .type(TextQueryType.BestFields)
                    .fuzziness(Boolean.TRUE.equals(request.getEnableFuzzy()) ? "AUTO" : "0")
                    .prefixLength(2)
                    .minimumShouldMatch("75%")
            )._toQuery();

            mustQueries.add(multiMatch);
        }

        // Province filter
        if (request.getProvinceId() != null) {
            filterQueries.add(TermQuery.of(t -> t
                    .field("provinceId")
                    .value(request.getProvinceId())
            )._toQuery());
        }

        // Ward filter
        if (request.getWardId() != null) {
            filterQueries.add(TermQuery.of(t -> t
                    .field("wardId")
                    .value(request.getWardId())
            )._toQuery());
        }

        // Rating filter
        if (request.getMinRating() != null) {
            filterQueries.add(RangeQuery.of(r -> r
                    .field("averageRating")
                    .gte(JsonData.of(request.getMinRating()))
            )._toQuery());
        }

        // Min products filter
        if (request.getMinProducts() != null) {
            filterQueries.add(RangeQuery.of(r -> r
                    .field("totalProducts")
                    .gte(JsonData.of(request.getMinProducts()))
            )._toQuery());
        }

        // Always filter active stores
        filterQueries.add(TermQuery.of(t -> t.field("isActive").value(true))._toQuery());

        // Build final bool query
        return BoolQuery.of(b -> {
            if (!mustQueries.isEmpty()) {
                b.must(mustQueries);
            }
            if (!filterQueries.isEmpty()) {
                b.filter(filterQueries);
            }
            return b;
        })._toQuery();
    }

    private void addSorting(SearchRequest.Builder builder, StoreSearchRequest request) {
        String sortBy = request.getSortBy();
        boolean isAsc = "asc".equalsIgnoreCase(request.getSortDirection());
        SortOrder order = isAsc ? SortOrder.Asc : SortOrder.Desc;

        if (!StringUtils.hasText(sortBy) || "relevance".equalsIgnoreCase(sortBy)) {
            // Default: sort by score
            builder.sort(s -> s.score(sc -> sc.order(SortOrder.Desc)));
        } else {
            String field = switch (sortBy.toLowerCase()) {
                case "rating" -> "averageRating";
                case "products" -> "totalProducts";
                case "sold" -> "totalSold";
                case "followers" -> "followerCount";
                case "newest" -> "createdAt";
                default -> sortBy;
            };

            builder.sort(s -> s.field(f -> f.field(field).order(order)));
        }

        // Secondary sort by score
        builder.sort(s -> s.score(sc -> sc.order(SortOrder.Desc)));
    }

    private void addAggregations(SearchRequest.Builder builder) {
        builder.aggregations("provinces", a -> a
                .terms(t -> t.field("provinceId").size(64))
        );
        builder.aggregations("rating_avg", a -> a
                .avg(avg -> avg.field("averageRating"))
        );
    }

    private StoreSearchResponse mapSearchResponse(
            SearchResponse<StoreDocument> response,
            Pageable pageable,
            StoreSearchRequest request) {

        HitsMetadata<StoreDocument> hitsMetadata = response.hits();
        long totalHits = hitsMetadata.total() != null ? hitsMetadata.total().value() : 0;

        // Map hits to response
        List<StoreSearchHit> hits = hitsMetadata.hits().stream()
                .map(this::mapHit)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Build response
        StoreSearchResponse.StoreSearchResponseBuilder builder = StoreSearchResponse.builder()
                .hits(hits)
                .totalHits(totalHits)
                .totalPages((int) Math.ceil((double) totalHits / pageable.getPageSize()))
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .took(response.took())
                .maxScore(hitsMetadata.maxScore() != null && !Double.isNaN(hitsMetadata.maxScore()) 
                        ? hitsMetadata.maxScore().floatValue() : null);

        // Map aggregations if present
        if (Boolean.TRUE.equals(request.getEnableAggregation()) && response.aggregations() != null) {
            builder.aggregations(mapAggregations(response.aggregations()));
        }

        return builder.build();
    }

    private StoreSearchHit mapHit(Hit<StoreDocument> hit) {
        StoreDocument doc = hit.source();
        if (doc == null) {
            return null;
        }

        // Map highlights
        Map<String, List<String>> highlights = new HashMap<>();
        if (hit.highlight() != null && !hit.highlight().isEmpty()) {
            highlights.putAll(hit.highlight());
        }

        return StoreSearchHit.builder()
                .id(hit.id())
                .score(hit.score() != null && !Double.isNaN(hit.score()) ? hit.score().floatValue() : null)
                .store(mapToSummary(doc))
                .highlights(highlights)
                .build();
    }

    private StoreSummaryResponse mapToSummary(StoreDocument doc) {
        return StoreSummaryResponse.builder()
                .id(doc.getId())
                .sellerProfileId(doc.getSellerProfileId())
                .userName(doc.getUserName())
                .storeName(doc.getStoreName())
                .storeDescription(doc.getStoreDescription())
                .logoUrl(doc.getLogoUrl())
                .bannerUrl(doc.getBannerUrl())
                .shopAddress(doc.getShopAddress())
                .provinceId(doc.getProvinceId())
                .wardId(doc.getWardId())
                .isActive(doc.isActive())
                .totalProducts(doc.getTotalProducts())
                .totalSold(doc.getTotalSold())
                .averageRating(doc.getAverageRating())
                .followerCount(doc.getFollowerCount())
                .createdAt(doc.getCreatedAt())
                .build();
    }

    private StoreSearchAggregations mapAggregations(Map<String, Aggregate> aggs) {
        StoreSearchAggregations.StoreSearchAggregationsBuilder builder = StoreSearchAggregations.builder();

        // Provinces
        if (aggs.containsKey("provinces")) {
            Aggregate provinceAgg = aggs.get("provinces");
            if (provinceAgg.isSterms()) {
                List<BucketAggregation> provinceBuckets = provinceAgg.sterms().buckets().array().stream()
                        .map(bucket -> BucketAggregation.builder()
                                .key(bucket.key().stringValue())
                                .label(bucket.key().stringValue())
                                .docCount(bucket.docCount())
                                .build())
                        .collect(Collectors.toList());
                builder.provinces(provinceBuckets);
            } else if (provinceAgg.isLterms()) {
                List<BucketAggregation> provinceBuckets = provinceAgg.lterms().buckets().array().stream()
                        .map(bucket -> BucketAggregation.builder()
                                .key(String.valueOf(bucket.key()))
                                .label(String.valueOf(bucket.key()))
                                .docCount(bucket.docCount())
                                .build())
                        .collect(Collectors.toList());
                builder.provinces(provinceBuckets);
            }
        }

        // Rating average
        if (aggs.containsKey("rating_avg")) {
            Aggregate ratingAgg = aggs.get("rating_avg");
            if (ratingAgg.isAvg()) {
                builder.ratingDistribution(RatingAggregation.builder()
                        .average(ratingAgg.avg().value())
                        .build());
            }
        }

        return builder.build();
    }
}
