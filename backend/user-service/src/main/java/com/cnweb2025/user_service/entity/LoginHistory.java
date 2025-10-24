package com.cnweb2025.user_service.entity;

import com.cnweb2025.user_service.enums.SigninStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "login_history")
@Entity
public class LoginHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "login_time", nullable = false)
    LocalDateTime loginTime;

    @Column(name = "ip_address")
    String ipAddress;

    @Column(name = "user_agent")
    String userAgent;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    SigninStatus status; // e.g., SUCCESS, FAILED
}
