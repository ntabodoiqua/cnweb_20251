package com.cnweb.order_service.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {
    
    private String appUser;
    
    private Long amount;
    
    private String description;
    
    private List<PaymentItem> items;
    
    private String bankCode;
    
    private Long expireDurationSeconds;
    
    private PaymentEmbedData embedData;
    
    private String title;
    
    private String phone;
    
    private String email;
    
    private String address;
    
    private String subAppId;
}
