package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileFilterRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileUpdateRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.entity.*;
import com.cnweb2025.user_service.enums.VerificationStatus;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.SellerProfileMapper;
import com.cnweb2025.user_service.messaging.RabbitMQMessagePublisher;
import com.cnweb2025.user_service.repository.*;
import com.cnweb2025.user_service.specification.SellerProfileSpecification;
import com.vdt2025.common_dto.dto.MessageType;
import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.common_dto.dto.SellerProfileRejectedEvent;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.ProductServiceClient;
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
import org.springframework.web.multipart.MultipartFile;

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
    RoleRepository roleRepository;
    FileServiceClient fileServiceClient;
    ProductServiceClient productServiceClient;


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
        // Điều kiên: User chưa có seller profile hoặc các seller profiles trước đó bị từ chối
        if (sellerProfileRepository.existsByUserIdAndVerificationStatusNot(
                user.getId(), VerificationStatus.REJECTED)) {
            log.error("User: {} already has an active or pending seller profile", username);
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
        return sellerProfileMapper.toSellerResponse(savedProfile);
    }

    @Override
    public Page<SellerProfileResponse> getSellerProfileOfCurrentUser(Pageable pageable) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<SellerProfile> sellerProfiles = sellerProfileRepository.findAllByUserId(user.getId(), pageable);
        if (sellerProfiles.isEmpty()) {
            log.error("No seller profiles found for user: {}", username);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
        }

        log.info("Retrieved {} seller profiles for user: {}", sellerProfiles.getTotalElements(), username);

        return sellerProfiles.map(sellerProfileMapper::toSellerResponse);
    }

    @Override
    public SellerProfileResponse getSpecificSellerProfileOfCurrentUser(String sellerProfileId) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var sellerProfile = sellerProfileRepository.findByIdAndUserId(sellerProfileId, user.getId())
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {} for user: {}", sellerProfileId, username);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        log.info("Retrieved seller profile with ID: {} for user: {}", sellerProfileId, username);
        return sellerProfileMapper.toSellerResponse(sellerProfile);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<SellerProfileResponse> getAllSellerProfiles(Pageable pageable) {
        Page<SellerProfileResponse> profiles = sellerProfileRepository.findAll(pageable)
                .map(sellerProfileMapper::toSellerResponse);
        log.info("Retrieved all seller profiles, total: {}", profiles.getTotalElements());
        return profiles;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<SellerProfileResponse> getAllSellerProfiles(SellerProfileFilterRequest filter, Pageable pageable) {
        var specification = SellerProfileSpecification.withFilters(filter);
        Page<SellerProfileResponse> profiles = sellerProfileRepository.findAll(specification, pageable)
                .map(sellerProfileMapper::toSellerResponse);
        log.info("Retrieved filtered seller profiles, total: {}", profiles.getTotalElements());
        return profiles;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public SellerProfileResponse getSellerProfileById(String sellerProfileId) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        log.info("Retrieved seller profile with ID: {}", sellerProfileId);
        return sellerProfileMapper.toSellerResponse(sellerProfile);
    }

    @Override
    @Transactional
    public String sendToReview(String sellerProfileId, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        // Chỉ cho phép gửi hồ sơ nếu trạng thái hiện tại là CREATED
        if (sellerProfile.getVerificationStatus() != VerificationStatus.CREATED) {
            log.error("Seller profile with ID: {} is not in CREATED status", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_PENDING);
        }
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

        // thay đổi role của user thành SELLER
        User user = sellerProfile.getUser();
        Role sellerRole = roleRepository.findById("SELLER")
                .orElseThrow(() -> {
                    log.error("SELLER role not found in the system");
                    return new AppException(ErrorCode.ROLE_NOT_FOUND);
                });
        user.getRoles().add(sellerRole);
        userRepository.save(user);
        try {
            var savedProfile = sellerProfileRepository.save(sellerProfile);

            log.info("Seller profile with ID: {} approved successfully", sellerProfileId);

            // Tạo event để gửi sang product-service
            SellerProfileApprovedEvent event = SellerProfileApprovedEvent.builder()
                    .sellerProfileId(savedProfile.getId())
                    .userName(savedProfile.getUser().getUsername())
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

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public String rejectSellerProfile(String sellerProfileId, String reason, Locale locale) {
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
        sellerProfile.setVerificationStatus(VerificationStatus.REJECTED);
        sellerProfile.setRejectionReason(reason);
        sellerProfile.setRejectedAt(LocalDateTime.now());
        sellerProfileRepository.save(sellerProfile);
        try {
            // Gửi email thông báo từ chối
            SellerProfileRejectedEvent event = SellerProfileRejectedEvent.builder()
                    .sellerProfileId(sellerProfile.getId())
                    .userId(sellerProfile.getUser().getId())
                    .contactEmail(sellerProfile.getContactEmail())
                    .storeName(sellerProfile.getStoreName())
                    .rejectedAt(sellerProfile.getRejectedAt())
                    .rejectionReason(reason)
                    .build();
            // Publish message sang notification-service
            rabbitMQMessagePublisher.publish(MessageType.SELLER_PROFILE_REJECTED, event);
            log.info("Published SELLER_PROFILE_REJECTED event for seller profile ID: {}", sellerProfileId);
        } catch (Exception e) {
            log.error("Error publishing SELLER_PROFILE_REJECTED event for seller profile ID: {}: {}", sellerProfileId, e.getMessage());
            throw new AppException(ErrorCode.SELLER_PROFILE_REJECTION_NOTIFICATION_FAILED);
        }
        log.info("Seller profile with ID: {} rejected", sellerProfileId);
        return messageSource.getMessage("success.sellerProfile.rejected", null, locale);
    }

    // Upload tài liệu cho seller profile
    @Override
    @Transactional
    public FileInfoResponse uploadSellerDocument(String sellerProfileId, MultipartFile file, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        // Kiểm tra trạng thái hiện tại
        if (sellerProfile.getVerificationStatus() != VerificationStatus.CREATED) {
            log.error("Seller profile with ID: {} is not in PENDING status", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_EDITABLE);
        }
        // validate file type and size
        if (file.isEmpty() || file.getSize() == 0) {
            log.error("Uploaded file is empty for seller profile ID: {}", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_UPLOAD_DOCUMENT_EMPTY);
        }
        String contentType = file.getContentType();
        try {
            if (!contentType.equals("application/pdf")) {
                log.error("Invalid file type: {} for seller profile ID: {}", contentType, sellerProfileId);
                throw new AppException(ErrorCode.SELLER_PROFILE_UPLOAD_DOCUMENT_INVALID_TYPE);
            }
        } catch (Exception e) {
            log.error("Error validating file type for seller profile ID: {}: {}", sellerProfileId, e.getMessage());
            throw new AppException(ErrorCode.SELLER_PROFILE_UPLOAD_DOCUMENT_INVALID_TYPE);
        }
        // gọi đến dịch vụ upload file private
        try {
            var response = fileServiceClient.uploadPrivateFile(file);
            FileInfoResponse result = response.getResult();
            // Lưu tên file vào seller profile
            sellerProfile.setDocumentName(result.getFileName());
            sellerProfile.setDocumentUploadedAt(LocalDateTime.now());
            sellerProfileRepository.save(sellerProfile);
            return result;
        } catch (Exception e) {
            log.error("Error uploading document for seller profile ID: {}: {}", sellerProfileId, e.getMessage());
            throw new AppException(ErrorCode.SELLER_PROFILE_UPLOAD_DOCUMENT_FAILED);
        }
    }

    // Lấy link tài liệu của seller profile
    public FileInfoResponse getTempLinkForSellerDocument(String sellerProfileId, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        if (sellerProfile.getDocumentName() == null) {
            log.error("No document found for seller profile ID: {}", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_DOCUMENT_NOT_FOUND);
        }
        try {
            var response = fileServiceClient.viewPrivateFile(sellerProfile.getDocumentName(), 15); // link tồn tại trong 15 phút
            var fileUrl = response.getResult();
            return FileInfoResponse.builder()
                    .fileName(sellerProfile.getDocumentName())
                    .uploadedAt(sellerProfile.getDocumentUploadedAt())
                    .fileUrl(fileUrl)
                    .build();
        } catch (Exception e) {
            log.error("Error retrieving document link for seller profile ID: {}: {}", sellerProfileId, e.getMessage());
            throw new AppException(ErrorCode.SELLER_PROFILE_GET_DOCUMENT_LINK_FAILED);
        }
    }

    @Override
    @Transactional
    public SellerProfileResponse editSellerProfile(String sellerProfileId, SellerProfileUpdateRequest request) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        // Kiểm tra quyền: Chỉ chủ sở hữu hồ sơ mới được phép chỉnh sửa
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        if (!sellerProfile.getUser().getUsername().equals(username)) {
            log.error("User: {} is not the owner of seller profile ID: {}", username, sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
        }

        // Chỉ cho phép chỉnh sửa nếu trạng thái là CREATED
        if (sellerProfile.getVerificationStatus() != VerificationStatus.CREATED) {
            log.error("Seller profile with ID: {} is not in CREATED status", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_EDITABLE);
        }
        sellerProfileMapper.updateSellerProfile(sellerProfile, request);
        if (request.getProvinceId() != null) {
            Province province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> {
                        log.error("Province not found with ID: {}", request.getProvinceId());
                        return new AppException(ErrorCode.PROVINCE_NOT_FOUND);
                    });
            sellerProfile.setProvince(province);
        }
        if (request.getWardId() != null) {
            Ward ward = wardRepository.findById(request.getWardId())
                    .orElseThrow(() -> {
                        log.error("Ward not found with ID: {}", request.getWardId());
                        return new AppException(ErrorCode.WARD_NOT_FOUND);
                    });
            sellerProfile.setWard(ward);
        }
        // Kiểm tra xem ward có thuộc về province không
        if (!sellerProfile.getWard().getProvince().getId().equals(sellerProfile.getProvince().getId())) { // <-- Thêm ! và .getId()
            log.error("Ward ID: {} does not belong to Province ID: {}", sellerProfile.getWard().getId(), sellerProfile.getProvince().getId());
            throw new AppException(ErrorCode.WARD_PROVINCE_MISMATCH);
        }
        var updatedProfile = sellerProfileRepository.save(sellerProfile);
        log.info("Seller profile with ID: {} updated successfully", sellerProfileId);
        return sellerProfileMapper.toSellerResponse(updatedProfile);
    }

    @Override
    @Transactional
    public String deactivateSellerProfile(String sellerProfileId, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        // Kiểm tra quyền: Chỉ chủ sở hữu hồ sơ mới được phép hủy kích hoạt
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        if (!sellerProfile.getUser().getUsername().equals(username)) {
            log.error("User: {} is not the owner of seller profile ID: {}", username, sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
        }
        // Kiểm tra trạng thái hồ sơ: Chỉ cho phép hủy kích hoạt nếu trạng thái là VERIFIED
        if (sellerProfile.getVerificationStatus() != VerificationStatus.VERIFIED) {
            log.error("Seller profile with ID: {} is not in VERIFIED status", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_EDITABLE);
        }
        // Kểm tra hồ sơ đã được kích hoạt chưa
        if (!sellerProfile.isActive()) {
            log.error("Seller profile with ID: {} is already deactivated", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_EDITABLE);
        }

        try {
            // Gọi đến product-service để hủy kích hoạt store tương ứng với seller profile này
            productServiceClient.deactivateStore(sellerProfileId);
            log.info("Successfully deactivated store in product-service for seller profile ID: {}", sellerProfileId);
        } catch (Exception e) {
            log.error("Failed to deactivate store in product-service for seller profile ID: {}: {}",
                    sellerProfileId, e.getMessage());
            throw new AppException(ErrorCode.STORE_DEACTIVATION_FAILED);
        }

        sellerProfile.setActive(false);
        sellerProfileRepository.save(sellerProfile);
        log.info("Seller profile with ID: {} deactivated by user: {}", sellerProfileId, username);
        return messageSource.getMessage("success.sellerProfile.deactivated", null, locale);
    }

    @Override
    @Transactional
    public String deleteSellerProfileDocument(String sellerProfileId, Locale locale) {
        var sellerProfile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Seller profile not found with ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
                });
        // Kiểm tra quyền: Chỉ chủ sở hữu hồ sơ mới được phép xóa tài liệu
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        if (!sellerProfile.getUser().getUsername().equals(username)) {
            log.error("User: {} is not the owner of seller profile ID: {}", username, sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_FOUND);
        }

        // Chỉ cho phép xóa tài liệu nếu trạng thái là CREATED
        if (sellerProfile.getVerificationStatus() != VerificationStatus.CREATED) {
            log.error("Seller profile with ID: {} is not in CREATED status", sellerProfileId);
            throw new AppException(ErrorCode.SELLER_PROFILE_NOT_EDITABLE);
        }
        sellerProfile.setDocumentName(null);
        sellerProfile.setDocumentUploadedAt(null);
        sellerProfileRepository.save(sellerProfile);
        log.info("Document deleted for seller profile ID: {} by user: {}", sellerProfileId, username);
        return messageSource.getMessage("success.sellerProfile.document.deleted", null, locale);
    }
}
