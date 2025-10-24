package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.response.AddressResponse;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.entity.Address;
import com.cnweb2025.user_service.entity.SellerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WardMapper.class})
public interface SellerProfileMapper {
    @Mapping(target = "ward", ignore = true)
    @Mapping(target = "province", ignore = true)
    SellerProfile toSellerProfile(SellerProfileCreationRequest request);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "active", target = "isActive")
    SellerProfileResponse toAddressResponse(SellerProfile sellerProfile);
}
