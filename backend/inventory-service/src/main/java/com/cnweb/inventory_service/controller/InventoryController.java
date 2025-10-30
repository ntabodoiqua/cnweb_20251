package com.cnweb.inventory_service.controller;

import com.cnweb.inventory_service.dto.request.CreateInventoryRequest;
import com.cnweb.inventory_service.dto.request.ReserveInventoryRequest;
import com.cnweb.inventory_service.dto.request.UpdateInventoryRequest;
import com.cnweb.inventory_service.dto.response.ApiResponse;
import com.cnweb.inventory_service.dto.response.InventoryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory Management", description = "APIs for managing inventory")
public class InventoryController {

    // Service sẽ được implement sau
    // private final InventoryService inventoryService;

    @Operation(summary = "Create new inventory", description = "Create inventory for a product in a store")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<InventoryResponse>> createInventory(
            @Valid @RequestBody CreateInventoryRequest request) {
        log.info("Creating inventory for product {} in store {}", request.getProductId(), request.getStoreId());
        
        // TODO: Implement service call
        // InventoryResponse response = inventoryService.createInventory(request);
        
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .code(1000)
                .message("success.inventory.created")
                // .result(response)
                .build());
    }

    @Operation(summary = "Update inventory", description = "Update inventory quantity")
    @PutMapping("/{inventoryId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<InventoryResponse>> updateInventory(
            @PathVariable String inventoryId,
            @Valid @RequestBody UpdateInventoryRequest request) {
        log.info("Updating inventory {}", inventoryId);
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .code(1000)
                .message("success.inventory.updated")
                .build());
    }

    @Operation(summary = "Get inventory by ID", description = "Get inventory details by ID")
    @GetMapping("/{inventoryId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventory(@PathVariable String inventoryId) {
        log.info("Getting inventory {}", inventoryId);
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .code(1000)
                .message("success.inventory.checked")
                .build());
    }

    @Operation(summary = "Check inventory availability", description = "Check if product is available in store")
    @GetMapping("/check/{productId}/{storeId}")
    public ResponseEntity<ApiResponse<InventoryResponse>> checkInventory(
            @PathVariable String productId,
            @PathVariable String storeId) {
        log.info("Checking inventory for product {} in store {}", productId, storeId);
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .code(1000)
                .message("success.inventory.checked")
                .build());
    }

    @Operation(summary = "Get all inventory by store", description = "Get all inventory items in a store")
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getInventoryByStore(
            @PathVariable String storeId) {
        log.info("Getting all inventory for store {}", storeId);
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<List<InventoryResponse>>builder()
                .code(1000)
                .message("success.inventory.checked")
                .build());
    }

    @Operation(summary = "Reserve inventory", description = "Reserve inventory for an order")
    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<InventoryResponse>> reserveInventory(
            @Valid @RequestBody ReserveInventoryRequest request) {
        log.info("Reserving {} units of product {} in store {} for order {}",
                request.getQuantity(), request.getProductId(), request.getStoreId(), request.getOrderId());
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .code(1000)
                .message("success.inventory.reserved")
                .build());
    }

    @Operation(summary = "Release reserved inventory", description = "Release reserved inventory (cancel order)")
    @PostMapping("/release")
    public ResponseEntity<ApiResponse<InventoryResponse>> releaseInventory(
            @Valid @RequestBody ReserveInventoryRequest request) {
        log.info("Releasing {} units of product {} in store {} for order {}",
                request.getQuantity(), request.getProductId(), request.getStoreId(), request.getOrderId());
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<InventoryResponse>builder()
                .code(1000)
                .message("success.inventory.released")
                .build());
    }

    @Operation(summary = "Get low stock items", description = "Get items that need restocking")
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStockItems() {
        log.info("Getting low stock items");
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<List<InventoryResponse>>builder()
                .code(1000)
                .message("success.inventory.checked")
                .build());
    }

    @Operation(summary = "Delete inventory", description = "Delete inventory by ID")
    @DeleteMapping("/{inventoryId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteInventory(@PathVariable String inventoryId) {
        log.info("Deleting inventory {}", inventoryId);
        
        // TODO: Implement service call
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("success.inventory.deleted")
                .build());
    }
}
