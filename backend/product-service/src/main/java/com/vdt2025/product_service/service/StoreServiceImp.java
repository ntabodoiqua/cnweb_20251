package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.product_service.dto.request.store.StoreSimpleRequest;
import com.vdt2025.product_service.dto.response.PageCacheDTO;
import com.vdt2025.product_service.dto.response.StoreInternalResponse;
import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.dto.response.StoreSimpleResponse;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.StoreMapper;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoreServiceImp implements StoreService {
    private final StoreMapper storeMapper;

    StoreRepository storeRepository;
    UserServiceClient userServiceClient;
    FileServiceClient fileServiceClient;
    CacheEvictService cacheEvictService;
    
    @Override
    @Transactional
    public Store createStoreFromSellerProfile(SellerProfileApprovedEvent event) {
        log.info("Creating store for seller profile ID: {}", event.getSellerProfileId());
        
        // Kiểm tra xem store đã tồn tại chưa
        if (storeRepository.existsBySellerProfileId(event.getSellerProfileId())) {
            log.error("Store already exists for seller profile ID: {}", event.getSellerProfileId());
            throw new AppException(ErrorCode.STORE_ALREADY_EXISTS);
        }

        if (storeRepository.existsByUserName(event.getUserName())) {
            log.error("Store already exists for user ID: {}", event.getUserName());
            throw new AppException(ErrorCode.STORE_ALREADY_EXISTS);
        }
        
        // Tạo store mới từ thông tin seller profile
        Store store = Store.builder()
                .sellerProfileId(event.getSellerProfileId())
                .userName(event.getUserName())
                .storeName(event.getStoreName())
                .storeDescription(event.getStoreDescription())
                .logoName(event.getLogoName())
                .bannerName(event.getBannerName())
                .contactEmail(event.getContactEmail())
                .contactPhone(event.getContactPhone())
                .shopAddress(event.getShopAddress())
                .provinceId(event.getProvinceId())
                .wardId(event.getWardId())
                .isActive(true)
                .build();
        
        Store savedStore = storeRepository.save(store);
        log.info("Store created successfully with ID: {} for seller profile ID: {}", 
                savedStore.getId(), event.getSellerProfileId());
        return savedStore;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public Page<StoreResponse> getAllStores(Pageable pageable) {
        log.info("Fetching all stores for page: {}", pageable);
        try {
            return storeRepository.findAll(pageable).map(storeMapper::toStoreResponse);
        } catch (Exception e) {
            log.error("Failed to fetch stores for page: {}", pageable, e);
            throw new AppException(ErrorCode.STORE_FETCH_FAILED);
        }

    }

    @Override
    public Page<StoreSimpleResponse> getPublicStores(Pageable pageable) {
        log.info("Fetching public stores for page: {}", pageable);
        try {
            return storeRepository.findAllByIsActiveTrue(pageable).map(storeMapper::toStoreSimpleResponse);
        } catch (Exception e) {
            log.error("Failed to fetch public stores for page: {}", pageable, e);
            throw new AppException(ErrorCode.STORE_FETCH_FAILED);
        }
    }

    @Override
    public StoreSimpleResponse getPublicStoreById(String storeId) {
        log.info("Fetching public store by ID: {}", storeId);
        try {
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> {
                        log.error("Store not found with ID: {}", storeId);
                        return new AppException(ErrorCode.STORE_NOT_FOUND);
                    });
            
            // Chỉ trả về store đang hoạt động
            if (!store.isActive()) {
                log.error("Store is not active: {}", storeId);
                throw new AppException(ErrorCode.STORE_NOT_FOUND);
            }
            
            return storeMapper.toStoreSimpleResponse(store);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch public store by ID: {}", storeId, e);
            throw new AppException(ErrorCode.STORE_FETCH_FAILED);
        }
    }

    @Override
    public StoreInternalResponse getPublicStoreByIdInternal(String storeId) {
        log.info("Fetching public store (internal) by ID: {}", storeId);
        try {
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> {
                        log.error("Store not found with ID: {}", storeId);
                        return new AppException(ErrorCode.STORE_NOT_FOUND);
                    });

            // Chỉ trả về store đang hoạt động
            if (!store.isActive()) {
                log.error("Store is not active: {}", storeId);
                throw new AppException(ErrorCode.STORE_NOT_FOUND);
            }

            return storeMapper.toStoreInternalResponse(store);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch public store (internal) by ID: {}", storeId, e);
            throw new AppException(ErrorCode.STORE_FETCH_FAILED);
        }
    }

    @Override
    @Transactional
    public void deactivateStoreBySellerProfileId(String sellerProfileId) {
        log.info("Deactivating store for seller profile ID: {}", sellerProfileId);
        Store store = storeRepository.findBySellerProfileId(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Store not found for seller profile ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.STORE_NOT_FOUND);
                });
        if (isStoreOwnedByCurrentSeller(store.getId())) {
            log.error("Unauthorized attempt to deactivate store ID: {} by current seller", store.getId());
            throw new AppException(ErrorCode.UNAUTHORIZED_STORE_ACCESS);
        }
        store.setActive(false);
        cacheEvictService.evictUserStores(store.getUserName());
        storeRepository.save(store);
        log.info("Store with ID: {} deactivated successfully for seller profile ID: {}", 
                store.getId(), sellerProfileId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "storesOfCurrentSeller", allEntries = true)
    public void activateStoreById(String storeId) {
        log.info("Activating store with ID: {}", storeId);
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> {
                    log.error("Store not found with ID: {}", storeId);
                    return new AppException(ErrorCode.STORE_NOT_FOUND);
                });
        if (isStoreOwnedByCurrentSeller(store.getId())) {
            log.error("Unauthorized attempt to deactivate store ID: {} by current seller", store.getId());
            throw new AppException(ErrorCode.UNAUTHORIZED_STORE_ACCESS);
        }
        store.setActive(true);
        storeRepository.save(store);
        log.info("Store with ID: {} activated successfully", storeId);
    }

    @Override
    @Cacheable(
            value = "storesOfCurrentSeller",
            key = "T(org.springframework.security.core.context.SecurityContextHolder)"
                    + ".getContext().getAuthentication().getName()"
                    + " + '-' + #pageable.pageNumber + '-' + #pageable.pageSize"
    )
    public PageCacheDTO<StoreResponse> getStoresOfCurrentSeller(Pageable pageable) {
        log.info("Fetching stores for current seller with pagination: {}", pageable);

        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            // Gọi service user
            var userResponse = userServiceClient.getUserByUsername(username).getResult();

            // Lấy page từ DB
            Page<Store> page = storeRepository.findAllByUserName(username, pageable);

            // Map sang StoreResponse
            List<StoreResponse> content = page.map(storeMapper::toStoreResponse).getContent();

            // Trả về DTO có thể cache
            return new PageCacheDTO<>(
                    content,
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    page.getTotalElements()
            );

        } catch (Exception e) {
            log.error("Failed to fetch stores for current seller", e);
            throw new AppException(ErrorCode.STORE_FETCH_FAILED);
        }
    }

    @Override
    @Transactional
    public StoreResponse updateStoreBasicInfo(String storeId, StoreSimpleRequest request) {
        log.info("Updating basic info for store ID: {}", storeId);
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> {
                    log.error("Store not found with ID: {}", storeId);
                    return new AppException(ErrorCode.STORE_NOT_FOUND);
                });
        if (isStoreOwnedByCurrentSeller(store.getId())) {
            log.error("Unauthorized attempt to deactivate store ID: {} by current seller", store.getId());
            throw new AppException(ErrorCode.UNAUTHORIZED_STORE_ACCESS);
        }
        store.setStoreName(request.getStoreName() == null ? store.getStoreName() : request.getStoreName());
        store.setStoreDescription(request.getStoreDescription() == null ? store.getStoreDescription() : request.getStoreDescription());

        Store updatedStore = storeRepository.save(store);
        cacheEvictService.evictUserStores(store.getUserName());
        log.info("Store with ID: {} updated successfully", storeId);
        return storeMapper.toStoreResponse(updatedStore);
    }

    @Override
    @Transactional
    public StoreResponse updateStoreMedia(String storeId, Integer mediaType, MultipartFile file) {
        log.info("Updating media for store ID: {}, media type: {}", storeId, mediaType);
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> {
                    log.error("Store not found with ID: {}", storeId);
                    return new AppException(ErrorCode.STORE_NOT_FOUND);
                });
        if (file.isEmpty()) {
            log.error("Uploaded file is empty for store ID: {}", storeId);
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            log.error("Invalid file type: {} for store ID: {}", file.getContentType(), storeId);
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        if (isStoreOwnedByCurrentSeller(store.getId())) {
            log.error("Unauthorized attempt to deactivate store ID: {} by current seller", store.getId());
            throw new AppException(ErrorCode.UNAUTHORIZED_STORE_ACCESS);
        }
        try {
            if (mediaType == 1) { // Logo
                store.setLogoName(file.getOriginalFilename());
                FileInfoResponse response = fileServiceClient.uploadPublicFile(file).getResult();
                store.setLogoUrl(response.getFileUrl());
            } else if (mediaType == 2) { // Banner
                store.setBannerName(file.getOriginalFilename());
                FileInfoResponse response = fileServiceClient.uploadPublicFile(file).getResult();
                store.setBannerUrl(response.getFileUrl());
            } else {
                log.error("Invalid media type: {} for store ID: {}", mediaType, storeId);
                throw new AppException(ErrorCode.INVALID_MEDIA_TYPE);
            }

            Store updatedStore = storeRepository.save(store);
            log.info("Media updated successfully for store ID: {}", storeId);
            cacheEvictService.evictUserStores(store.getUserName());
            return storeMapper.toStoreResponse(updatedStore);
        } catch (Exception e) {
            log.error("Failed to update media for store ID: {}", storeId, e);
            throw new AppException(ErrorCode.STORE_MEDIA_UPDATE_FAILED);
        }
    }

    @Override
    public boolean validateStoreOwnership(String storeId, String username) {
        return storeRepository.existsByIdAndUserNameIgnoreCase(storeId, username);
    }

    @Override
    public String getStoreIdByUsername(String username) {
        return storeRepository.findByUserName(username)
                .map(Store::getId)
                .orElse(null);
    }

    @Override
    public String getOwnerUsernameByStoreId(String storeId) {
        return storeRepository.findById(storeId)
                .map(Store::getUserName)
                .orElse(null);
    }

    /**
     * Helper method để kiểm tra xem một cửa hàng có thuộc về người bán hiện tại hay không
     * @param storeId ID của cửa hàng
     * @return true nếu cửa hàng thuộc về người bán hiện tại, false nếu không
     */
    private boolean isStoreOwnedByCurrentSeller(String storeId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        return !storeRepository.existsByIdAndUserNameIgnoreCase(storeId, currentUsername);
    }
}
