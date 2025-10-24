package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.request.address.UserAddressUpdateRequest;
import com.cnweb2025.user_service.dto.request.user.UserUpdateRequest;
import com.cnweb2025.user_service.dto.response.AddressResponse;
import com.cnweb2025.user_service.entity.Address;
import com.cnweb2025.user_service.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {WardMapper.class})
public interface AddressMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "default", target = "isDefault")
    AddressResponse toAddressResponse(Address address);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "ward", ignore = true)
    @Mapping(target = "province", ignore = true)
    @Mapping(source = "isDefault", target = "default")
    void updateAddress(@MappingTarget Address address, UserAddressUpdateRequest request);
}
