package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerStatisticResponse {
    Long totalCustomers;
    Long customerCancelledOrders;
    Long customerReturnedOrders;
    Long customerDeliveredOrders;

    private List<CustomerCountByTime> monthlyCustomerTrend;

    private List<CustomerSummary> topSpenders;
    private List<CustomerSummary> topBuyers;

    @Data
    public static class CustomerSummary {
        String username;
        String receiverName;
        String receiverEmail;
        String receiverPhone;
        BigDecimal totalSpent;
        Long totalOrders;
    }

    @Data
    public static class CustomerCountByTime {
        String timePeriod;
        Long customerCount;
    }
}

