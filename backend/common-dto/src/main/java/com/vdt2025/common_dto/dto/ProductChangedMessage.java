package com.vdt2025.common_dto.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Message DTO cho sự kiện Product thay đổi
 * Được publish qua RabbitMQ để các service khác consume
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductChangedMessage implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * ID của product bị thay đổi
     */
    private String productId;
    
    /**
     * Loại thay đổi: CREATED, UPDATED, DELETED, STATUS_CHANGED
     */
    private ChangeType changeType;
    
    /**
     * Thời điểm xảy ra thay đổi
     */
    private LocalDateTime timestamp;
    
    /**
     * Source service tạo ra event
     */
    private String source;
    
    public enum ChangeType {
        CREATED,
        UPDATED,
        DELETED,
        STATUS_CHANGED
    }
}
