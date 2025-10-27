package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

public interface SellerProfileService {

    SellerProfileResponse createSellerProfile(SellerProfileCreationRequest request);

    SellerProfileResponse getSellerProfileOfCurrentUser();

    Page<SellerProfileResponse> getAllSellerProfiles(Pageable pageable);

    String sendToReview(String sellerProfileId, Locale locale);

    String approveSellerProfile(String sellerProfileId, Locale locale);

    String rejectSellerProfile(String sellerProfileId, String reason, Locale locale);

    FileInfoResponse uploadSellerDocument(String sellerProfileId, MultipartFile file, Locale locale);

}
