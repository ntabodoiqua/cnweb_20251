package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.StoreMapper;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoreServiceImp implements StoreService {
    private final StoreMapper storeMapper;

    StoreRepository storeRepository;
    
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
    @Transactional
    public void deactivateStoreBySellerProfileId(String sellerProfileId) {
        log.info("Deactivating store for seller profile ID: {}", sellerProfileId);
        Store store = storeRepository.findBySellerProfileId(sellerProfileId)
                .orElseThrow(() -> {
                    log.error("Store not found for seller profile ID: {}", sellerProfileId);
                    return new AppException(ErrorCode.STORE_NOT_FOUND);
                });
        
        store.setActive(false);
        storeRepository.save(store);
        log.info("Store with ID: {} deactivated successfully for seller profile ID: {}", 
                store.getId(), sellerProfileId);
    }
}
