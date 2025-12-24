package com.cnweb.order_service.specification;

import com.cnweb.order_service.dto.request.OrderFilterRequest;
import com.cnweb.order_service.entity.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> getOrdersByFilter(OrderFilterRequest filter, String username, String storeId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by user (buyer)
            if (StringUtils.hasText(username)) {
                predicates.add(criteriaBuilder.equal(root.get("username"), username));
            }

            // Filter by store (seller)
            if (StringUtils.hasText(storeId)) {
                predicates.add(criteriaBuilder.equal(root.get("storeId"), storeId));
            }

            if (filter == null) {
                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            }

            // Search
            if (StringUtils.hasText(filter.getSearch())) {
                String searchLike = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate searchPredicate = criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("orderNumber")), searchLike),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("receiverName")), searchLike),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("storeName")), searchLike)
                );
                predicates.add(searchPredicate);
            }

            // Status
            if (filter.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filter.getStatus()));
            }

            // Payment Status
            if (filter.getPaymentStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), filter.getPaymentStatus()));
            }

            // Refund Status (for filtering pending return requests)
            if (filter.getRefundStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("refundStatus"), filter.getRefundStatus()));
            }

            // Date Range
            if (filter.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filter.getStartDate()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), filter.getEndDate()));
            }

            // Amount Range
            if (filter.getMinAmount() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("totalAmount"), filter.getMinAmount()));
            }
            if (filter.getMaxAmount() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("totalAmount"), filter.getMaxAmount()));
            }
            
            // Default sort by createdAt desc if not specified in Pageable (handled by Controller/Service usually, but good to know)
            // query.orderBy(criteriaBuilder.desc(root.get("createdAt"))); 

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
