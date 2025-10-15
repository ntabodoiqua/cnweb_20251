package com.vdt2025.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "users")
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true, nullable = false)
    String username;

    @Column(nullable = false)
    String password;
    String firstName;
    String lastName;
    LocalDate dob;

    @Column(unique = true, nullable = false)
    String email;

    @Column(unique = true, nullable = false)
    String phone;
    String avatarName;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    LocalDateTime updatedAt;

    @Column(nullable = false)
    boolean enabled; // Trạng thái tài khoản

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    Role role;
}
