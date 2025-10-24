package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;

public interface SellerProfileService {

    SellerProfileResponse createSellerProfile(SellerProfileCreationRequest request);
}
