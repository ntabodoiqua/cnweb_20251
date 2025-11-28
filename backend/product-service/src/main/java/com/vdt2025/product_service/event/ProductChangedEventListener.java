package com.vdt2025.product_service.event;

import com.vdt2025.product_service.service.search.ElasticsearchSyncService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener để xử lý các thay đổi của Product
 * Tự động sync với Elasticsearch khi có thay đổi
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductChangedEventListener {

    ElasticsearchSyncService syncService;

    /**
     * Xử lý event khi Product thay đổi
     * Async để không block main thread
     */
    @EventListener
    @Async("elasticsearchTaskExecutor")
    public void handleProductChanged(ProductChangedEvent event) {
        log.debug("Handling ProductChangedEvent: productId={}, type={}", 
                event.getProductId(), event.getChangeType());

        try {
            switch (event.getChangeType()) {
                case CREATED, UPDATED, STATUS_CHANGED -> {
                    syncService.syncProduct(event.getProductId());
                    log.debug("Product {} synced to Elasticsearch", event.getProductId());
                }
                case DELETED -> {
                    syncService.removeFromIndex(event.getProductId());
                    log.debug("Product {} removed from Elasticsearch", event.getProductId());
                }
            }
        } catch (Exception e) {
            log.error("Error handling ProductChangedEvent for product {}: {}", 
                    event.getProductId(), e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến flow chính
        }
    }
}
