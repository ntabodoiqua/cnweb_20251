package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileCreationRequest;
import com.cnweb2025.user_service.dto.request.seller.SellerProfileUpdateRequest;
import com.cnweb2025.user_service.dto.response.SellerProfileResponse;
import com.cnweb2025.user_service.entity.Address;
import com.cnweb2025.user_service.entity.SellerProfile;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {WardMapper.class})
public interface SellerProfileMapper {
    @Mapping(target = "ward", ignore = true)
    @Mapping(target = "province", ignore = true)
    SellerProfile toSellerProfile(SellerProfileCreationRequest request);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "active", target = "isActive")
    SellerProfileResponse toSellerResponse(SellerProfile sellerProfile);

    @Mapping(target = "ward", ignore = true)
    @Mapping(target = "province", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateSellerProfile(@MappingTarget SellerProfile sellerProfile, SellerProfileUpdateRequest request);
}
