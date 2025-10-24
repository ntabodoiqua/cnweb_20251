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
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/seller-profiles")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SellerProfileController {
    SellerProfileService sellerProfileService;
    MessageSource messageSource;

    @PostMapping
    public ApiResponse<SellerProfileResponse> createSellerProfile(@Valid @RequestBody SellerProfileCreationRequest request, Locale locale) {
        var result = sellerProfileService.createSellerProfile(request);
        return ApiResponse.<SellerProfileResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.created", null, locale))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<SellerProfileResponse> getSellerProfileOfCurrentUser(Locale locale) {
        var result = sellerProfileService.getSellerProfileOfCurrentUser();
        return ApiResponse.<SellerProfileResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.retrieved", null, locale))
                .build();
    }

    @GetMapping
    public ApiResponse<?> getAllSellerProfiles(Pageable pageable, Locale locale) {
        var result = sellerProfileService.getAllSellerProfiles(pageable);
        return ApiResponse.builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfiles.retrieved", null, locale))
                .build();
    }


}
