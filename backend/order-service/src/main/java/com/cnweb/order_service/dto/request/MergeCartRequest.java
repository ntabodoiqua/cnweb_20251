package com.cnweb.order_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MergeCartRequest {

    @NotBlank(message = "GUESS_SESSION_ID_REQUIRED")
    String guestSessionId;
}
