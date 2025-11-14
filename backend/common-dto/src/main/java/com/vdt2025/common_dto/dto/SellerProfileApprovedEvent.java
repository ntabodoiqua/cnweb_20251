package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerProfileApprovedEvent {
    String sellerProfileId;
    String userName;
    String storeName;
    String storeDescription;
    String logoName;
    String bannerName;
    String contactEmail;
    String contactPhone;
    String shopAddress;
    Integer provinceId;
    Integer wardId;
    LocalDateTime approvedAt;
}
