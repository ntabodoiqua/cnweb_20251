package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.entity.Province;
import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.entity.Ward;
import com.cnweb2025.user_service.enums.VerificationStatus;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.SellerProfileMapper;
import com.cnweb2025.user_service.repository.ProvinceRepository;
import com.cnweb2025.user_service.repository.SellerProfileRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.repository.WardRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SellerProfileServiceImp implements SellerProfileService{
    SellerProfileRepository sellerProfileRepository;
    UserRepository userRepository;
    WardRepository wardRepository;
    ProvinceRepository provinceRepository;
    SellerProfileMapper sellerProfileMapper;


    @Override
    public SellerProfileResponse createSellerProfile(SellerProfileCreationRequest request) {
        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> {
                    log.error("Ward not found with ID: {}", request.getWardId());
                    return new AppException(ErrorCode.WARD_NOT_FOUND);
                });
        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> {
                    log.error("Province not found with ID: {}", request.getProvinceId());
                    return new AppException(ErrorCode.PROVINCE_NOT_FOUND);
                });
        // Kiểm tra xem ward có thuộc về province không
        if (!ward.getProvince().getId().equals(province.getId())) {
            log.error("Ward ID: {} does not belong to Province ID: {}", ward.getId(), province.getId());
            throw new AppException(ErrorCode.WARD_PROVINCE_MISMATCH);
        }
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var sellerProfile = sellerProfileMapper.toSellerProfile(request);
        sellerProfile.setUser(user);
        sellerProfile.setWard(ward);
        sellerProfile.setProvince(province);
        sellerProfile.setActive(false); // Mặc định là không active
        sellerProfile.setVerificationStatus(VerificationStatus.CREATED);
        var savedProfile = sellerProfileRepository.save(sellerProfile);
        log.info("Seller profile created for user: {}", username);
        return sellerProfileMapper.toAddressResponse(savedProfile);
    }
}
