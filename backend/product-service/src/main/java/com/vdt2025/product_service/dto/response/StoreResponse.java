package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoreResponse {
    String id;
    String sellerProfileId;
    String userName;
    String storeName;
    String storeDescription;
    String logoName;
    String logoUrl;
    String bannerName;
    String bannerUrl;
    String contactEmail;
    String contactPhone;
    String shopAddress;
    Integer provinceId;
    Integer wardId;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}