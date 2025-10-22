package com.cnweb2025.user_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WardResponse {
    int id;
    ProvinceResponse province;
    String name;
    String slug;
    String type;
    String nameWithType;
    String path;
    String pathWithType;
}
