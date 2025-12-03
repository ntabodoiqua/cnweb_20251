package com.cnweb2025.user_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Request DTO cho việc lấy thông tin nhiều users theo batch
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BatchUsernamesRequest {
    List<String> usernames;
}
