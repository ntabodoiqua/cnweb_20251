package com.cnweb2025.user_service.controller;

import com.cnweb2025.user_service.dto.ApiResponse;
import com.cnweb2025.user_service.dto.request.address.UserAddressCreationRequest;
import com.cnweb2025.user_service.dto.request.address.UserAddressUpdateRequest;
import com.cnweb2025.user_service.dto.response.AddressResponse;
import com.cnweb2025.user_service.service.AddressService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/address")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AddressController {
    AddressService addressService;

    @PostMapping
    public ApiResponse<AddressResponse> createAddress(@RequestBody @Valid UserAddressCreationRequest request) {
        AddressResponse addressResponse = addressService.createAddress(request);
        return ApiResponse.<AddressResponse>builder()
                .message("Address created successfully")
                .result(addressResponse)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> updateAddress(
            @RequestBody @Valid UserAddressUpdateRequest request,
            @PathVariable String id) {
        AddressResponse addressResponse = addressService.updateAddress(id, request);
        return ApiResponse.<AddressResponse>builder()
                .message("Address updated successfully")
                .result(addressResponse)
                .build();
    }


}
