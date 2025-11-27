package com.vdt2025.product_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Response chứa thông tin đầy đủ để frontend render UI chọn variant
 * dựa trên hệ thống Selection mới (Seller-defined)
 * 
 * Use case:
 * 1. User vào trang chi tiết sản phẩm
 * 2. Frontend call API này để lấy danh sách selection groups và options
 * 3. User chọn từng option từ mỗi group (Mẫu điện thoại: iPhone 15 Pro, Kiểu vỏ: Carbon)
 * 4. Frontend call API findVariantBySelections để lấy variant tương ứng
 * 
 * Example Response:
 * {
 *   "productId": "prod-123",
 *   "productName": "Ốp điện thoại cao cấp",
 *   "selectionGroups": [
 *     {
 *       "groupId": "grp-1",
 *       "groupName": "Mẫu điện thoại",
 *       "required": true,
 *       "options": [
 *         {"optionId": "opt-1", "value": "iPhone 15 Pro", "available": true, "priceAdjustment": 0},
 *         {"optionId": "opt-2", "value": "iPhone 14", "available": true, "priceAdjustment": -20000}
 *       ]
 *     },
 *     {
 *       "groupId": "grp-2",
 *       "groupName": "Kiểu vỏ",
 *       "required": true,
 *       "options": [
 *         {"optionId": "opt-3", "value": "Trong suốt", "available": true},
 *         {"optionId": "opt-4", "value": "Carbon", "available": true, "priceAdjustment": 50000}
 *       ]
 *     }
 *   ],
 *   "selectionMatrix": {
 *     "opt-1,opt-3": "variant-1",
 *     "opt-1,opt-4": "variant-2",
 *     "opt-2,opt-3": "variant-3"
 *   },
 *   "basePrice": 199000,
 *   "totalVariants": 4
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSelectionConfigResponse {
    
    /**
     * ID sản phẩm
     */
    String productId;
    
    /**
     * Tên sản phẩm
     */
    String productName;
    
    /**
     * Danh sách các selection groups
     */
    List<SelectionGroupForUI> selectionGroups;
    
    /**
     * Matrix mapping từ combination của option IDs -> variant ID
     * Key: "optionId1,optionId2" (sorted by group order)
     * Value: variantId
     */
    Map<String, String> selectionMatrix;
    
    /**
     * Danh sách các tổ hợp options đã hết hàng (available stock = 0)
     * Key: "optionId1,optionId2" (sorted by group order) 
     * FE có thể dùng để làm mờ/disable các options khi user chọn
     */
    List<OutOfStockInfo> outOfStockCombinations;
    
    /**
     * Giá cơ bản (dùng để tính giá khi có priceAdjustment)
     */
    BigDecimal basePrice;
    
    /**
     * Tổng số variants
     */
    Integer totalVariants;
    
    /**
     * Selection Group format đơn giản hóa cho UI
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SelectionGroupForUI {
        String groupId;
        String groupName;
        String description;
        Integer displayOrder;
        boolean required;
        boolean allowMultiple;
        List<SelectionOptionForUI> options;
    }
    
    /**
     * Selection Option format đơn giản hóa cho UI
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SelectionOptionForUI {
        String optionId;
        String value;
        String label;
        String imageUrl;
        String colorCode;
        BigDecimal priceAdjustment;
        boolean available;
        Integer stockQuantity;
    }
    
    /**
     * Thông tin về tổ hợp options hết hàng
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OutOfStockInfo {
        /**
         * Key của tổ hợp options ("optionId1,optionId2")
         */
        String combinationKey;
        
        /**
         * Danh sách option IDs trong tổ hợp này
         */
        List<String> optionIds;
        
        /**
         * Variant ID tương ứng (để FE có thể track)
         */
        String variantId;
        
        /**
         * Số lượng đã đặt trước (reserved)
         */
        Integer reservedStock;
    }
}
