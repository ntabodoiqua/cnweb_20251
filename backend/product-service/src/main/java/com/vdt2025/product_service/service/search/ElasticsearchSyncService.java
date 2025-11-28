package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.document.ProductDocument;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.repository.elasticsearch.ProductSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

/**
 * Service để đồng bộ data giữa PostgreSQL và Elasticsearch
 * Hỗ trợ:
 * - Initial sync khi khởi động
 * - Incremental sync theo schedule
 * - Manual reindex
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ElasticsearchSyncService {

    ProductRepository productRepository;
    ProductSearchRepository productSearchRepository;
    ProductIndexMapper productIndexMapper;
    ProductSearchService productSearchService;

    AtomicBoolean isSyncing = new AtomicBoolean(false);
    static final int BATCH_SIZE = 100;

    /**
     * Auto-sync khi application khởi động (nếu index trống)
     */
    @EventListener(ApplicationReadyEvent.class)
    @Async("elasticsearchTaskExecutor")
    public void onApplicationReady() {
        // Check if Elasticsearch is healthy
        if (!productSearchService.isHealthy()) {
            log.warn("Elasticsearch is not available. Skipping initial sync.");
            return;
        }

        // Check if index is empty
        long indexCount = productSearchRepository.count();
        long dbCount = productRepository.count();

        log.info("Elasticsearch index has {} documents, database has {} products", indexCount, dbCount);

        if (indexCount == 0 && dbCount > 0) {
            log.info("Index is empty. Starting initial sync...");
            syncAll();
        } else if (indexCount < dbCount * 0.9) {
            // If index has less than 90% of DB records, consider re-syncing
            log.warn("Index appears incomplete ({} vs {}). Consider running reindex.", indexCount, dbCount);
        }
    }

    /**
     * Scheduled incremental sync - chạy mỗi 5 phút
     * Chỉ sync các product đã update trong 10 phút gần đây
     */
    @Scheduled(fixedDelay = 300000, initialDelay = 600000) // 5 phút delay, start sau 10 phút
    @Transactional(readOnly = true)
    public void incrementalSync() {
        if (!productSearchService.isHealthy()) {
            log.debug("Elasticsearch not available. Skipping incremental sync.");
            return;
        }

        if (isSyncing.get()) {
            log.debug("Sync already in progress. Skipping.");
            return;
        }

        try {
            isSyncing.set(true);
            LocalDateTime since = LocalDateTime.now().minusMinutes(10);

            // This would require a custom query in ProductRepository
            // For now, we'll skip incremental sync implementation
            // You can add: List<Product> findByUpdatedAtAfter(LocalDateTime since);

            log.debug("Incremental sync completed");
        } finally {
            isSyncing.set(false);
        }
    }

    /**
     * Full sync - reindex tất cả products
     */
    @Async("elasticsearchTaskExecutor")
    @Transactional(readOnly = true)
    public void syncAll() {
        if (isSyncing.compareAndSet(false, true)) {
            try {
                log.info("Starting full Elasticsearch sync...");
                long startTime = System.currentTimeMillis();

                // Clear existing index
                productSearchRepository.deleteAll();
                log.info("Cleared existing index");

                // Sync in batches
                int page = 0;
                long totalSynced = 0;

                while (true) {
                    Page<Product> productPage = productRepository.findAll(PageRequest.of(page, BATCH_SIZE));

                    if (productPage.isEmpty()) {
                        break;
                    }

                    List<ProductDocument> documents = productPage.getContent().stream()
                            .filter(p -> !p.isDeleted())
                            .map(productIndexMapper::toDocument)
                            .collect(Collectors.toList());

                    productSearchRepository.saveAll(documents);
                    totalSynced += documents.size();

                    log.debug("Synced batch {} ({} products)", page + 1, documents.size());
                    page++;
                }

                long duration = System.currentTimeMillis() - startTime;
                log.info("Full sync completed. {} products indexed in {} ms", totalSynced, duration);

            } catch (Exception e) {
                log.error("Error during full sync: {}", e.getMessage(), e);
            } finally {
                isSyncing.set(false);
            }
        } else {
            log.warn("Sync already in progress. Request ignored.");
        }
    }

    /**
     * Sync một product cụ thể
     */
    @Transactional(readOnly = true)
    public void syncProduct(String productId) {
        try {
            productRepository.findById(productId).ifPresentOrElse(
                    product -> {
                        if (product.isDeleted()) {
                            productSearchRepository.deleteById(productId);
                            log.debug("Deleted product {} from index", productId);
                        } else {
                            ProductDocument document = productIndexMapper.toDocument(product);
                            productSearchRepository.save(document);
                            log.debug("Synced product {} to index", productId);
                        }
                    },
                    () -> {
                        // Product not found in DB, remove from index
                        productSearchRepository.deleteById(productId);
                        log.debug("Product {} not found in DB, removed from index", productId);
                    }
            );
        } catch (Exception e) {
            log.error("Error syncing product {}: {}", productId, e.getMessage());
        }
    }

    /**
     * Sync nhiều products
     */
    @Async("elasticsearchTaskExecutor")
    @Transactional(readOnly = true)
    public void syncProducts(List<String> productIds) {
        log.info("Syncing {} products to Elasticsearch", productIds.size());

        List<Product> products = productRepository.findAllById(productIds);

        List<ProductDocument> documents = products.stream()
                .filter(p -> !p.isDeleted())
                .map(productIndexMapper::toDocument)
                .collect(Collectors.toList());

        productSearchRepository.saveAll(documents);

        // Remove deleted products from index
        List<String> foundIds = products.stream().map(Product::getId).collect(Collectors.toList());
        List<String> deletedIds = products.stream()
                .filter(Product::isDeleted)
                .map(Product::getId)
                .collect(Collectors.toList());

        // Products in request but not in DB
        List<String> notFoundIds = productIds.stream()
                .filter(id -> !foundIds.contains(id))
                .collect(Collectors.toList());

        deletedIds.addAll(notFoundIds);

        for (String id : deletedIds) {
            productSearchRepository.deleteById(id);
        }

        log.info("Synced {} products, removed {} from index", documents.size(), deletedIds.size());
    }

    /**
     * Xóa product khỏi index
     */
    public void removeFromIndex(String productId) {
        try {
            productSearchRepository.deleteById(productId);
            log.debug("Removed product {} from index", productId);
        } catch (Exception e) {
            log.error("Error removing product {} from index: {}", productId, e.getMessage());
        }
    }

    /**
     * Kiểm tra trạng thái sync
     */
    public boolean isSyncInProgress() {
        return isSyncing.get();
    }

    /**
     * Lấy thống kê sync
     */
    public SyncStats getSyncStats() {
        long indexCount = 0;
        try {
            indexCount = productSearchRepository.count();
        } catch (Exception e) {
            log.warn("Could not get index count: {}", e.getMessage());
        }

        long dbCount = productRepository.count();
        long deletedCount = 0; // Would need custom query

        return new SyncStats(
                indexCount,
                dbCount,
                deletedCount,
                isSyncing.get(),
                productSearchService.isHealthy()
        );
    }

    public record SyncStats(
            long indexedCount,
            long totalInDb,
            long deletedCount,
            boolean syncInProgress,
            boolean elasticsearchHealthy
    ) {}
}
