package com.cnweb2025.user_service.dto.response;

import com.cnweb2025.user_service.enums.VerificationStatus;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerProfileResponse {
    String id;
    String storeName;
    String storeDescription;
    String logoName;
    String bannerName;
    String contactEmail;
    String contactPhone;
    String shopAddress;
    VerificationStatus verificationStatus;
    boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime approvedAt;
}
