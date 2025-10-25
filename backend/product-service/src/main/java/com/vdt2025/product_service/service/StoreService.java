package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.product_service.dto.response.StoreResponse;
import com.vdt2025.product_service.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StoreService {
    Store createStoreFromSellerProfile(SellerProfileApprovedEvent event);

    Page<StoreResponse> getAllStores(Pageable pageable);
}
