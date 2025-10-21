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
@Table(name = "address")
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "receiver_name", nullable = false)
    String receiverName;

    @Column(name = "receiver_phone", nullable = false)
    String receiverPhone;

    @Column(name = "street", nullable = false)
    String street;

    @Column(name = "ward", nullable = false)
    String ward;

    @Column(name = "province", nullable = false)
    String province;

    @Column(name = "is_default", nullable = false)
    boolean isDefault;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;
}
