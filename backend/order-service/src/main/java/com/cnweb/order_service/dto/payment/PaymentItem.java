package com.cnweb.order_service.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentItem {

    @JsonProperty("itemid")
    private String itemId;

    @JsonProperty("itemname")
    private String itemName;

    @JsonProperty("itemprice")
    private Long itemPrice;

    @JsonProperty("itemquantity")
    private Integer itemQuantity;
}