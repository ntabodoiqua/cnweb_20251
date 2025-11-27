package com.vdt2025.product_service.facade;

import com.vdt2025.product_service.dto.request.selection.FindVariantBySelectionRequest;
import com.vdt2025.product_service.dto.response.ProductSelectionConfigResponse;
import com.vdt2025.product_service.dto.response.VariantResponse;
import com.vdt2025.product_service.entity.InventoryStock;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.service.ProductSelectionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Facade: Chịu trách nhiệm điều phối việc lấy thông tin selection với tồn kho realtime.
 * 
 * Nhiệm vụ: 
 * - Lấy dữ liệu tĩnh từ Cache (Redis) thông qua ProductSelectionService
 * - Lấy dữ liệu tồn kho Real-time từ DB
 * - Ghép lại (Hydration) để trả về response với stock chính xác
 * 
 * Use cases:
 * 1. User vào trang chi tiết sản phẩm -> cần biết options nào còn hàng/hết hàng
 * 2. User chọn options -> cần biết variant có còn hàng không
 */
@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SelectionVariantDetailFacade {
    
    ProductSelectionService productSelectionService;
    InventoryStockRepository inventoryStockRepository;
    
    /**
     * Lấy cấu hình selection với thông tin tồn kho realtime
     * 
     * Flow:
     * 1. Lấy config từ cache (ProductSelectionService)
     * 2. Lấy stock realtime cho tất cả variants trong selectionMatrix
     * 3. Cập nhật lại outOfStockCombinations dựa trên stock realtime
     * 
     * @param productId ID sản phẩm
     * @return ProductSelectionConfigResponse với outOfStockCombinations đã được cập nhật realtime
     */
    public ProductSelectionConfigResponse getSelectionConfigWithRealtimeStock(String productId) {
        log.info("Fetching selection config with realtime stock for product: {}", productId);
        
        // 1. Lấy config từ cache
        ProductSelectionConfigResponse cachedConfig = productSelectionService.getProductSelectionConfig(productId);
        
        if (cachedConfig.getSelectionMatrix() == null || cachedConfig.getSelectionMatrix().isEmpty()) {
            log.info("Product {} has no selection matrix, returning cached config", productId);
            return cachedConfig;
        }
        
        // 2. Lấy tất cả variant IDs từ selection matrix
        List<String> variantIds = cachedConfig.getSelectionMatrix().values().stream()
                .distinct()
                .collect(Collectors.toList());
        
        // 3. Lấy stock realtime cho tất cả variants trong 1 query
        Map<String, InventoryStock> stockMap = inventoryStockRepository
                .findByProductVariantIdIn(variantIds).stream()
                .collect(Collectors.toMap(
                        stock -> stock.getProductVariant().getId(),
                        stock -> stock
                ));
        
        // 4. Build lại outOfStockCombinations dựa trên stock realtime
        List<ProductSelectionConfigResponse.OutOfStockInfo> realtimeOutOfStock = new ArrayList<>();
        
        for (Map.Entry<String, String> entry : cachedConfig.getSelectionMatrix().entrySet()) {
            String combinationKey = entry.getKey();
            String variantId = entry.getValue();
            
            InventoryStock stock = stockMap.get(variantId);
            int availableStock = 0;
            int reservedStock = 0;
            
            if (stock != null) {
                availableStock = stock.getAvailableQuantity();
                reservedStock = stock.getQuantityReserved();
            }
            
            // Nếu hết hàng (available <= 0), thêm vào danh sách
            if (availableStock <= 0) {
                List<String> optionIds = List.of(combinationKey.split(","));
                realtimeOutOfStock.add(
                        ProductSelectionConfigResponse.OutOfStockInfo.builder()
                                .combinationKey(combinationKey)
                                .optionIds(optionIds)
                                .variantId(variantId)
                                .reservedStock(reservedStock)
                                .build()
                );
            }
        }
        
        log.info("Product {} - Cached out-of-stock: {}, Realtime out-of-stock: {}", 
                productId, 
                cachedConfig.getOutOfStockCombinations() != null ? cachedConfig.getOutOfStockCombinations().size() : 0,
                realtimeOutOfStock.size());
        
        // 5. Trả về config với outOfStockCombinations đã được cập nhật realtime
        return ProductSelectionConfigResponse.builder()
                .productId(cachedConfig.getProductId())
                .productName(cachedConfig.getProductName())
                .selectionGroups(cachedConfig.getSelectionGroups())
                .selectionMatrix(cachedConfig.getSelectionMatrix())
                .outOfStockCombinations(realtimeOutOfStock)
                .basePrice(cachedConfig.getBasePrice())
                .totalVariants(cachedConfig.getTotalVariants())
                .build();
    }
    
    /**
     * Tìm variant theo selection options với thông tin tồn kho realtime
     * 
     * Flow:
     * 1. Tìm variant từ service (có thể cache hoặc DB)
     * 2. Lấy stock realtime từ DB
     * 3. Hydrate stock vào response
     * 
     * @param productId ID sản phẩm
     * @param request Danh sách option IDs đã chọn
     * @return VariantResponse với thông tin tồn kho realtime
     */
    public VariantResponse findVariantBySelectionsWithStock(String productId, FindVariantBySelectionRequest request) {
        log.info("Finding variant with realtime stock for product {} with options: {}", 
                productId, request.getOptionIds());
        
        // 1. Tìm variant từ service
        VariantResponse variantResponse = productSelectionService.findVariantBySelections(productId, request);
        
        // 2. Lấy stock realtime từ DB
        var stockOpt = inventoryStockRepository.findByProductVariantId(variantResponse.getId());
        
        int availableStock = 0;
        int reservedStock = 0;
        
        if (stockOpt.isPresent()) {
            InventoryStock stock = stockOpt.get();
            availableStock = stock.getAvailableQuantity();
            reservedStock = stock.getQuantityReserved();
        }
        
        log.info("Found variant {} with realtime stock - Available: {}, Reserved: {}", 
                variantResponse.getId(), availableStock, reservedStock);
        
        // 3. Hydrate: Ghép thông tin tồn kho realtime vào response
        return variantResponse.toBuilder()
                .availableStock(availableStock)
                .reservedStock(reservedStock)
                .build();
    }
    
    /**
     * Lấy available options với thông tin tồn kho realtime
     * 
     * Flow:
     * 1. Lấy available options từ service (có thể dùng cache)
     * 2. Lấy stock realtime cho các variants liên quan
     * 3. Cập nhật availability của options dựa trên stock realtime
     * 
     * @param productId ID sản phẩm
     * @param selectedOptionIds Danh sách option IDs đã chọn
     * @return ProductSelectionConfigResponse với availability đã cập nhật realtime
     */
    public ProductSelectionConfigResponse getAvailableOptionsWithRealtimeStock(
            String productId, List<String> selectedOptionIds) {
        log.info("Getting available options with realtime stock for product {} with selections: {}", 
                productId, selectedOptionIds);
        
        // 1. Lấy config với available options từ service
        ProductSelectionConfigResponse config = productSelectionService.getAvailableOptions(productId, selectedOptionIds);
        
        if (config.getSelectionMatrix() == null || config.getSelectionMatrix().isEmpty()) {
            return config;
        }
        
        // 2. Lấy stock realtime cho tất cả variants
        List<String> variantIds = config.getSelectionMatrix().values().stream()
                .distinct()
                .collect(Collectors.toList());
        
        Map<String, InventoryStock> stockMap = inventoryStockRepository
                .findByProductVariantIdIn(variantIds).stream()
                .collect(Collectors.toMap(
                        stock -> stock.getProductVariant().getId(),
                        stock -> stock
                ));
        
        // 3. Build realtime out-of-stock combinations
        List<ProductSelectionConfigResponse.OutOfStockInfo> realtimeOutOfStock = new ArrayList<>();
        
        for (Map.Entry<String, String> entry : config.getSelectionMatrix().entrySet()) {
            String combinationKey = entry.getKey();
            String variantId = entry.getValue();
            
            InventoryStock stock = stockMap.get(variantId);
            int availableStock = 0;
            int reservedStock = 0;
            
            if (stock != null) {
                availableStock = stock.getAvailableQuantity();
                reservedStock = stock.getQuantityReserved();
            }
            
            if (availableStock <= 0) {
                List<String> optionIds = List.of(combinationKey.split(","));
                realtimeOutOfStock.add(
                        ProductSelectionConfigResponse.OutOfStockInfo.builder()
                                .combinationKey(combinationKey)
                                .optionIds(optionIds)
                                .variantId(variantId)
                                .reservedStock(reservedStock)
                                .build()
                );
            }
        }
        
        log.info("Product {} available options - Realtime out-of-stock combinations: {}", 
                productId, realtimeOutOfStock.size());
        
        // 4. Trả về config với outOfStockCombinations đã được cập nhật realtime
        return ProductSelectionConfigResponse.builder()
                .productId(config.getProductId())
                .productName(config.getProductName())
                .selectionGroups(config.getSelectionGroups())
                .selectionMatrix(config.getSelectionMatrix())
                .outOfStockCombinations(realtimeOutOfStock)
                .basePrice(config.getBasePrice())
                .totalVariants(config.getTotalVariants())
                .build();
    }
}
