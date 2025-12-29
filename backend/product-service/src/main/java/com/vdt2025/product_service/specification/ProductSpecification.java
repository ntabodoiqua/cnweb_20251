package com.vdt2025.product_service.specification;

import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.entity.*;
import jakarta.persistence.criteria.*;
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

            // ALWAYS filter out deleted products (soft delete)
            // Sản phẩm đã xóa không bao giờ hiển thị trong kết quả tìm kiếm
            predicates.add(cb.equal(root.get("isDeleted"), false));

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

            /// --- LOGIC GIÁ (Price) ---
            // Lưu ý: Price nằm ở Variant, nên phải join.
            // Dùng Subquery cho Price cũng được, nhưng Join thường nhanh hơn cho Min/Max simple.
            // Ở đây dùng Join như cũ nhưng fix lại cách lấy field
            if (filter.getPriceFrom() != null || filter.getPriceTo() != null) {
                // Join để lọc: Nếu BẤT KỲ variant nào thỏa mãn range giá -> Lấy Product đó
                Join<Product, ProductVariant> priceVariantJoin = root.join("variants");

                if (filter.getPriceFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(priceVariantJoin.get("price"), filter.getPriceFrom()));
                }
                if (filter.getPriceTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(priceVariantJoin.get("price"), filter.getPriceTo()));
                }
            }

            // --- LOGIC MỚI: LỌC TỒN KHO (FIXED) ---
            // Yêu cầu: Tính tổng (OnHand - Reserved) của tất cả variant thuộc Product này
            if (Boolean.TRUE.equals(filter.getInStockOnly()) || filter.getMinStock() != null) {

                // Tạo Subquery: SELECT SUM(i.quantity_on_hand - i.quantity_reserved)
                // FROM inventory_stocks i JOIN product_variants v ON ...
                // WHERE v.product_id = root.id
                Subquery<Long> stockSubquery = query.subquery(Long.class);
                Root<InventoryStock> stockRoot = stockSubquery.from(InventoryStock.class);
                Join<InventoryStock, ProductVariant> variantJoin = stockRoot.join("productVariant");

                // Điều kiện join về Product cha (Correlation)
                Predicate linkToProduct = cb.equal(variantJoin.get("product"), root);

                // Công thức: Available = OnHand - Reserved
                Expression<Integer> onHand = cb.coalesce(stockRoot.get("quantityOnHand"), 0);
                Expression<Integer> reserved = cb.coalesce(stockRoot.get("quantityReserved"), 0);
                Expression<Integer> available = cb.diff(onHand, reserved);

                // Select SUM
                stockSubquery.select(cb.sum(available.as(Long.class))); // Cast về Long để SUM không lỗi
                stockSubquery.where(linkToProduct);

                // Logic 1: Chỉ lấy hàng còn tồn (Total > 0)
                if (Boolean.TRUE.equals(filter.getInStockOnly())) {
                    // Coalesce subquery result về 0 nếu null (trường hợp ko có variant nào)
                    predicates.add(cb.greaterThan(cb.coalesce(stockSubquery, 0L), 0L));
                }

                // Logic 2: Tồn kho tối thiểu (Total >= minStock)
                if (filter.getMinStock() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                            cb.coalesce(stockSubquery, 0L),
                            filter.getMinStock().longValue()
                    ));
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

            // Track nếu có join để biết cần distinct hay không
            boolean hasJoin = (filter.getPriceFrom() != null || filter.getPriceTo() != null) ||
                    (filter.getCategoryId() != null && !filter.getCategoryId().isBlank()) ||
                    (filter.getStoreId() != null && !filter.getStoreId().isBlank()) ||
                    (filter.getBrandId() != null && !filter.getBrandId().isBlank());

            // Custom ORDER BY cho averageRating và ratingCount với NULLS LAST
            // Điều này đảm bảo sản phẩm có rating sẽ luôn lên trước sản phẩm chưa có rating
            boolean hasCustomOrderBy = false;
            if (filter.getSortBy() != null && !filter.getSortBy().isBlank()) {
                String sortBy = filter.getSortBy().toLowerCase();
                boolean isDesc = !"asc".equalsIgnoreCase(filter.getSortDirection());
                
                if ("averagerating".equals(sortBy) || "ratingcount".equals(sortBy)) {
                    hasCustomOrderBy = true;
                    String fieldName = "averagerating".equals(sortBy) ? "averageRating" : "ratingCount";
                    
                    // PostgreSQL: NULL được coi là lớn nhất khi ASC, và cũng lớn nhất khi DESC
                    // Để đảm bảo sản phẩm có rating xếp trước sản phẩm không có rating:
                    // 1. Sort theo isNull (false = 0 xếp trước, true = 1 xếp sau) -> NULLS LAST
                    // 2. Sort theo giá trị rating thực tế
                    
                    // Tạo expression: CASE WHEN field IS NULL THEN 1 ELSE 0 END
                    // Để NULL luôn xếp cuối bất kể ASC hay DESC
                    Expression<Integer> nullsLastExpression = cb.selectCase()
                            .when(cb.isNull(root.get(fieldName)), 1)
                            .otherwise(0)
                            .as(Integer.class);
                    
                    // Sort: 
                    // 1. nullsLastExpression ASC (0 trước, 1 sau) -> Non-null values first
                    // 2. actual field value (ASC/DESC based on user request)
                    // 3. createdAt DESC (secondary sort)
                    Order nullsLastOrder = cb.asc(nullsLastExpression);
                    Order primaryOrder = isDesc ? cb.desc(root.get(fieldName)) : cb.asc(root.get(fieldName));
                    Order secondaryOrder = cb.desc(root.get("createdAt"));
                    query.orderBy(nullsLastOrder, primaryOrder, secondaryOrder);
                }
            }

            // Chỉ dùng DISTINCT khi có JOIN và KHÔNG có custom ORDER BY expression
            // PostgreSQL yêu cầu ORDER BY expressions phải nằm trong SELECT list khi dùng DISTINCT
            if (hasJoin && !hasCustomOrderBy) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}