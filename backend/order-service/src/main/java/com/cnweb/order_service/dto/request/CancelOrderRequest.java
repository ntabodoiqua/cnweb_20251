package com.cnweb.order_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CancelOrderRequest {

    @NotBlank(message = "CANCEL_REASON_REQUIRED")
    @Size(max = 500, message = "Cancel reason must not exceed 500 characters")
    String cancelReason;
}
