package com.cnweb20251.message_service.entity;

import com.cnweb20251.message_service.enums.ParticipantType;
import lombok.*;

/**
 * Embedded document đại diện cho thông tin người tham gia trong cuộc hội thoại.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Participant {

    /**
     * Username của người dùng (dùng làm định danh chính).
     */
    private String username;

    /**
     * Tên hiển thị của người dùng.
     */
    private String displayName;

    /**
     * URL avatar của người dùng.
     */
    private String avatarUrl;

    /**
     * Loại người dùng (USER hoặc SELLER).
     */
    private ParticipantType type;

    /**
     * ID của shop (nếu là SELLER).
     */
    private String shopId;

    /**
     * Tên shop (nếu là SELLER).
     */
    private String shopName;
}
