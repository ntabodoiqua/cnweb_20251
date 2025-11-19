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
@Table(name = "inventory_stocks")
public class InventoryStock {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "product_variant_id", nullable = false, unique = true)
    ProductVariant productVariant;

    @Column(name = "quantity_on_hand", nullable = false)
    Integer quantityOnHand;

    @Column(name = "quantity_reserved", nullable = false)
    Integer quantityReserved;
}
