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
    String userId;
    String storeName;
    String storeDescription;
    String logoName;
    String logoUrl;
    String bannerName;
    String bannerUrl;
    String contactEmail;
    String contactPhone;
    String shopAddress;
    VerificationStatus verificationStatus;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime approvedAt;
    WardResponse ward;
    LocalDateTime rejectedAt;
    String rejectionReason;
    String documentName;
    LocalDateTime documentUploadedAt;
}
