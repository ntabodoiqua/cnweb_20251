package com.vdt2025.product_service.specification;

import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.entity.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Specification cho Product với advanced filtering
 * Best practice cho e-commerce: support keyword search, price range, rating, etc.
 */
public class ProductSpecification {

    public static Specification<Product> withFilter(ProductFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Keyword search (tìm trong tên và mô tả)
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String keyword = "%" + filter.getKeyword().toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), keyword);
                Predicate descPredicate = cb.like(cb.lower(root.get("description")), keyword);
                predicates.add(cb.or(namePredicate, descPredicate));
            }

            // Name exact/partial match
            if (filter.getName() != null && !filter.getName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + filter.getName().toLowerCase() + "%"));
            }

            // Category filter
            if (filter.getCategoryId() != null && !filter.getCategoryId().isBlank()) {
                Join<Product, Category> categoryJoin = root.join("category");
                predicates.add(cb.equal(categoryJoin.get("id"), filter.getCategoryId()));
            }

            // Store filter
            if (filter.getStoreId() != null && !filter.getStoreId().isBlank()) {
                Join<Product, Store> storeJoin = root.join("store");
                predicates.add(cb.equal(storeJoin.get("id"), filter.getStoreId()));
            }

            // Brand filter
            if (filter.getBrandId() != null && !filter.getBrandId().isBlank()) {
                Join<Product, Brand> brandJoin = root.join("brand");
                predicates.add(cb.equal(brandJoin.get("id"), filter.getBrandId()));
            }

            // Created by filter
            if (filter.getCreatedBy() != null && !filter.getCreatedBy().isBlank()) {
                predicates.add(cb.equal(root.get("createdBy"), filter.getCreatedBy()));
            }

            // Active status filter
            if (filter.getIsActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), filter.getIsActive()));
            }

            // Price range filter (sẽ cần join với variants để lấy min price)
            // Để đơn giản, tạm thời filter based on variants
            if (filter.getPriceFrom() != null || filter.getPriceTo() != null) {
                Join<Product, ProductVariant> variantJoin = root.join("variants");

                if (filter.getPriceFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("price"), filter.getPriceFrom()));
                }
                if (filter.getPriceTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("price"), filter.getPriceTo()));
                }
            }

            // Stock range filter
            if (filter.getStockFrom() != null || filter.getStockTo() != null) {
                Join<Product, ProductVariant> variantJoin = root.join("variants");

                if (filter.getStockFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("stockQuantity"), filter.getStockFrom()));
                }
                if (filter.getStockTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("stockQuantity"), filter.getStockTo()));
                }
            }

            // Rating filter
            if (filter.getRatingFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), filter.getRatingFrom()));
            }
            if (filter.getRatingTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("averageRating"), filter.getRatingTo()));
            }

            // Date range filter
            if (filter.getCreatedFrom() != null) {
                LocalDateTime fromDate = LocalDateTime.parse(filter.getCreatedFrom());
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (filter.getCreatedTo() != null) {
                LocalDateTime toDate = LocalDateTime.parse(filter.getCreatedTo());
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            // Ensure distinct results when joining
            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}