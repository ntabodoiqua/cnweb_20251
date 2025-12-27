package com.vdt2025.common_dto.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHardDeletedEvent implements Serializable {
    private String userId;
    private String username;
    private LocalDateTime hardDeletedAt;
}

