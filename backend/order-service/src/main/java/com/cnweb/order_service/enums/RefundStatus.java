package com.cnweb.order_service.enums;

/**
 * Trạng thái hoàn tiền
 */
public enum RefundStatus {
    NONE,           // Chưa yêu cầu hoàn tiền
    PENDING,        // Đang chờ xử lý yêu cầu hoàn tiền
    PROCESSING,     // Đang xử lý hoàn tiền
    COMPLETED,      // Hoàn tiền thành công
    FAILED,         // Hoàn tiền thất bại
    REJECTED        // Yêu cầu hoàn tiền bị từ chối
}
