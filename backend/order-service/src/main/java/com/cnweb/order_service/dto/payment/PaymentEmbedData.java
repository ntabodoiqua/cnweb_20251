package com.cnweb.order_service.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentEmbedData {

    @JsonProperty("redirecturl")
    private String redirectUrl;

    @JsonProperty("merchantinfo")
    private String merchantInfo;

    @JsonProperty("promotioninfo")
    private String promotionInfo;

    @JsonProperty("columninfo")
    private String columnInfo;

    @JsonProperty("preferred_payment_method")
    private List<String> preferredPaymentMethod;

    @JsonProperty("zlppaymentid")
    private String zlpPaymentId;

    // Custom field to store order IDs
    @JsonProperty("order_ids")
    private List<String> orderIds;

    @JsonProperty("email")
    private String email;
}