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

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    List<OrderItemRequest> items;

    // Thông tin người nhận
    @NotBlank(message = "Receiver name is required")
    @Size(max = 100, message = "Receiver name must not exceed 100 characters")
    String receiverName;

    @NotBlank(message = "Receiver phone is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Invalid phone number format")
    String receiverPhone;

    @Email(message = "Invalid email format")
    String receiverEmail;

    // Địa chỉ giao hàng
    @NotBlank(message = "Shipping address is required")
    String shippingAddress;

    String shippingProvince;
    String shippingDistrict;
    String shippingWard;

    // Phương thức thanh toán
    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod;

    // Mã giảm giá (optional)
    String couponCode;

    // Ghi chú
    @Size(max = 1000, message = "Note must not exceed 1000 characters")
    String note;
}
