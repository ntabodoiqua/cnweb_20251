package com.vdt2025.product_service.event;

import com.vdt2025.common_dto.dto.ProductChangedMessage;
import com.vdt2025.product_service.service.search.ElasticsearchSyncService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener để xử lý các thay đổi của Product từ RabbitMQ
 * Tự động sync với Elasticsearch khi có thay đổi
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductChangedEventListener {

    ElasticsearchSyncService syncService;

    /**
     * Xử lý event khi Product được tạo mới
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PRODUCT_CREATED).name}")
    @Async("elasticsearchTaskExecutor")
    public void handleProductCreated(ProductChangedMessage message) {
        log.info("Handling PRODUCT_CREATED event: productId={}", message.getProductId());
        syncProductToElasticsearch(message.getProductId());
    }

    /**
     * Xử lý event khi Product được cập nhật
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PRODUCT_UPDATED).name}")
    @Async("elasticsearchTaskExecutor")
    public void handleProductUpdated(ProductChangedMessage message) {
        log.info("Handling PRODUCT_UPDATED event: productId={}", message.getProductId());
        syncProductToElasticsearch(message.getProductId());
    }

    /**
     * Xử lý event khi Product bị xóa
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PRODUCT_DELETED).name}")
    @Async("elasticsearchTaskExecutor")
    public void handleProductDeleted(ProductChangedMessage message) {
        log.info("Handling PRODUCT_DELETED event: productId={}", message.getProductId());
        removeProductFromElasticsearch(message.getProductId());
    }

    /**
     * Xử lý event khi trạng thái Product thay đổi
     */
    @RabbitListener(queues = "#{messageTypeQueues.get(T(com.vdt2025.common_dto.dto.MessageType).PRODUCT_STATUS_CHANGED).name}")
    @Async("elasticsearchTaskExecutor")
    public void handleProductStatusChanged(ProductChangedMessage message) {
        log.info("Handling PRODUCT_STATUS_CHANGED event: productId={}", message.getProductId());
        syncProductToElasticsearch(message.getProductId());
    }

    /**
     * Sync product với Elasticsearch
     */
    private void syncProductToElasticsearch(String productId) {
        try {
            syncService.syncProduct(productId);
            log.info("Product {} synced to Elasticsearch", productId);
        } catch (Exception e) {
            log.error("Error syncing product {} to Elasticsearch: {}", 
                    productId, e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến flow chính
        }
    }

    /**
     * Xóa product khỏi Elasticsearch
     */
    private void removeProductFromElasticsearch(String productId) {
        try {
            syncService.removeFromIndex(productId);
            log.info("Product {} removed from Elasticsearch", productId);
        } catch (Exception e) {
            log.error("Error removing product {} from Elasticsearch: {}", 
                    productId, e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến flow chính
        }
    }
}
