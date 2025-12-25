package com.vdt2025.product_service.facade;

import com.vdt2025.product_service.dto.response.ProductResponse;
import com.vdt2025.product_service.dto.response.VariantResponse;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductDetailFacade {
    InventoryStockRepository inventoryStockRepository;
    ProductService productService;

    /**
     * Lấy chi tiết sản phẩm (Cached) + Tồn kho (Real-time)
     */
    public ProductResponse getProductDetailWithStock(String productId) {
        // Lấy thông tin tĩnh từ Service (Đã có @Cacheable bên trong service này)
        ProductResponse productDetail = productService.getProductById(productId);

        // Nếu sản phẩm không có variants, trả về luôn
        if (productDetail.getVariants() == null || productDetail.getVariants().isEmpty()) {
            return productDetail;
        }

        // Lấy thông tin tồn kho Real-time từ DB
        List<Object[]> stockData = inventoryStockRepository.findAllStockByProductId(productId);

        // Convert List Object[] sang Map để tra cứu cho nhanh (O(1))
        // Key: VariantId -> Value: Một object chứa (onHand, reserved)
        Map<String, StockInfo> stockMap = stockData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0], // Variant ID
                        row -> new StockInfo(
                                (Integer) row[1], // onHand
                                (Integer) row[2]  // reserved
                        )
                ));

        // Hydration: Clone danh sách variants và bơm stock vào
        List<VariantResponse> enrichedVariants = productDetail.getVariants().stream()
                .map(variant -> {
                    StockInfo info = stockMap.get(variant.getId());
                    int onHand = (info != null) ? info.onHand : 0;
                    int reserved = (info != null) ? info.reserved : 0;

                    return variant.toBuilder()
                            .availableStock(onHand - reserved) // Tính toán available
                            .reservedStock(reserved)
                            .build();
                })
                .toList();

        // Trả về object ProductDetail mới (Clone) chứa list variants mới
        return productDetail.toBuilder()
                .variants(enrichedVariants)
                .build();
    }

    // Helper record để giữ data tạm
    private record StockInfo(Integer onHand, Integer reserved) {}
}
