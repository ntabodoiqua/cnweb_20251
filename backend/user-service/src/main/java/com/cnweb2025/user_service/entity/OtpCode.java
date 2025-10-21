package com.cnweb2025.user_service.entity;

import com.cnweb2025.user_service.enums.OtpType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "otp_code")
@Entity
public class OtpCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "otp_code", nullable = false)
    String otpCode;

    @Column(name = "expiry_time", nullable = false)
    Long expiryTime;

    @Column(name = "type", nullable = false)
    OtpType type;
}
