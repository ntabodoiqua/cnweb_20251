package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

/**
 * Response chứa thông tin đầy đủ để frontend render UI chọn variant
 * 
 * Use case:
 * 1. User vào trang chi tiết sản phẩm
 * 2. Frontend call API này để lấy danh sách attributes có thể chọn
 * 3. User chọn từng attribute (Màu: Đỏ, Size: XL)
 * 4. Frontend call API findVariantByAttributes để lấy variant tương ứng
 * 
 * Example Response:
 * {
 *   "productId": "prod-123",
 *   "productName": "Áo Sơ Mi Nam",
 *   "attributeGroups": [
 *     {
 *       "attributeId": "attr-1",
 *       "attributeName": "Màu sắc",
 *       "options": [
 *         {"valueId": "val-1", "value": "Đỏ", "available": true},
 *         {"valueId": "val-2", "value": "Xanh", "available": true}
 *       ]
 *     },
 *     {
 *       "attributeId": "attr-2", 
 *       "attributeName": "Size",
 *       "options": [
 *         {"valueId": "val-3", "value": "M", "available": true},
 *         {"valueId": "val-4", "value": "L", "available": false},
 *         {"valueId": "val-5", "value": "XL", "available": true}
 *       ]
 *     }
 *   ],
 *   "variantMatrix": {
 *     "val-1,val-3": "variant-1",  // Đỏ + M -> variant-1
 *     "val-1,val-5": "variant-2",  // Đỏ + XL -> variant-2
 *     "val-2,val-3": "variant-3"   // Xanh + M -> variant-3
 *   }
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductVariantSelectionResponse {
    
    /**
     * ID sản phẩm
     */
    String productId;
    
    /**
     * Tên sản phẩm
     */
    String productName;
    
    /**
     * Danh sách nhóm thuộc tính có thể chọn
     * Ví dụ: [Màu sắc, Kích thước, Dung lượng]
     */
    List<VariantAttributeGroup> attributeGroups;
    
    /**
     * Matrix mapping từ combination của attribute values -> variant ID
     * Key: "valueId1,valueId2,valueId3" (sorted)
     * Value: variantId
     * 
     * Frontend có thể dùng để:
     * 1. Quick lookup variant khi user chọn xong tất cả attributes
     * 2. Check xem combination có tồn tại không
     * 3. Disable options không có variant tương ứng
     */
    Map<String, String> variantMatrix;
    
    /**
     * Tổng số variants available
     */
    Integer totalVariants;
}
