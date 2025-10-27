package com.vdt2025.common_dto.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerProfileRejectedEvent {
    String sellerProfileId;
    String userId;
    String storeName;
    String contactEmail;
    LocalDateTime rejectedAt;
    String rejectionReason;
}
