package com.cnweb2025.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "provinces")
@Entity
public class Province {
    @Id
    @Column(name = "id", nullable = false)
    Integer id;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "name_slug", nullable = false)
    String nameSlug;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "type", nullable = false)
    String type;

    // Mối quan hệ 1 nhiều với Ward
    @OneToMany
    @JoinColumn(name = "province_id")
    Set<Ward> wards;
}
