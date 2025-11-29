package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.product_service.dto.request.banner.BannerOrderUpdateRequest;
import com.vdt2025.product_service.dto.request.banner.BannerUpdateRequest;
import com.vdt2025.product_service.dto.response.BannerResponse;
import com.vdt2025.product_service.entity.BannerSlide;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.BannerSlideRepository;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BannerServiceImpl implements BannerService {
    FileServiceClient fileServiceClient;
    BannerSlideRepository bannerSlideRepository;
    StoreRepository storeRepository;

    // Định nghĩa constant cho các loại ảnh
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    private static final int MAX_PLATFORM_BANNERS = 10;
    private static final int MAX_STORE_BANNERS = 5;

    @Override
    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public BannerResponse createBanner(MultipartFile file, Integer displayOrder, String storeId) {
        log.info("Creating banner from file {}", file.getOriginalFilename());
        validateFile(file);
        
        // Kiểm tra số lượng banner
        if (storeId == null || storeId.isEmpty()) {
            log.info("Admin is creating banner for platform");
            if (!isAdmin()) {
                log.warn("Only admin can create platform banner");
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            // Kiểm tra số lượng banner platform
            long count = bannerSlideRepository.countByStoreIdIsNull();
            if (count >= MAX_PLATFORM_BANNERS) {
                throw new AppException(ErrorCode.MAX_BANNER_EXCEEDED);
            }
            if (bannerSlideRepository.existsByDisplayOrderAndStoreIdNull(displayOrder)) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
            }
        } else {
            log.info("Seller {} is creating banner for store {}", getCurrentUser(), storeId);
            checkSellerAuthorization(storeId);
            // Kiểm tra số lượng banner store
            long count = bannerSlideRepository.countByStoreId(storeId);
            if (count >= MAX_STORE_BANNERS) {
                throw new AppException(ErrorCode.MAX_BANNER_EXCEEDED);
            }
            if (bannerSlideRepository.existsByDisplayOrderAndStoreId(displayOrder, storeId)) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
            }
        }
        
        // Upload file lên file service
        var uploadResponse = fileServiceClient.uploadPublicFile(file).getResult();
        log.info("Banner image {} uploaded successfully with URL {}", file.getOriginalFilename(), uploadResponse.getFileUrl());
        
        // Lưu thông tin banner vào database
        var bannerSlide = bannerSlideRepository.save(
                BannerSlide.builder()
                        .imageName(file.getOriginalFilename())
                        .imageUrl(uploadResponse.getFileUrl())
                        .displayOrder(displayOrder)
                        .storeId(storeId != null && !storeId.isEmpty() ? storeId : null)
                        .isPlatformBanner(storeId == null || storeId.isEmpty())
                        .build()
        );
        log.info("Banner slide with ID {} saved successfully", bannerSlide.getId());
        
        return mapToBannerResponse(bannerSlide);
    }

    @Override
    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public BannerResponse updateBanner(String bannerId, BannerUpdateRequest request, MultipartFile file) {
        log.info("Updating banner with ID {}", bannerId);
        
        var banner = bannerSlideRepository.findById(bannerId)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_FOUND));
        
        // Kiểm tra quyền
        if (banner.getStoreId() == null) {
            // Banner platform - chỉ admin mới được sửa
            if (!isAdmin()) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            // Banner store - kiểm tra quyền seller
            checkSellerAuthorization(banner.getStoreId());
        }
        
        // Cập nhật displayOrder nếu có
        if (request.getDisplayOrder() != null && !request.getDisplayOrder().equals(banner.getDisplayOrder())) {
            // Kiểm tra displayOrder mới có bị trùng không
            if (banner.getStoreId() == null) {
                if (bannerSlideRepository.existsByDisplayOrderAndStoreIdNullAndIdNot(request.getDisplayOrder(), bannerId)) {
                    throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
                }
            } else {
                if (bannerSlideRepository.existsByDisplayOrderAndStoreIdAndIdNot(request.getDisplayOrder(), banner.getStoreId(), bannerId)) {
                    throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
                }
            }
            banner.setDisplayOrder(request.getDisplayOrder());
        }
        
        // Cập nhật ảnh nếu có file mới
        if (file != null && !file.isEmpty()) {
            validateFile(file);
            var uploadResponse = fileServiceClient.uploadPublicFile(file).getResult();
            banner.setImageName(file.getOriginalFilename());
            banner.setImageUrl(uploadResponse.getFileUrl());
            log.info("Banner image updated to {}", uploadResponse.getFileUrl());
        }
        
        var updatedBanner = bannerSlideRepository.save(banner);
        log.info("Banner with ID {} updated successfully", bannerId);
        
        return mapToBannerResponse(updatedBanner);
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getBannerById(String bannerId) {
        log.info("Getting banner with ID {}", bannerId);
        var banner = bannerSlideRepository.findById(bannerId)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_FOUND));
        return mapToBannerResponse(banner);
    }

    @Override
    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public void deleteBanner(String bannerId, String storeId) {
        log.info("Deleting banner with ID {}", bannerId);
        var bannerOpt = bannerSlideRepository.findById(bannerId);
        if (bannerOpt.isEmpty()) {
            log.warn("Banner with ID {} not found", bannerId);
            throw new AppException(ErrorCode.BANNER_NOT_FOUND);
        }
        var banner = bannerOpt.get();
        
        if (banner.getStoreId() == null) {
            log.info("Admin is deleting platform banner");
            if (!isAdmin()) {
                log.warn("Only admin can delete platform banner");
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            log.info("Seller {} is deleting banner for store {}", getCurrentUser(), banner.getStoreId());
            checkSellerAuthorization(banner.getStoreId());
        }
        
        bannerSlideRepository.deleteById(bannerId);
        log.info("Banner with ID {} deleted successfully", bannerId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "banners", allEntries = true)
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public void updateBannerDisplayOrder(List<BannerOrderUpdateRequest> bannerOrders) {
        if (bannerOrders == null || bannerOrders.isEmpty()) {
            return;
        }

        // 1. Lấy tất cả các ID từ request để query 1 lần
        Set<String> ids = bannerOrders.stream()
                .map(BannerOrderUpdateRequest::getBannerId)
                .collect(Collectors.toSet());

        // 2. Batch Select: Lấy tất cả banner lên cùng lúc (Chỉ tốn 1 query)
        List<BannerSlide> banners = bannerSlideRepository.findAllById(ids);

        // 3. Validate: Kiểm tra xem có ID nào không tồn tại không
        if (banners.size() != ids.size()) {
            Set<String> foundIds = banners.stream().map(BannerSlide::getId).collect(Collectors.toSet());
            List<String> missingIds = ids.stream().filter(id -> !foundIds.contains(id)).toList();
            log.error("Banners not found with IDs: {}", missingIds);
            throw new AppException(ErrorCode.BANNER_NOT_FOUND);
        }

        // 4. Kiểm tra quyền - tất cả banner phải thuộc cùng một store hoặc đều là platform banner
        String firstStoreId = banners.get(0).getStoreId();
        boolean allSameStore = banners.stream().allMatch(b -> Objects.equals(b.getStoreId(), firstStoreId));
        if (!allSameStore) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        if (firstStoreId == null) {
            if (!isAdmin()) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            checkSellerAuthorization(firstStoreId);
        }

        // 5. Map hóa danh sách banner để truy xuất O(1)
        Map<String, BannerSlide> bannerMap = banners.stream()
                .collect(Collectors.toMap(BannerSlide::getId, Function.identity()));

        // 6. Cập nhật dữ liệu trong Memory
        for (var request : bannerOrders) {
            BannerSlide banner = bannerMap.get(request.getBannerId());
            if (!Objects.equals(banner.getDisplayOrder(), request.getDisplayOrder())) {
                banner.setDisplayOrder(request.getDisplayOrder());
            }
        }

        // 7. Batch Update
        try {
            bannerSlideRepository.saveAll(banners);
        } catch (DataIntegrityViolationException e) {
            log.error("Display order conflict with existing data", e);
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION);
        }

        log.info("Updated display order for {} banners", banners.size());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "banners", key = "'all'")
    public List<BannerResponse> getAllBanners() {
        var banners = bannerSlideRepository.findAllByOrderByDisplayOrderAsc();
        return banners.stream().map(this::mapToBannerResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "banners", key = "'platform'")
    public List<BannerResponse> getPlatformBanners() {
        var banners = bannerSlideRepository.findAllByStoreIdIsNullOrderByDisplayOrderAsc();
        return banners.stream().map(this::mapToBannerResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "banners", key = "'store-' + #storeId")
    public List<BannerResponse> getStoreBanners(String storeId) {
        var banners = bannerSlideRepository.findAllByStoreIdOrderByDisplayOrderAsc(storeId);
        return banners.stream().map(this::mapToBannerResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('SELLER')")
    public List<BannerResponse> getMyStoreBanners(String storeId) {
        checkSellerAuthorization(storeId);
        var banners = bannerSlideRepository.findAllByStoreIdOrderByDisplayOrderAsc(storeId);
        return banners.stream().map(this::mapToBannerResponse).toList();
    }

    // Helper methods
    private String getCurrentUser() {
        var username = SecurityContextHolder.getContext().getAuthentication().getName();
        return username != null ? username : "Anonymous";
    }

    private boolean isAdmin() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
    }

    private void checkSellerAuthorization(String storeId) {
        var username = SecurityContextHolder.getContext().getAuthentication().getName();
        var store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getUserName().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private BannerResponse mapToBannerResponse(BannerSlide banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .imageName(banner.getImageName())
                .imageUrl(banner.getImageUrl())
                .displayOrder(banner.getDisplayOrder())
                .storeId(banner.getStoreId())
                .build();
    }
}
