package com.cnweb.order_service.dto.request;

import com.cnweb.order_service.enums.OrderStatus;
import com.cnweb.order_service.enums.PaymentStatus;
import com.cnweb.order_service.enums.RefundStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderFilterRequest {
    String search; // Search by orderNumber, receiverName, storeName
    OrderStatus status;
    PaymentStatus paymentStatus;
    RefundStatus refundStatus; // Filter by refund status (PENDING = waiting for return processing)

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime endDate;

    BigDecimal minAmount;
    BigDecimal maxAmount;
}