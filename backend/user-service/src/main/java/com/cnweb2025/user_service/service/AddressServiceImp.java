package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.request.address.UserAddressCreationRequest;
import com.cnweb2025.user_service.dto.request.address.UserAddressUpdateRequest;
import com.cnweb2025.user_service.dto.response.AddressResponse;
import com.cnweb2025.user_service.entity.Address;
import com.cnweb2025.user_service.entity.Province;
import com.cnweb2025.user_service.entity.User;
import com.cnweb2025.user_service.entity.Ward;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.AddressMapper;
import com.cnweb2025.user_service.mapper.UserMapper;
import com.cnweb2025.user_service.mapper.WardMapper;
import com.cnweb2025.user_service.repository.AddressRepository;
import com.cnweb2025.user_service.repository.ProvinceRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import com.cnweb2025.user_service.repository.WardRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AddressServiceImp implements AddressService{
    AddressRepository addressRepository;
    WardRepository wardRepository;
    ProvinceRepository provinceRepository;
    UserRepository userRepository;
    WardMapper wardMapper;
    UserMapper userMapper;
    AddressMapper addressMapper;

    @Override
    @Transactional
    public AddressResponse createAddress(UserAddressCreationRequest request) {
        // Lấy đối tượng ward và province từ id được cung cấp trong request
        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> {
                    log.error("Ward not found with ID: {}", request.getWardId());
                    return new AppException(ErrorCode.WARD_NOT_FOUND);
                });
        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> {
                    log.error("Province not found with ID: {}", request.getProvinceId());
                    return new AppException(ErrorCode.PROVINCE_NOT_FOUND);
                });
        // Kiểm tra xem ward có thuộc về province không
        if (!ward.getProvince().getId().equals(province.getId())) {
            log.error("Ward ID: {} does not belong to Province ID: {}", ward.getId(), province.getId());
            throw new AppException(ErrorCode.WARD_PROVINCE_MISMATCH);
        }
        // Lấy user hiện tại
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Nếu địa chỉ này là mặc định, set các địa chỉ khác thành không mặc định
        if (request.getIsDefault() == true)
            addressRepository.resetDefaultAddress(user.getId());
        // Tạo và lưu địa chỉ mới
        Address address = Address.builder()
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .street(request.getStreet())
                .province(province)
                .ward(ward)
                .isDefault(request.getIsDefault())
                .user(user)
                .build();
        Address savedAddress = addressRepository.save(address);
        log.info("Created new address with ID: {}", savedAddress.getId());
        return AddressResponse.builder()
                .id(savedAddress.getId())
                .receiverName(savedAddress.getReceiverName())
                .receiverPhone(savedAddress.getReceiverPhone())
                .street(savedAddress.getStreet())
                .ward(wardMapper.toWardResponse(savedAddress.getWard()))
                .isDefault(savedAddress.isDefault())
                .userId(user.getId())
                .build();
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String id, UserAddressUpdateRequest request) {
        // Lấy user hiện tại
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));
        // Nếu địa chỉ đặt là mặc định, chạy reset
        if (request.getIsDefault() == true && !address.isDefault()) {
            addressRepository.resetDefaultAddress(address.getUser().getId());
            log.info("Default address with ID: {}", address.getUser().getId());
        }
        addressMapper.updateAddress(address, request);
        if (request.getProvinceId() != null) {
            Province province = provinceRepository.findById(request.getProvinceId())
                    .orElseThrow(() -> {
                        log.error("Province not found with ID: {}", request.getProvinceId());
                        return new AppException(ErrorCode.PROVINCE_NOT_FOUND);
                    });
            address.setProvince(province);
        }
        if (request.getWardId() != null) {
            Ward ward = wardRepository.findById(request.getWardId())
                    .orElseThrow(() -> {
                        log.error("Ward not found with ID: {}", request.getWardId());
                        return new AppException(ErrorCode.WARD_NOT_FOUND);
                    });
            address.setWard(ward);
        }
        // Kiểm tra xem ward có thuộc về province không
        if (!address.getWard().getProvince().getId().equals(address.getProvince().getId())) { // <-- Thêm ! và .getId()
            log.error("Ward ID: {} does not belong to Province ID: {}", address.getWard().getId(), address.getProvince().getId());
            throw new AppException(ErrorCode.WARD_PROVINCE_MISMATCH);
        }
        return addressMapper.toAddressResponse(addressRepository.save(address));
    }

    @Override
    public Page<AddressResponse> findAllAddressesOfUser(Pageable pageable) {
        // Lấy user hiện tại
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsernameAndEnabledTrueAndIsVerifiedTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Address> addresses = addressRepository.findAllByUserId(user.getId(), pageable);
        return addresses.map(addressMapper::toAddressResponse);
    }


}
