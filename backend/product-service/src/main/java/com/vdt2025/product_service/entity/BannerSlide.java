package com.vdt2025.product_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "banner_slides")
public class BannerSlide {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "image_name", nullable = false)
    String imageName;

    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    String imageUrl;

    @Column(name = "is_platform_banner", nullable = false)
    boolean isPlatformBanner;

    @Column(name = "store_id")
    String storeId;

    @Column(name = "display_order", nullable = false)
    Integer displayOrder;
}
