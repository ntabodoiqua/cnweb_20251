package com.cnweb.order_service.client;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductInfoDTO implements Serializable {

    String id;
    String name;
    String shortDescription;
    String imageUrl;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    boolean isActive;
    boolean isDeleted;
    Integer totalStock;
}