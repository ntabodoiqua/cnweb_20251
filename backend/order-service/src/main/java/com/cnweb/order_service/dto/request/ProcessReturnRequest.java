package com.cnweb.order_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO cho seller xử lý yêu cầu trả hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessReturnRequest {

    @NotNull(message = "Approval status is required")
    Boolean approved;

    @Size(max = 1000, message = "Rejection reason must not exceed 1000 characters")
    String rejectionReason;
}
