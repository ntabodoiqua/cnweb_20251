package com.cnweb.order_service.dto.request;

import com.cnweb.order_service.enums.ReturnReason;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request DTO cho yêu cầu trả hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReturnOrderRequest {

    @NotNull(message = "Return reason is required")
    ReturnReason returnReason;

    @NotBlank(message = "Return description is required")
    @Size(max = 1000, message = "Return description must not exceed 1000 characters")
    String returnDescription;

    /**
     * Danh sách URL hình ảnh minh chứng (tùy chọn)
     */
    List<String> returnImages;
}