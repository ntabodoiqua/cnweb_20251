package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.service.SellerProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/seller-profiles")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SellerProfileController {
    SellerProfileService sellerProfileService;

    @PostMapping
    public ApiResponse<SellerProfileResponse> createSellerProfile(@Valid @RequestBody SellerProfileCreationRequest request) {
        var result = sellerProfileService.createSellerProfile(request);
        return ApiResponse.<SellerProfileResponse>builder()
                .result(result)
                .message("success.sellerProfile.created")
                .build();
    }
}
