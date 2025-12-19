package com.vdt2025.product_service.facade;

import com.vdt2025.product_service.dto.request.FindVariantRequest;
import com.vdt2025.product_service.dto.response.VariantResponse;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Facade: Chịu trách nhiệm điều phối việc tìm variant chi tiết.
 * Nhiệm vụ: Lấy dữ liệu tĩnh từ Cache (Redis) -> Lấy dữ liệu tồn kho Real-time từ DB -> Ghép lại.
 * 
 * Use case:
 * - User đã chọn xong tất cả thuộc tính (Màu: Đỏ, Size: XL)
 * - Frontend call API /find-variant để lấy thông tin variant tương ứng
 * - Cần hiển thị giá, tồn kho realtime, ảnh của variant đó
 */
@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VariantDetailFacade {
    
    ProductService productService;
    InventoryStockRepository inventoryStockRepository;
    
    /**
     * Tìm variant theo attributes và ghép thông tin tồn kho realtime
     * 
     * @param productId ID sản phẩm
     * @param request Danh sách attribute value IDs đã chọn
     * @return VariantResponse với thông tin tồn kho realtime
     */
    public VariantResponse findVariantWithStock(String productId, FindVariantRequest request) {
        log.info("Finding variant with stock for product {} with attributes: {}", 
                productId, request.getAttributeValueIds());
        
        // 1. Lấy thông tin variant từ cache (Redis) qua ProductService
        // Service này sẽ tìm variant dựa trên combination của attribute values
        VariantResponse variantFromCache = productService.findVariantByAttributes(productId, request);
        
        // 2. Lấy thông tin tồn kho Real-time từ DB
        // Query trả về: [variantId, quantityOnHand, quantityReserved]
        var stockDataOpt = inventoryStockRepository.findByProductVariantId(variantFromCache.getId());
        
        // 3. Tính toán stock thực tế
        int onHand = 0;
        int reserved = 0;
        
        if (stockDataOpt.isPresent()) {
            var stock = stockDataOpt.get();
            onHand = stock.getQuantityOnHand();
            reserved = stock.getQuantityReserved();
        }
        
        int availableStock = onHand - reserved;
        
        log.info("Found variant {} with stock - OnHand: {}, Reserved: {}, Available: {}", 
                variantFromCache.getId(), onHand, reserved, availableStock);
        
        // 4. Hydration: Ghép thông tin tồn kho vào variant response
        // Sử dụng toBuilder() để tạo bản copy và cập nhật stock fields
        return variantFromCache.toBuilder()
                .availableStock(availableStock)
                .reservedStock(reserved)
                .build();
    }
}
