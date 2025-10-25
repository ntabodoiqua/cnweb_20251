package com.cnweb2025.user_service.dto.request.seller;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerProfileUpdateRequest {
    String storeName;
    String storeDescription;
    String contactEmail;
    String contactPhone;
    String shopAddress;
    Integer wardId;
    Integer provinceId;
}
