package com.cnweb.order_service.mapper;

import com.cnweb.order_service.dto.request.CouponCreationRequest;
import com.cnweb.order_service.dto.response.CouponResponse;
import com.cnweb.order_service.entity.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", constant = "0")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Coupon toCoupon(CouponCreationRequest request);

    CouponResponse toCouponResponse(Coupon coupon);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true) // Code usually shouldn't change
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateCouponFromRequest(CouponCreationRequest request, @MappingTarget Coupon coupon);
}
