package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileUpdateRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

public interface SellerProfileService {

    SellerProfileResponse createSellerProfile(SellerProfileCreationRequest request);

    Page<SellerProfileResponse> getSellerProfileOfCurrentUser(Pageable pageable);

    SellerProfileResponse getSpecificSellerProfileOfCurrentUser(String sellerProfileId);

    Page<SellerProfileResponse> getAllSellerProfiles(Pageable pageable);

    SellerProfileResponse getSellerProfileById(String sellerProfileId);

    String sendToReview(String sellerProfileId, Locale locale);

    String approveSellerProfile(String sellerProfileId, Locale locale);

    String rejectSellerProfile(String sellerProfileId, String reason, Locale locale);

    FileInfoResponse uploadSellerDocument(String sellerProfileId, MultipartFile file, Locale locale);

    FileInfoResponse getTempLinkForSellerDocument(String sellerProfileId, Locale locale);

    SellerProfileResponse editSellerProfile(String sellerProfileId, SellerProfileUpdateRequest request);

    String deleteSellerProfileDocument(String sellerProfileId, Locale locale);

    String deactivateSellerProfile(String sellerProfileId, Locale locale);
}
