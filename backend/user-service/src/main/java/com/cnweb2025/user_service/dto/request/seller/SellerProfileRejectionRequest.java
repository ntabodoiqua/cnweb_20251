package com.cnweb2025.user_service.dto.request.seller;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerProfileRejectionRequest {
    @NotBlank(message = "MISSING_REJECTION_REASON")
    String rejectionReason;
}
