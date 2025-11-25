package com.cnweb.order_service.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponse {
    
    private String appTransId;
    
    private String orderUrl;
    
    private String zpTransToken;
    
    private String qrCode;
    
    private String status;
    
    private String message;
    
    private Integer errorCode;
}
