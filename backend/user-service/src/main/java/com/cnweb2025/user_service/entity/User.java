package com.cnweb2025.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

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

    @Column(name = "password", nullable = false)
    String password;

    @Column(name = "first_name")
    String firstName;

    @Column(name = "last_name")
    String lastName;

    @Column(name = "dob")
    LocalDate dob;

    @Column(name = "email", unique = true, nullable = false)
    String email;

    @Column(name = "phone", unique = true)
    String phone;

    @Column(name = "avatar_name")
    String avatarName;

    @Column(name = "avatar_url", length = 1000)
    String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "enabled", nullable = false)
    boolean enabled; // Trạng thái tài khoản

    @Column(name = "is_verified", nullable = false)
    boolean isVerified; // Trạng thái xác thực email

    @ManyToMany
    @JoinTable(
            name = "user_role", // tên bảng trung gian
            joinColumns = @JoinColumn(name = "user_id"), // cột FK trỏ đến User
            inverseJoinColumns = @JoinColumn(name = "role_id") // cột FK trỏ đến Role
    )
    Set<Role> roles;

    // One-to-Many relationship with Address
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Address> addresses;

    // One to many relationship with SellerProfile
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<SellerProfile> sellerProfiles;

    public void setFullName(String s) {
        String[] parts = s.split(" ", 2);
        if (parts.length == 2) {
            this.firstName = parts[0];
            this.lastName = parts[1];
        } else if (parts.length == 1) {
            this.firstName = parts[0];
            this.lastName = "";
        } else {
            this.firstName = "";
            this.lastName = "";
        }
    }
}
