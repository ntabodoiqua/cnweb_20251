package com.vdt2025.product_service.service.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.*;
import co.elastic.clients.json.JsonData;
import com.vdt2025.product_service.document.ProductDocument;
import com.vdt2025.product_service.dto.request.search.ProductSearchRequest;
import com.vdt2025.product_service.dto.response.ProductSummaryResponse;
import com.vdt2025.product_service.dto.response.search.ProductSearchResponse;
import com.vdt2025.product_service.dto.response.search.ProductSearchResponse.*;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.entity.ProductImage;
import com.vdt2025.product_service.entity.ProductVariant;
import com.vdt2025.product_service.repository.ProductImageRepository;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.repository.ProductVariantRepository;
import com.vdt2025.product_service.repository.elasticsearch.ProductSearchRepository;
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
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation của ProductSearchService sử dụng Elasticsearch
 * Được tối ưu cho e-commerce với full-text search, filtering, và aggregations
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductSearchServiceImpl implements ProductSearchService {

    ElasticsearchClient elasticsearchClient;
    ElasticsearchOperations elasticsearchOperations;
    ProductSearchRepository productSearchRepository;
    ProductRepository productRepository;
    ProductVariantRepository variantRepository;
    ProductImageRepository productImageRepository;
    ProductIndexMapper productIndexMapper;

    private static final String INDEX_NAME = "products";

    @Override
    public ProductSearchResponse search(ProductSearchRequest request, Pageable pageable) {
        log.info("Searching products with keyword: {}, page: {}, size: {}",
                request.getKeyword(), pageable.getPageNumber(), pageable.getPageSize());

        try {
            // Build search request
            SearchRequest searchRequest = buildSearchRequest(request, pageable);

            // Execute search
            SearchResponse<ProductDocument> response = elasticsearchClient.search(
                    searchRequest, ProductDocument.class);

            // Map response
            return mapSearchResponse(response, pageable, request);

        } catch (IOException e) {
            log.error("Error searching products: {}", e.getMessage(), e);
            throw new RuntimeException("Search failed", e);
        }
    }

    @Override
    public List<String> suggest(String prefix, int size) {
        if (!StringUtils.hasText(prefix) || prefix.length() < 2) {
            return Collections.emptyList();
        }

        log.debug("Getting suggestions for prefix: {}", prefix);

        try {
            // Use prefix/match query on name.autocomplete field instead of completion suggester
            // This is more reliable and doesn't require special completion field mapping
            SearchRequest request = SearchRequest.of(s -> s
                    .index(INDEX_NAME)
                    .size(size)
                    .query(q -> q
                            .bool(b -> b
                                    .must(m -> m
                                            .multiMatch(mm -> mm
                                                    .query(prefix)
                                                    .fields(Arrays.asList(
                                                            "name.autocomplete^3",
                                                            "name^2",
                                                            "brandName",
                                                            "categoryName"
                                                    ))
                                                    .type(TextQueryType.BestFields)
                                                    .fuzziness("AUTO")
                                                    .prefixLength(2)
                                            )
                                    )
                                    .filter(f -> f.term(t -> t.field("isDeleted").value(false)))
                                    .filter(f -> f.term(t -> t.field("isActive").value(true)))
                            )
                    )
                    .source(src -> src
                            .filter(sf -> sf
                                    .includes(Arrays.asList("name", "brandName", "categoryName"))
                            )
                    )
            );

            SearchResponse<ProductDocument> response = elasticsearchClient.search(request, ProductDocument.class);

            // Extract unique product names from results
            return response.hits().hits().stream()
                    .map(hit -> hit.source())
                    .filter(doc -> doc != null && doc.getName() != null)
                    .map(ProductDocument::getName)
                    .distinct()
                    .limit(size)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting suggestions: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<String> searchIds(ProductSearchRequest request, Pageable pageable) {
        try {
            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(INDEX_NAME)
                    .query(buildQuery(request))
                    .from((int) pageable.getOffset())
                    .size(pageable.getPageSize())
                    .source(src -> src.fetch(false))
            );

            SearchResponse<ProductDocument> response = elasticsearchClient.search(
                    searchRequest, ProductDocument.class);

            return response.hits().hits().stream()
                    .map(Hit::id)
                    .collect(Collectors.toList());

        } catch (IOException e) {
            log.error("Error searching product IDs: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void indexProduct(String productId) {
        log.info("Indexing product: {}", productId);

        productRepository.findById(productId).ifPresent(product -> {
            ProductDocument document = productIndexMapper.toDocument(product);
            productSearchRepository.save(document);
            log.info("Product {} indexed successfully", productId);
        });
    }

    @Override
    @Async("elasticsearchTaskExecutor")
    @Transactional(readOnly = true)
    public void indexProducts(List<String> productIds) {
        log.info("Indexing {} products", productIds.size());

        List<Product> products = productRepository.findAllById(productIds);
        List<ProductDocument> documents = products.stream()
                .map(productIndexMapper::toDocument)
                .collect(Collectors.toList());

        productSearchRepository.saveAll(documents);
        log.info("{} products indexed successfully", documents.size());
    }

    @Override
    public void deleteFromIndex(String productId) {
        log.info("Deleting product from index: {}", productId);
        productSearchRepository.deleteById(productId);
    }

    @Override
    @Async("elasticsearchTaskExecutor")
    @Transactional(readOnly = true)
    public void reindexAll() {
        log.info("Starting full reindex of all products");

        // Delete and recreate index to ensure correct mapping
        IndexOperations indexOps = elasticsearchOperations.indexOps(ProductDocument.class);
        if (indexOps.exists()) {
            indexOps.delete();
        }
        indexOps.create();
        indexOps.putMapping(indexOps.createMapping());

        // Batch index all products
        int batchSize = 100;
        int page = 0;
        long totalIndexed = 0;

        while (true) {
            List<Product> products = productRepository.findAll(
                    org.springframework.data.domain.PageRequest.of(page, batchSize)
            ).getContent();

            if (products.isEmpty()) {
                break;
            }

            List<ProductDocument> documents = products.stream()
                    .filter(p -> !p.isDeleted())
                    .map(productIndexMapper::toDocument)
                    .collect(Collectors.toList());

            productSearchRepository.saveAll(documents);
            totalIndexed += documents.size();
            page++;

            log.info("Indexed batch {}, total: {}", page, totalIndexed);
        }

        log.info("Full reindex completed. Total products indexed: {}", totalIndexed);
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

    private SearchRequest buildSearchRequest(ProductSearchRequest request, Pageable pageable) {
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
                        .fields("name", hf -> hf
                                .preTags("<em>")
                                .postTags("</em>")
                                .numberOfFragments(0)
                        )
                        .fields("description", hf -> hf
                                .preTags("<em>")
                                .postTags("</em>")
                                .fragmentSize(150)
                                .numberOfFragments(3)
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

    private Query buildQuery(ProductSearchRequest request) {
        List<Query> mustQueries = new ArrayList<>();
        List<Query> filterQueries = new ArrayList<>();
        List<Query> shouldQueries = new ArrayList<>();

        // Full-text search on keyword
        if (StringUtils.hasText(request.getKeyword())) {
            String keyword = request.getKeyword().trim();

            // Multi-match query với boosting
            Query multiMatch = MultiMatchQuery.of(m -> m
                    .query(keyword)
                    .fields(Arrays.asList(
                            "name^3",
                            "name.autocomplete^2",
                            "shortDescription^1.5",
                            "description",
                            "brandName^1.5",
                            "categoryName",
                            "specsText",              // Tìm kiếm trong specs
                            "variants.metadataText",  // Tìm kiếm trong variant metadata
                            "variants.variantName",   // Tìm kiếm trong tên variant
                            "selectionOptionsText",   // Tìm kiếm trong selection options (VD: iPhone 15 Pro, Samsung S24)
                            "selectionGroups.name",   // Tìm kiếm theo tên nhóm selection
                            "selectionGroups.options.value",  // Tìm kiếm theo giá trị option
                            "selectionGroups.options.label"   // Tìm kiếm theo label option
                    ))
                    .type(TextQueryType.BestFields)
                    .fuzziness(Boolean.TRUE.equals(request.getEnableFuzzy()) ? "AUTO" : "0")
                    .prefixLength(2)
                    .minimumShouldMatch("75%")
            )._toQuery();

            mustQueries.add(multiMatch);
        }

        // Category filter
        if (StringUtils.hasText(request.getCategoryId())) {
            filterQueries.add(buildTermQuery("categoryId", request.getCategoryId()));
        } else if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            filterQueries.add(buildTermsQuery("categoryId", request.getCategoryIds()));
        }

        // Store filter
        if (StringUtils.hasText(request.getStoreId())) {
            filterQueries.add(buildTermQuery("storeId", request.getStoreId()));
        } else if (request.getStoreIds() != null && !request.getStoreIds().isEmpty()) {
            filterQueries.add(buildTermsQuery("storeId", request.getStoreIds()));
        }

        // Brand filter
        if (StringUtils.hasText(request.getBrandId())) {
            filterQueries.add(buildTermQuery("brandId", request.getBrandId()));
        } else if (request.getBrandIds() != null && !request.getBrandIds().isEmpty()) {
            filterQueries.add(buildTermsQuery("brandId", request.getBrandIds()));
        }

        // Price range filter
        if (request.getPriceFrom() != null || request.getPriceTo() != null) {
            filterQueries.add(buildPriceRangeQuery(request.getPriceFrom(), request.getPriceTo()));
        }

        // Rating filter
        if (request.getMinRating() != null) {
            filterQueries.add(RangeQuery.of(r -> r
                    .field("averageRating")
                    .gte(JsonData.of(request.getMinRating()))
            )._toQuery());
        }

        // Status filters
        if (request.getIsActive() == null || request.getIsActive()) {
            filterQueries.add(buildTermQuery("isActive", true));
        }
        filterQueries.add(buildTermQuery("isDeleted", false));

        // Attribute filters (nested query)
        if (request.getAttributeFilters() != null && !request.getAttributeFilters().isEmpty()) {
            for (ProductSearchRequest.AttributeFilter attrFilter : request.getAttributeFilters()) {
                if (attrFilter.getValues() != null && !attrFilter.getValues().isEmpty()) {
                    filterQueries.add(buildAttributeFilter(attrFilter));
                }
            }
        }

        // Build final bool query
        return BoolQuery.of(b -> {
            if (!mustQueries.isEmpty()) {
                b.must(mustQueries);
            }
            if (!filterQueries.isEmpty()) {
                b.filter(filterQueries);
            }
            if (!shouldQueries.isEmpty()) {
                b.should(shouldQueries);
            }
            return b;
        })._toQuery();
    }

    private Query buildTermQuery(String field, Object value) {
        if (value instanceof Boolean) {
            return TermQuery.of(t -> t.field(field).value((Boolean) value))._toQuery();
        }
        return TermQuery.of(t -> t.field(field).value(value.toString()))._toQuery();
    }

    private Query buildTermsQuery(String field, List<String> values) {
        return TermsQuery.of(t -> t
                .field(field)
                .terms(ts -> ts.value(values.stream()
                        .map(FieldValue::of)
                        .collect(Collectors.toList())))
        )._toQuery();
    }

    private Query buildPriceRangeQuery(BigDecimal from, BigDecimal to) {
        return RangeQuery.of(r -> {
            r.field("minPrice");
            if (from != null) {
                r.gte(JsonData.of(from.doubleValue()));
            }
            if (to != null) {
                r.lte(JsonData.of(to.doubleValue()));
            }
            return r;
        })._toQuery();
    }

    private Query buildAttributeFilter(ProductSearchRequest.AttributeFilter filter) {
        List<Query> shouldQueries = filter.getValues().stream()
                .map(value -> BoolQuery.of(b -> b
                        .must(Arrays.asList(
                                TermQuery.of(t -> t.field("attributes.attributeId").value(filter.getAttributeId()))._toQuery(),
                                TermQuery.of(t -> t.field("attributes.value").value(value))._toQuery()
                        ))
                )._toQuery())
                .collect(Collectors.toList());

        return NestedQuery.of(n -> n
                .path("attributes")
                .query(BoolQuery.of(b -> b.should(shouldQueries).minimumShouldMatch("1"))._toQuery())
        )._toQuery();
    }

    private void addSorting(SearchRequest.Builder builder, ProductSearchRequest request) {
        String sortBy = request.getSortBy();
        boolean isAsc = "asc".equalsIgnoreCase(request.getSortDirection());
        SortOrder order = isAsc ? SortOrder.Asc : SortOrder.Desc;

        if (!StringUtils.hasText(sortBy) || "relevance".equalsIgnoreCase(sortBy)) {
            // Default: sort by score
            builder.sort(s -> s.score(sc -> sc.order(SortOrder.Desc)));
        } else {
            String field = switch (sortBy.toLowerCase()) {
                case "price" -> "minPrice";
                case "sold" -> "soldCount";
                case "rating" -> "averageRating";
                case "newest" -> "createdAt";
                case "views" -> "viewCount";
                default -> sortBy;
            };

            builder.sort(s -> s.field(f -> f.field(field).order(order)));
        }

        // Secondary sort by score
        builder.sort(s -> s.score(sc -> sc.order(SortOrder.Desc)));
    }

    private void addAggregations(SearchRequest.Builder builder) {
        builder.aggregations("categories", a -> a
                .terms(t -> t.field("categoryId").size(20))
        );
        builder.aggregations("brands", a -> a
                .terms(t -> t.field("brandId").size(20))
        );
        builder.aggregations("stores", a -> a
                .terms(t -> t.field("storeId").size(20))
        );
        builder.aggregations("price_stats", a -> a
                .stats(s -> s.field("minPrice"))
        );
        builder.aggregations("price_ranges", a -> a
                .range(r -> r
                        .field("minPrice")
                        .ranges(
                                AggregationRange.of(ar -> ar.to("100000")),
                                AggregationRange.of(ar -> ar.from("100000").to("500000")),
                                AggregationRange.of(ar -> ar.from("500000").to("1000000")),
                                AggregationRange.of(ar -> ar.from("1000000").to("5000000")),
                                AggregationRange.of(ar -> ar.from("5000000"))
                        )
                )
        );
        builder.aggregations("rating_avg", a -> a
                .avg(avg -> avg.field("averageRating"))
        );
        // Nested aggregation for attributes
        builder.aggregations("attributes", a -> a
                .nested(n -> n.path("attributes"))
                .aggregations("attribute_names", agg -> agg
                        .terms(t -> t.field("attributes.attributeName.keyword").size(10))
                        .aggregations("attribute_values", vagg -> vagg
                                .terms(t -> t.field("attributes.value").size(20))
                        )
                )
        );
    }

    private ProductSearchResponse mapSearchResponse(
            SearchResponse<ProductDocument> response,
            Pageable pageable,
            ProductSearchRequest request) {

        HitsMetadata<ProductDocument> hitsMetadata = response.hits();
        long totalHits = hitsMetadata.total() != null ? hitsMetadata.total().value() : 0;

        // Map hits to response
        List<ProductSearchHit> hits = hitsMetadata.hits().stream()
                .map(this::mapHit)
                .collect(Collectors.toList());

        // Build response
        ProductSearchResponse.ProductSearchResponseBuilder builder = ProductSearchResponse.builder()
                .hits(hits)
                .totalHits(totalHits)
                .totalPages((int) Math.ceil((double) totalHits / pageable.getPageSize()))
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .took(response.took())
                .maxScore(hitsMetadata.maxScore() != null ? hitsMetadata.maxScore().floatValue() : null);

        // Map aggregations if present
        if (Boolean.TRUE.equals(request.getEnableAggregation()) && response.aggregations() != null) {
            builder.aggregations(mapAggregations(response.aggregations()));
        }

        return builder.build();
    }

    private ProductSearchHit mapHit(Hit<ProductDocument> hit) {
        ProductDocument doc = hit.source();
        if (doc == null) {
            return null;
        }

        // Map highlights
        Map<String, List<String>> highlights = new HashMap<>();
        if (hit.highlight() != null && !hit.highlight().isEmpty()) {
            highlights.putAll(hit.highlight());
        }

        return ProductSearchHit.builder()
                .id(hit.id())
                .score(hit.score() != null ? hit.score().floatValue() : null)
                .product(mapToSummary(doc))
                .highlights(highlights)
                .build();
    }

    private ProductSummaryResponse mapToSummary(ProductDocument doc) {
        return ProductSummaryResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .shortDescription(doc.getShortDescription())
                .thumbnailImage(doc.getThumbnailUrl())
                .minPrice(doc.getMinPrice())
                .maxPrice(doc.getMaxPrice())
                .soldCount(doc.getSoldCount())
                .averageRating(doc.getAverageRating())
                .ratingCount(doc.getRatingCount())
                .isActive(doc.isActive())
                .storeName(doc.getStoreName())
                .storeId(doc.getStoreId())
                .platformCategoryName(doc.getCategoryName())
                .brandName(doc.getBrandName())
                .createdAt(doc.getCreatedAt())
                .totalAvailableStock(doc.getTotalAvailableStock())
                .build();
    }

    private SearchAggregations mapAggregations(Map<String, Aggregate> aggs) {
        SearchAggregations.SearchAggregationsBuilder builder = SearchAggregations.builder();

        // Categories
        if (aggs.containsKey("categories")) {
            builder.categories(mapBucketAggregation(aggs.get("categories")));
        }

        // Brands
        if (aggs.containsKey("brands")) {
            builder.brands(mapBucketAggregation(aggs.get("brands")));
        }

        // Stores
        if (aggs.containsKey("stores")) {
            builder.stores(mapBucketAggregation(aggs.get("stores")));
        }

        // Price range
        if (aggs.containsKey("price_stats") && aggs.containsKey("price_ranges")) {
            builder.priceRange(mapPriceAggregation(
                    aggs.get("price_stats"),
                    aggs.get("price_ranges")
            ));
        }

        return builder.build();
    }

    private List<BucketAggregation> mapBucketAggregation(Aggregate aggregate) {
        if (!aggregate.isSterms()) {
            return Collections.emptyList();
        }

        return aggregate.sterms().buckets().array().stream()
                .map(bucket -> BucketAggregation.builder()
                        .key(bucket.key().stringValue())
                        .label(bucket.key().stringValue())  // Could be enriched with actual names
                        .docCount(bucket.docCount())
                        .build())
                .collect(Collectors.toList());
    }

    private PriceRangeAggregation mapPriceAggregation(Aggregate stats, Aggregate ranges) {
        PriceRangeAggregation.PriceRangeAggregationBuilder builder = PriceRangeAggregation.builder();

        if (stats.isStats()) {
            StatsAggregate statsAgg = stats.stats();
            builder.min(statsAgg.min())
                    .max(statsAgg.max())
                    .avg(statsAgg.avg());
        }

        if (ranges.isRange()) {
            List<PriceRangeAggregation.PriceRangeBucket> buckets = ranges.range().buckets().array().stream()
                    .map(bucket -> PriceRangeAggregation.PriceRangeBucket.builder()
                            .from(bucket.from())
                            .to(bucket.to())
                            .docCount(bucket.docCount())
                            .build())
                    .collect(Collectors.toList());
            builder.buckets(buckets);
        }

        return builder.build();
    }
}
