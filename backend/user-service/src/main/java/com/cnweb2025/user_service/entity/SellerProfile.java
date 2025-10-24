package com.cnweb2025.user_service.entity;

import com.cnweb2025.user_service.enums.VerificationStatus;
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
@Table(name = "seller_profile")
@Entity
public class SellerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    User user;

    @Column(name = "store_name", nullable = false)
    String storeName;

    @Column(name = "store_description")
    String storeDescription;

    @Column(name = "logo_name")
    String logoName;

    @Column(name = "banner_name")
    String bannerName;

    @Column(name = "contact_email", nullable = false, unique = true)
    String contactEmail;

    @Column(name = "contact_phone", nullable = false, unique = true)
    String contactPhone;

    @Column(name = "shop_address", nullable = false)
    String shopAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id", nullable = false)
    Province province;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    Ward ward;

    @Column(name = "verification_status", nullable = false)
    @Enumerated(EnumType.STRING)
    VerificationStatus verificationStatus;

    @Column(name = "is_active", nullable = false)
    boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "approved_at")
    LocalDateTime approvedAt;
}
