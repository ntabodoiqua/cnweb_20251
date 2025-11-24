package com.vdt2025.product_service.controller;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.request.inventory.InventoryChangeRequest;
import com.vdt2025.product_service.dto.response.InventoryStockResponse;
import com.vdt2025.product_service.service.InventoryService;
import com.vdt2025.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryManagementController {
    InventoryService inventoryService;
    ProductService productService;


    // Lấy thông tin tồn kho của một variant sản phẩm
    @GetMapping("/{variantId}")
    public ApiResponse<InventoryStockResponse> getInventoryByVariantId(@PathVariable String variantId) {
        InventoryStockResponse inventory = inventoryService.getInventoryStock(variantId);
        return ApiResponse.<InventoryStockResponse>builder()
                .result(inventory)
                .build();
    }

    // Giữ chỗ hàng khi customer đặt hàng (chưa thanh toán) (internal - để order-service gọi)
    @PostMapping("/reserve")
    public ApiResponse<Void> reserveVariant(@RequestBody @Valid InventoryChangeRequest request) {
        inventoryService.reserveStock(request.getVariantId(), request.getQuantity());
        return ApiResponse.<Void>builder()
                .message("Inventory reserved successfully")
                .build();
    }

    // Chốt đơn khi customer thanh toán thành công
    @PostMapping("/confirm")
    public ApiResponse<Void> confirmReservation(@RequestBody @Valid InventoryChangeRequest request) {
        inventoryService.confirmSale(request.getVariantId(), request.getQuantity());
        return ApiResponse.<Void>builder()
                .message("Inventory reservation confirmed successfully")
                .build();
    }

    // Xả hàng đã giữ chỗ khi đơn hàng bị hủy hoặc timeout
    @PostMapping("/release")
    public ApiResponse<Void> releaseVariant(@RequestBody @Valid InventoryChangeRequest request) {
        inventoryService.releaseReservation(request.getVariantId(), request.getQuantity());
        return ApiResponse.<Void>builder()
                .message("Inventory reservation released successfully")
                .build();
    }

    // Admin/seller điều chỉnh tồn kho về quantity mới
    @PutMapping("/adjust")
    public ApiResponse<Void> adjustInventory(@RequestBody @Valid InventoryChangeRequest request) {
        inventoryService.adjustStock(request.getVariantId(), request.getQuantity());
        return ApiResponse.<Void>builder()
                .message("Inventory adjusted successfully")
                .build();
    }

    // Hoàn hàng
    @PostMapping("/return")
    public ApiResponse<Void> returnInventory(@RequestBody @Valid InventoryChangeRequest request) {
        inventoryService.increaseStock(request.getVariantId(), request.getQuantity());
        return ApiResponse.<Void>builder()
                .message("Inventory returned successfully")
                .build();
    }




}
