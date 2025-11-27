package com.cnweb2025.user_service.specification;

import com.cnweb2025.user_service.dto.request.seller.SellerProfileFilterRequest;
import com.cnweb2025.user_service.entity.SellerProfile;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class SellerProfileSpecification {

    public static Specification<SellerProfile> withFilters(SellerProfileFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter theo verificationStatus
            if (filter.getVerificationStatus() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("verificationStatus"),
                        filter.getVerificationStatus()
                ));
            }

            // Filter theo ngày tạo từ
            if (filter.getCreatedFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getCreatedFrom()
                ));
            }

            // Filter theo ngày tạo đến
            if (filter.getCreatedTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getCreatedTo()
                ));
            }

            // Filter theo ngày cập nhật từ
            if (filter.getUpdatedFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("updatedAt"),
                        filter.getUpdatedFrom()
                ));
            }

            // Filter theo ngày cập nhật đến
            if (filter.getUpdatedTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("updatedAt"),
                        filter.getUpdatedTo()
                ));
            }

            // Filter theo tên cửa hàng (tìm kiếm không phân biệt hoa thường)
            if (filter.getStoreName() != null && !filter.getStoreName().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("storeName")),
                        "%" + filter.getStoreName().toLowerCase() + "%"
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
