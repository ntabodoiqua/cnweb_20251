package com.cnweb2025.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "wards")
@Entity
public class Ward {
    @Id
    @Column(name = "id", nullable = false)
    int id;

    // Mối quan hệ nhiều một với tinh/thành phố
    @ManyToOne
    @JoinColumn(name = "province_id", nullable = false)
    Province province;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "slug", nullable = false)
    String slug;

    @Column(name = "type", nullable = false)
    String type;

    @Column(name = "name_with_type", nullable = false)
    String nameWithType;

    @Column(name = "path", nullable = false)
    String path;

    @Column(name = "path_with_type", nullable = false)
    String pathWithType;
}
