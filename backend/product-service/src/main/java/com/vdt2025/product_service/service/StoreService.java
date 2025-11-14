package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.product_service.dto.request.store.StoreSimpleRequest;
import com.vdt2025.product_service.dto.response.PageCacheDTO;
import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface StoreService {
    Store createStoreFromSellerProfile(SellerProfileApprovedEvent event);

    Page<StoreResponse> getAllStores(Pageable pageable);

    void deactivateStoreBySellerProfileId(String sellerProfileId);

    PageCacheDTO<StoreResponse> getStoresOfCurrentSeller(Pageable pageable);

    StoreResponse updateStoreBasicInfo(String storeId, StoreSimpleRequest request);

    StoreResponse updateStoreMedia(String storeId, Integer mediaType, MultipartFile file);

    void activateStoreById(String storeId);
}
