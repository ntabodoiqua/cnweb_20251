package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.address.UserAddressCreationRequest;
import com.cnweb2025.user_service.dto.request.address.UserAddressUpdateRequest;
import com.cnweb2025.user_service.dto.response.AddressResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AddressService {

    AddressResponse createAddress(UserAddressCreationRequest request);

    AddressResponse updateAddress(String id, UserAddressUpdateRequest request);

    Page<AddressResponse> findAllAddressesOfUser(Pageable pageable);

    String deleteAddress(String id);
}
