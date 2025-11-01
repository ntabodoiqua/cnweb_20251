package com.cnweb2025.user_service.dto.response;

import com.cnweb2025.user_service.entity.Province;
import com.cnweb2025.user_service.entity.Ward;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressResponse {
    String id;
    String receiverName;
    String receiverPhone;
    String street;
    WardResponse ward;
    Boolean isDefault;
    String userId;
}
