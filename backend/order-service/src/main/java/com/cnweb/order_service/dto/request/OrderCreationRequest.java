package com.cnweb.order_service.dto.request;

import com.cnweb.order_service.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * OrderCreationRequest - DTO cho việc tạo đơn hàng mới
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCreationRequest {

    @NotEmpty(message = "ORDER_ITEMS_REQUIRED")
    @Valid
    List<OrderItemRequest> items;

    // Thông tin người nhận
    @NotBlank(message = "RECEIVER_NAME_REQUIRED")
    @Size(max = 100, message = "RECEIVER_NAME_MAX_100")
    String receiverName;

    @NotBlank(message = "RECEIVER_PHONE_REQUIRED")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "INVALID_PHONE_FORMAT")
    String receiverPhone;

    @Email(message = "INVALID_EMAIL_FORMAT")
    String receiverEmail;

    // Địa chỉ giao hàng
    @NotBlank(message = "SHIPPING_ADDRESS_REQUIRED")
    String shippingAddress;

    @NotBlank(message = "SHIPPING_PROVINCE_REQUIRED")
    String shippingProvince;
    @NotBlank(message = "SHIPPING_WARD_REQUIRED")
    String shippingWard;

    // Phương thức thanh toán
    @NotNull(message = "PAYMENT_METHOD_REQUIRED")
    PaymentMethod paymentMethod;

    // Mã giảm giá (optional)
    String couponCode;

    // Ghi chú
    @Size(max = 1000, message = "NOTE_MAX_1000")
    String note;
}
