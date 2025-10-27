package com.cnweb2025.user_service.dto.request.seller;

import com.cnweb2025.user_service.entity.Province;
import com.cnweb2025.user_service.entity.Ward;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SellerProfileCreationRequest {

    @NotBlank(message = "MISSING_STORE_NAME")
    String storeName;

    @NotBlank(message = "MISSING_STORE_DESCRIPTION")
    String storeDescription;

    @NotBlank(message = "MISSING_STORE_CONTACT_EMAIL")
    String contactEmail;

    @NotBlank(message = "MISSING_STORE_PHONE")
    String contactPhone;

    @NotBlank(message = "MISSING_STORE_ADDRESS")
    String shopAddress;

    @NotNull(message = "MISSING_WARD_ID")
    Integer wardId;

    @NotNull(message = "MISSING_PROVINCE_ID")
    Integer provinceId;
}
