package com.cnweb2025.user_service.mapper;

import com.cnweb2025.user_service.dto.response.AddressResponse;
import com.cnweb2025.user_service.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WardMapper.class})
public interface AddressMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "default", target = "isDefault")
    AddressResponse toAddressResponse(Address address);
}
