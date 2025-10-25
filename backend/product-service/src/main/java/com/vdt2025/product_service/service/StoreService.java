package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.SellerProfileApprovedEvent;
import com.vdt2025.product_service.entity.Store;

public interface StoreService {
    Store createStoreFromSellerProfile(SellerProfileApprovedEvent event);
}
