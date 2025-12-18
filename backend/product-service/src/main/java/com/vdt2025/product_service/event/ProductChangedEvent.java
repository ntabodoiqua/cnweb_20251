package com.vdt2025.product_service.event;

import lombok.*;

/**
 * Event khi Product được tạo, cập nhật, hoặc xóa
 * Được sử dụng để trigger sync với Elasticsearch
 */
@Getter
@Builder
@AllArgsConstructor
public class ProductChangedEvent {
    
    private final String productId;
    private final ChangeType changeType;
    
    public enum ChangeType {
        CREATED,
        UPDATED,
        DELETED,
        STATUS_CHANGED
    }
}
