package com.cnweb2025.user_service.dto.response;

import com.cnweb2025.user_service.entity.Ward;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProvinceResponse {
    int id;
    String name;
    String nameSlug;
    String fullName;
    String type;
}
