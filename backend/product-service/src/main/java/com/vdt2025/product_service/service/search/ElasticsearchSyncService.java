package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.document.ProductDocument;
import com.vdt2025.product_service.document.StoreDocument;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.repository.StoreRepository;
import com.vdt2025.product_service.repository.elasticsearch.ProductSearchRepository;
import com.vdt2025.product_service.repository.elasticsearch.StoreSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
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
    
    // Store sync dependencies
    StoreRepository storeRepository;
    StoreSearchRepository storeSearchRepository;
    StoreIndexMapper storeIndexMapper;

    @Autowired
    @Lazy
    @NonFinal
    ElasticsearchSyncService self;

    AtomicBoolean isSyncing = new AtomicBoolean(false);
    static final int BATCH_SIZE = 50; // Smaller batch size to avoid memory issues

    /**
     * Auto-sync khi application khởi động - LUÔN reindex để đảm bảo dữ liệu mới nhất
     */
    @EventListener(ApplicationReadyEvent.class)
    @Async("elasticsearchTaskExecutor")
    public void onApplicationReady() {
        // Check if Elasticsearch is healthy
        if (!productSearchService.isHealthy()) {
            log.warn("Elasticsearch is not available. Skipping initial sync.");
            return;
        }

        log.info("Application started. Starting automatic Elasticsearch reindex...");
        
        // Luôn reindex products khi khởi động
        reindexProductsOnStartup();
        
        // Luôn reindex stores khi khởi động
        reindexStoresOnStartup();
    }
    
    /**
     * Reindex products on startup - luôn thực hiện để đảm bảo dữ liệu mới nhất
     */
    private void reindexProductsOnStartup() {
        long dbCount = productRepository.count();
        log.info("Starting product reindex. Database has {} products", dbCount);
        
        if (dbCount > 0) {
            syncAll();
        } else {
            log.info("No products in database. Skipping product reindex.");
        }
    }
    
    /**
     * Reindex stores on startup - luôn thực hiện để đảm bảo dữ liệu mới nhất
     */
    private void reindexStoresOnStartup() {
        long storeDbCount = storeRepository.count();
        log.info("Starting store reindex. Database has {} stores", storeDbCount);
        
        if (storeDbCount > 0) {
            syncAllStoresInternal();
        } else {
            log.info("No stores in database. Skipping store reindex.");
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
     * Note: Không dùng @Transactional ở đây vì method này là async
     * Thay vào đó, gọi đến method có transaction riêng
     */
    @Async("elasticsearchTaskExecutor")
    public void syncAll() {
        if (isSyncing.compareAndSet(false, true)) {
            try {
                log.info("Starting full Elasticsearch sync...");
                long startTime = System.currentTimeMillis();

                // Clear existing index
                productSearchRepository.deleteAll();
                log.info("Cleared existing index");

                // Sync in batches using transactional method
                int page = 0;
                long totalSynced = 0;

                while (true) {
                    List<ProductDocument> documents = self.fetchAndMapProductsBatch(page, BATCH_SIZE);

                    if (documents.isEmpty()) {
                        break;
                    }

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
     * Fetch và map products trong transaction riêng
     * Đảm bảo Hibernate session còn mở khi access lazy relations
     */
    @Transactional(readOnly = true)
    public List<ProductDocument> fetchAndMapProductsBatch(int page, int size) {
        Page<Product> productPage = productRepository.findAllForElasticsearchSync(PageRequest.of(page, size));
        
        if (productPage.isEmpty()) {
            return List.of();
        }

        return productPage.getContent().stream()
                .map(productIndexMapper::toDocument)
                .collect(Collectors.toList());
    }

    /**
     * Sync một product cụ thể
     */
    public void syncProduct(String productId) {
        try {
            ProductDocument document = self.fetchAndMapSingleProduct(productId);
            if (document != null) {
                productSearchRepository.save(document);
                log.debug("Synced product {} to index", productId);
            } else {
                // Product not found or deleted, remove from index
                productSearchRepository.deleteById(productId);
                log.debug("Product {} removed from index (not found or deleted)", productId);
            }
        } catch (Exception e) {
            log.error("Error syncing product {}: {}", productId, e.getMessage());
        }
    }

    /**
     * Fetch và map single product trong transaction
     */
    @Transactional(readOnly = true)
    public ProductDocument fetchAndMapSingleProduct(String productId) {
        return productRepository.findByIdForElasticsearch(productId)
                .filter(p -> !p.isDeleted())
                .map(productIndexMapper::toDocument)
                .orElse(null);
    }

    /**
     * Sync nhiều products
     */
    @Async("elasticsearchTaskExecutor")
    public void syncProducts(List<String> productIds) {
        log.info("Syncing {} products to Elasticsearch", productIds.size());

        List<ProductDocument> documents = self.fetchAndMapProducts(productIds);
        
        if (!documents.isEmpty()) {
            productSearchRepository.saveAll(documents);
        }

        // Remove products not in documents from index
        List<String> indexedIds = documents.stream()
                .map(ProductDocument::getId)
                .collect(Collectors.toList());
        
        List<String> toRemove = productIds.stream()
                .filter(id -> !indexedIds.contains(id))
                .collect(Collectors.toList());

        for (String id : toRemove) {
            productSearchRepository.deleteById(id);
        }

        log.info("Synced {} products, removed {} from index", documents.size(), toRemove.size());
    }

    /**
     * Fetch và map multiple products trong transaction
     */
    @Transactional(readOnly = true)
    public List<ProductDocument> fetchAndMapProducts(List<String> productIds) {
        return productIds.stream()
                .map(id -> productRepository.findByIdForElasticsearch(id).orElse(null))
                .filter(p -> p != null && !p.isDeleted())
                .map(productIndexMapper::toDocument)
                .collect(Collectors.toList());
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
        long storeIndexCount = 0;
        try {
            indexCount = productSearchRepository.count();
            storeIndexCount = storeSearchRepository.count();
        } catch (Exception e) {
            log.warn("Could not get index count: {}", e.getMessage());
        }

        long dbCount = productRepository.count();
        long storeDbCount = storeRepository.count();
        long deletedCount = 0; // Would need custom query

        return new SyncStats(
                indexCount,
                dbCount,
                deletedCount,
                storeIndexCount,
                storeDbCount,
                isSyncing.get(),
                productSearchService.isHealthy()
        );
    }

    public record SyncStats(
            long indexedCount,
            long totalInDb,
            long deletedCount,
            long storeIndexedCount,
            long storeTotalInDb,
            boolean syncInProgress,
            boolean elasticsearchHealthy
    ) {}
    
    // ========== Store Sync Methods ==========
    
    /**
     * Full sync stores - reindex tất cả stores (public API)
     */
    @Async("elasticsearchTaskExecutor")
    public void syncAllStores() {
        syncAllStoresInternal();
    }
    
    /**
     * Internal method to sync all stores - có thể gọi từ startup hoặc API
     */
    private void syncAllStoresInternal() {
        if (isSyncing.compareAndSet(false, true)) {
            try {
                log.info("Starting full Elasticsearch store sync...");
                long startTime = System.currentTimeMillis();

                // Clear existing store index
                storeSearchRepository.deleteAll();
                log.info("Cleared existing store index");

                // Sync in batches
                int page = 0;
                long totalSynced = 0;

                while (true) {
                    List<StoreDocument> documents = self.fetchAndMapStoresBatch(page, BATCH_SIZE);

                    if (documents.isEmpty()) {
                        break;
                    }

                    storeSearchRepository.saveAll(documents);
                    totalSynced += documents.size();

                    log.debug("Synced store batch {} ({} stores)", page + 1, documents.size());
                    page++;
                }

                long duration = System.currentTimeMillis() - startTime;
                log.info("Full store sync completed. {} stores indexed in {} ms", totalSynced, duration);

            } catch (Exception e) {
                log.error("Error during full store sync: {}", e.getMessage(), e);
            } finally {
                isSyncing.set(false);
            }
        } else {
            log.warn("Sync already in progress. Store sync request ignored.");
        }
    }

    /**
     * Fetch và map stores trong transaction riêng
     */
    @Transactional(readOnly = true)
    public List<StoreDocument> fetchAndMapStoresBatch(int page, int size) {
        Page<Store> storePage = storeRepository.findAllByIsActiveTrue(PageRequest.of(page, size));
        
        if (storePage.isEmpty()) {
            return List.of();
        }

        return storePage.getContent().stream()
                .map(storeIndexMapper::toDocument)
                .collect(Collectors.toList());
    }

    /**
     * Sync một store cụ thể
     */
    public void syncStore(String storeId) {
        try {
            StoreDocument document = self.fetchAndMapSingleStore(storeId);
            if (document != null) {
                storeSearchRepository.save(document);
                log.debug("Synced store {} to index", storeId);
            } else {
                // Store not found or inactive, remove from index
                storeSearchRepository.deleteById(storeId);
                log.debug("Store {} removed from index (not found or inactive)", storeId);
            }
        } catch (Exception e) {
            log.error("Error syncing store {}: {}", storeId, e.getMessage());
        }
    }

    /**
     * Fetch và map single store trong transaction
     */
    @Transactional(readOnly = true)
    public StoreDocument fetchAndMapSingleStore(String storeId) {
        return storeRepository.findById(storeId)
                .filter(Store::isActive)
                .map(storeIndexMapper::toDocument)
                .orElse(null);
    }

    /**
     * Xóa store khỏi index
     */
    public void removeStoreFromIndex(String storeId) {
        try {
            storeSearchRepository.deleteById(storeId);
            log.debug("Removed store {} from index", storeId);
        } catch (Exception e) {
            log.error("Error removing store {} from index: {}", storeId, e.getMessage());
        }
    }
}
