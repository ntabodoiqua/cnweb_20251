package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoreServiceImp implements StoreService {
    
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
        
        if (storeRepository.existsByUserId(event.getUserId())) {
            log.error("Store already exists for user ID: {}", event.getUserId());
            throw new AppException(ErrorCode.STORE_ALREADY_EXISTS);
        }
        
        // Tạo store mới từ thông tin seller profile
        Store store = Store.builder()
                .sellerProfileId(event.getSellerProfileId())
                .userId(event.getUserId())
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
}
