package com.cnweb.order_service.enums;

/**
 * Lý do trả hàng
 */
public enum ReturnReason {
    DAMAGED,            // Sản phẩm bị hư hỏng
    DEFECTIVE,          // Sản phẩm lỗi
    WRONG_ITEM,         // Giao sai sản phẩm
    NOT_AS_DESCRIBED,   // Sản phẩm không đúng mô tả
    CHANGED_MIND,       // Đổi ý không muốn mua nữa
    SIZE_NOT_FIT,       // Kích cỡ không phù hợp
    QUALITY_ISSUE,      // Vấn đề về chất lượng
    OTHER               // Lý do khác
}
