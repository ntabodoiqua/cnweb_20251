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
import com.cnweb2025.user_service.messaging.RabbitMQMessagePublisher;
import com.cnweb2025.user_service.repository.ProvinceRepository;
import com.cnweb2025.user_service.repository.SellerProfileRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.repository.WardRepository;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

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
    MessageSource messageSource;
    RabbitMQMessagePublisher rabbitMQMessagePublisher;


    @Override
    @Transactional
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
        // Kiểm tra xem user đã có seller profile chưa
        if (sellerProfileRepository.existsByUserId(user.getId())) {
            log.error("Seller profile already exists for user: {}", username);
            throw new AppException(ErrorCode.SELLER_PROFILE_ALREADY_EXISTS);
        }
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

    @Override
    public SellerProfileResponse getSellerProfileOfCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var sellerProfile = sellerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> {
                    log.error("Seller profile not found for user: {}", username);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        log.info("Retrieved seller profile for user: {}", username);
        return sellerProfileMapper.toAddressResponse(sellerProfile);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<SellerProfileResponse> getAllSellerProfiles(Pageable pageable) {
        Page<SellerProfileResponse> profiles = sellerProfileRepository.findAll(pageable)
                .map(sellerProfileMapper::toAddressResponse);
        log.info("Retrieved all seller profiles, total: {}", profiles.getTotalElements());
        return profiles;
    }

    @Override
    @Transactional
    public String sendToReview(String sellerProfileId, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        sellerProfile.setVerificationStatus(VerificationStatus.PENDING);
        sellerProfileRepository.save(sellerProfile);
        log.info("Seller profile with ID: {} sent for review", sellerProfileId);
        return messageSource.getMessage("success.sellerProfile.sentForReview", null, locale);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String approveSellerProfile(String sellerProfileId, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        
        // Kiểm tra trạng thái hiện tại
        if (sellerProfile.getVerificationStatus() != VerificationStatus.PENDING) {
            log.error("Seller profile with ID: {} is not in PENDING status", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_PENDING);
        }
        
        // Cập nhật trạng thái thành APPROVED
        sellerProfile.setVerificationStatus(VerificationStatus.VERIFIED);
        sellerProfile.setActive(true);
        sellerProfile.setApprovedAt(LocalDateTime.now());
        try {
            var savedProfile = sellerProfileRepository.save(sellerProfile);

            log.info("Seller profile with ID: {} approved successfully", sellerProfileId);

            // Tạo event để gửi sang product-service
            SellerProfileApprovedEvent event = SellerProfileApprovedEvent.builder()
                    .sellerProfileId(savedProfile.getId())
                    .userId(savedProfile.getUser().getId())
                    .storeName(savedProfile.getStoreName())
                    .storeDescription(savedProfile.getStoreDescription())
                    .logoName(savedProfile.getLogoName())
                    .bannerName(savedProfile.getBannerName())
                    .contactEmail(savedProfile.getContactEmail())
                    .contactPhone(savedProfile.getContactPhone())
                    .shopAddress(savedProfile.getShopAddress())
                    .provinceId(savedProfile.getProvince().getId())
                    .wardId(savedProfile.getWard().getId())
                    .approvedAt(savedProfile.getApprovedAt())
                    .build();

            // Publish message sang product-service
            rabbitMQMessagePublisher.publish(MessageType.SELLER_PROFILE_APPROVED, event);
            log.info("Published SELLER_PROFILE_APPROVED event for seller profile ID: {}", sellerProfileId);

            return messageSource.getMessage("success.sellerProfile.approved", null, locale);
        } catch (Exception e) {
            log.error("Error approving seller profile with ID: {}: {}", sellerProfileId, e.getMessage());
            throw new AppException(ErrorCode.SELLER_PROFILE_APPROVAL_FAILED);
        }
    }
}
