package com.vdt2025.product_service.specification;

import com.vdt2025.product_service.dto.request.brand.BrandFilterRequest;
import com.vdt2025.product_service.dto.request.category.CategoryFilterRequest;
import com.vdt2025.product_service.entity.Brand;
import com.vdt2025.product_service.entity.Category;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class BrandSpecification {
    public static Specification<Brand> withFilter(BrandFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (StringUtils.hasText(filter.getName())) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + filter.getName().toLowerCase().trim() + "%"));
                }
                if(filter.getIsActive() != null) {
                    predicates.add(cb.equal(root.get("isActive"), filter.getIsActive()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
