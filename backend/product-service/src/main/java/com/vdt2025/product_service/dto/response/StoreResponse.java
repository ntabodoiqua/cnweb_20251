package com.vdt2025.product_service.dto.response;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
public class StoreResponse {
    String id;
    String sellerProfileId;
    String userId;
    String storeName;
    String storeDescription;
    String logoName;
    String bannerName;
    String contactEmail;
    String contactPhone;
    String shopAddress;
    Integer provinceId;
    Integer wardId;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
