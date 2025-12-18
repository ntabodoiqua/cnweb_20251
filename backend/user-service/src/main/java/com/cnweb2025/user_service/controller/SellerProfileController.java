package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileFilterRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileRejectionRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileUpdateRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.service.SellerProfileService;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
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
    public ApiResponse<Page<SellerProfileResponse>> getSellerProfileOfCurrentUser(Pageable pageable, Locale locale) {
        var result = sellerProfileService.getSellerProfileOfCurrentUser(pageable);
        return ApiResponse.<Page<SellerProfileResponse>>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.retrieved", null, locale))
                .build();
    }

    @GetMapping
    public ApiResponse<?> getAllSellerProfiles(
            @ModelAttribute SellerProfileFilterRequest filter,
            Pageable pageable,
            Locale locale) {
        var result = sellerProfileService.getAllSellerProfiles(filter, pageable);
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
        var sellerProfileResponse = sellerProfileService.getSpecificSellerProfileOfCurrentUser(sellerProfileId);
        var url = sellerProfileService.getTempLinkForSellerDocument(sellerProfileId, locale).getFileUrl();
        var result = FileInfoResponse.builder()
                .fileName(sellerProfileResponse.getDocumentName())
                .uploadedAt(sellerProfileResponse.getDocumentUploadedAt())
                .fileUrl(url)
                .build();
        return ApiResponse.<FileInfoResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.document.retrieved", null, locale))
                .build();
    }

    @GetMapping("/admin/{sellerProfileId}/document")
    public ApiResponse<FileInfoResponse> adminGetSellerDocument(@PathVariable String sellerProfileId, Locale locale) {
        var sellerProfileResponse = sellerProfileService.getSellerProfileById(sellerProfileId);
        var url = sellerProfileService.getTempLinkForSellerDocument(sellerProfileId, locale).getFileUrl();
        var result = FileInfoResponse.builder()
                .fileName(sellerProfileResponse.getDocumentName())
                .uploadedAt(sellerProfileResponse.getDocumentUploadedAt())
                .fileUrl(url)
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

    @PatchMapping("/{sellerProfileId}/deactivate")
    public ApiResponse<String> deactivateSellerProfile(@PathVariable String sellerProfileId, Locale locale) {
        var result = sellerProfileService.deactivateSellerProfile(sellerProfileId, locale);
        return ApiResponse.<String>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.deactivated", null, locale))
                .build();
    }

    @DeleteMapping("/{sellerProfileId}/document")
    public ApiResponse<String> deleteSellerProfileDocument(@PathVariable String sellerProfileId, Locale locale) {
        var result = sellerProfileService.deleteSellerProfileDocument(sellerProfileId, locale);
        return ApiResponse.<String>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.document.deleted", null, locale))
                .build();
    }

    @PutMapping("/{sellerProfileId}")
    public ApiResponse<SellerProfileResponse> editSellerProfile(@PathVariable String sellerProfileId,
                                                                @Valid @RequestBody SellerProfileUpdateRequest request,
                                                                Locale locale) {
        var result = sellerProfileService.editSellerProfile(sellerProfileId, request);
        return ApiResponse.<SellerProfileResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.sellerProfile.updated", null, locale))
                .build();
    }

}
