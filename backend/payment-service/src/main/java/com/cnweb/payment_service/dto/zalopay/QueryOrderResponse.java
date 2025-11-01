package com.cnweb.payment_service.dto.zalopay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về cho client khi query order
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryOrderResponse {
    
    /**
     * Mã giao dịch nội bộ
     */
    private String appTransId;
    
    /**
     * Mã giao dịch ZaloPay
     */
    private Long zpTransId;
    
    /**
     * Trạng thái: SUCCESS, FAILED, PENDING, PROCESSING
     */
    private String status;
    
    /**
     * Thông báo
     */
    private String message;
    
    /**
     * Số tiền
     */
    private Long amount;
    
    /**
     * Số tiền giảm giá
     */
    private Long discountAmount;
    
    /**
     * Đang xử lý?
     */
    private Boolean isProcessing;
    
    /**
     * Mã lỗi chi tiết
     */
    private Integer errorCode;
}
