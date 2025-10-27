package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileRejectionRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.service.SellerProfileService;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PatchMapping("/{sellerProfileId}/uploadDocument")
    public ApiResponse<FileInfoResponse> uploadSellerDocument(@PathVariable String sellerProfileId, MultipartFile file, Locale locale) {
        var result = sellerProfileService.uploadSellerDocument(sellerProfileId, file, locale);
        return ApiResponse.<FileInfoResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.document.uploaded", null, locale))
                .build();
    }

    @GetMapping("/{sellerProfileId}/document")
    public ApiResponse<FileInfoResponse> getSellerDocument(@PathVariable String sellerProfileId, Locale locale) {
        var sellerProfileResponse = sellerProfileService.getSellerProfileOfCurrentUser();
        var result = FileInfoResponse.builder()
                .fileName(sellerProfileResponse.getDocumentName())
                .uploadedAt(sellerProfileResponse.getDocumentUploadedAt())
                .build();
        return ApiResponse.<FileInfoResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.document.retrieved", null, locale))
                .build();
    }

    @PatchMapping("/{sellerProfileId}/sendToReview")
    public ApiResponse<String> sendToReviewSellerProfile(@PathVariable String sellerProfileId, Locale locale) {
        var result = sellerProfileService.sendToReview(sellerProfileId, locale);
        return ApiResponse.<String>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.sentToReview", null, locale))
                .build();
    }

    @PatchMapping("/{sellerProfileId}/approve")
    public ApiResponse<String> approveSellerProfile(@PathVariable String sellerProfileId, Locale locale) {
        var result = sellerProfileService.approveSellerProfile(sellerProfileId, locale);
        return ApiResponse.<String>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.approved", null, locale))
                .build();
    }

    @PatchMapping("/{sellerProfileId}/reject")
    public ApiResponse<String> rejectSellerProfile(@PathVariable String sellerProfileId,
                                                   @Valid @RequestBody SellerProfileRejectionRequest request,
                                                   Locale locale) {
        var result = sellerProfileService.rejectSellerProfile(sellerProfileId, request.getRejectionReason(), locale);
        return ApiResponse.<String>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.rejected", null, locale))
                .build();
    }

}
