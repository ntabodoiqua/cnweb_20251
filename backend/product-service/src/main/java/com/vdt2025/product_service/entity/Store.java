package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "stores")
@Entity
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "seller_profile_id", nullable = false, unique = true)
    String sellerProfileId;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "store_name", nullable = false)
    String storeName;

    @Column(name = "store_description")
    String storeDescription;

    @Column(name = "logo_name")
    String logoName;

    @Column(name = "banner_name")
    String bannerName;

    @Column(name = "contact_email", nullable = false)
    String contactEmail;

    @Column(name = "contact_phone", nullable = false)
    String contactPhone;

    @Column(name = "shop_address", nullable = false)
    String shopAddress;

    @Column(name = "province_id", nullable = false)
    Integer provinceId;

    @Column(name = "ward_id", nullable = false)
    Integer wardId;

    @Column(name = "is_active", nullable = false)
    boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;
}
