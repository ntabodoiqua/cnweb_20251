package com.cnweb.order_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Order payment request")
public class OrderPaymentRequest {

    @NotEmpty(message = "ORDER_IDS_REQUIRED")
    @Schema(description = "Danh sách ID đơn hàng cần thanh toán", example = "[\"ORD-123\", \"ORD-456\"]")
    private List<String> orderIds;

    @Min(value = 300, message = "EXPIRE_DURATION_INVALID")
    @Max(value = 2592000, message = "EXPIRE_DURATION_INVALID")
    @Schema(description = "Thời gian hết hạn thanh toán (giây). Mặc định: 900 giây (15 phút)", example = "900")
    private Long expireDurationSeconds;
}