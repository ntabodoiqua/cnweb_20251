package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.request.selection.*;
import com.vdt2025.product_service.dto.response.*;
import com.vdt2025.product_service.service.ProductSelectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller cho Product Selection (Seller-defined)
 * 
 * Cho phép seller tự định nghĩa các nhóm lựa chọn và options
 * để user có thể chọn variant phù hợp.
 * 
 * Workflow:
 * 1. Seller tạo Selection Groups cho product (Mẫu điện thoại, Kiểu vỏ...)
 * 2. Seller thêm Options vào mỗi Group (iPhone 15 Pro, Carbon...)
 * 3. Seller liên kết Options với Variants tương ứng
 * 4. User chọn Options -> System tìm Variant phù hợp
 */
@RestController
@RequestMapping("/products/{productId}/selections")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Product Selection", description = "Quản lý các nhóm lựa chọn variant do Seller định nghĩa")
public class ProductSelectionController {
    
    ProductSelectionService selectionService;
    
    // ========== Selection Group Endpoints ==========
    
    @PostMapping("/groups")
    @Operation(summary = "Tạo Selection Group", 
               description = "Tạo nhóm lựa chọn mới cho sản phẩm (VD: Mẫu điện thoại, Kiểu vỏ)")
    public ApiResponse<SelectionGroupResponse> createSelectionGroup(
            @PathVariable String productId,
            @Valid @RequestBody SelectionGroupCreateRequest request) {
        log.info("Creating selection group for product: {}", productId);
        return ApiResponse.<SelectionGroupResponse>builder()
                .result(selectionService.createSelectionGroup(productId, request))
                .build();
    }
    
    @GetMapping("/groups")
    @Operation(summary = "Lấy tất cả Selection Groups", 
               description = "Lấy danh sách tất cả nhóm lựa chọn của sản phẩm")
    public ApiResponse<List<SelectionGroupResponse>> getSelectionGroups(
            @PathVariable String productId) {
        log.info("Fetching selection groups for product: {}", productId);
        return ApiResponse.<List<SelectionGroupResponse>>builder()
                .result(selectionService.getSelectionGroups(productId))
                .build();
    }
    
    @GetMapping("/groups/{groupId}")
    @Operation(summary = "Lấy chi tiết Selection Group", 
               description = "Lấy thông tin chi tiết của một nhóm lựa chọn")
    public ApiResponse<SelectionGroupResponse> getSelectionGroup(
            @PathVariable String productId,
            @PathVariable String groupId) {
        log.info("Fetching selection group {} for product: {}", groupId, productId);
        return ApiResponse.<SelectionGroupResponse>builder()
                .result(selectionService.getSelectionGroup(productId, groupId))
                .build();
    }
    
    @PutMapping("/groups/{groupId}")
    @Operation(summary = "Cập nhật Selection Group", 
               description = "Cập nhật thông tin nhóm lựa chọn")
    public ApiResponse<SelectionGroupResponse> updateSelectionGroup(
            @PathVariable String productId,
            @PathVariable String groupId,
            @Valid @RequestBody SelectionGroupUpdateRequest request) {
        log.info("Updating selection group {} for product: {}", groupId, productId);
        return ApiResponse.<SelectionGroupResponse>builder()
                .result(selectionService.updateSelectionGroup(productId, groupId, request))
                .build();
    }
    
    @DeleteMapping("/groups/{groupId}")
    @Operation(summary = "Xóa Selection Group", 
               description = "Xóa nhóm lựa chọn và tất cả options bên trong")
    public ApiResponse<Void> deleteSelectionGroup(
            @PathVariable String productId,
            @PathVariable String groupId) {
        log.info("Deleting selection group {} for product: {}", groupId, productId);
        selectionService.deleteSelectionGroup(productId, groupId);
        return ApiResponse.<Void>builder()
                .message("Selection group deleted successfully")
                .build();
    }
    
    // ========== Selection Option Endpoints ==========
    
    @PostMapping("/groups/{groupId}/options")
    @Operation(summary = "Thêm Selection Option", 
               description = "Thêm lựa chọn mới vào nhóm (VD: iPhone 15 Pro, Carbon)")
    public ApiResponse<SelectionOptionResponse> addOption(
            @PathVariable String productId,
            @PathVariable String groupId,
            @Valid @RequestBody SelectionOptionCreateRequest request) {
        log.info("Adding option to group {} for product: {}", groupId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.addOption(productId, groupId, request))
                .build();
    }
    
    @GetMapping("/groups/{groupId}/options")
    @Operation(summary = "Lấy tất cả Options của Group", 
               description = "Lấy danh sách tất cả lựa chọn trong nhóm")
    public ApiResponse<List<SelectionOptionResponse>> getOptions(
            @PathVariable String productId,
            @PathVariable String groupId) {
        log.info("Fetching options for group {} of product: {}", groupId, productId);
        return ApiResponse.<List<SelectionOptionResponse>>builder()
                .result(selectionService.getOptions(productId, groupId))
                .build();
    }
    
    @GetMapping("/groups/{groupId}/options/{optionId}")
    @Operation(summary = "Lấy chi tiết Option", 
               description = "Lấy thông tin chi tiết của một lựa chọn")
    public ApiResponse<SelectionOptionResponse> getOption(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId) {
        log.info("Fetching option {} from group {} for product: {}", optionId, groupId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.getOption(productId, groupId, optionId))
                .build();
    }
    
    @PutMapping("/groups/{groupId}/options/{optionId}")
    @Operation(summary = "Cập nhật Option", 
               description = "Cập nhật thông tin lựa chọn")
    public ApiResponse<SelectionOptionResponse> updateOption(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId,
            @Valid @RequestBody SelectionOptionUpdateRequest request) {
        log.info("Updating option {} in group {} for product: {}", optionId, groupId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.updateOption(productId, groupId, optionId, request))
                .build();
    }
    
    @PostMapping(value = "/groups/{groupId}/options/{optionId}/image", 
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload hình ảnh cho Option", 
               description = "Upload hình ảnh đại diện cho lựa chọn")
    public ApiResponse<SelectionOptionResponse> updateOptionImage(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId,
            @RequestParam("file") MultipartFile file) {
        log.info("Uploading image for option {} in group {} of product: {}", 
                optionId, groupId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.updateOptionImage(productId, groupId, optionId, file))
                .build();
    }
    
    @DeleteMapping("/groups/{groupId}/options/{optionId}/image")
    @Operation(summary = "Xóa hình ảnh Option", 
               description = "Xóa hình ảnh đại diện của lựa chọn")
    public ApiResponse<SelectionOptionResponse> deleteOptionImage(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId) {
        log.info("Deleting image for option {} in group {} of product: {}", 
                optionId, groupId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.deleteOptionImage(productId, groupId, optionId))
                .build();
    }
    
    @DeleteMapping("/groups/{groupId}/options/{optionId}")
    @Operation(summary = "Xóa Option", 
               description = "Xóa lựa chọn khỏi nhóm")
    public ApiResponse<Void> deleteOption(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId) {
        log.info("Deleting option {} from group {} of product: {}", optionId, groupId, productId);
        selectionService.deleteOption(productId, groupId, optionId);
        return ApiResponse.<Void>builder()
                .message("Option deleted successfully")
                .build();
    }
    
    // ========== Option-Variant Linking Endpoints ==========
    
    @PostMapping("/groups/{groupId}/options/{optionId}/link-variants")
    @Operation(summary = "Liên kết Option với Variants", 
               description = "Liên kết lựa chọn này với các variants tương ứng")
    public ApiResponse<SelectionOptionResponse> linkOptionToVariants(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId,
            @Valid @RequestBody OptionVariantLinkRequest request) {
        log.info("Linking option {} to variants for product: {}", optionId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.linkOptionToVariants(productId, groupId, optionId, request))
                .build();
    }
    
    @PostMapping("/groups/{groupId}/options/{optionId}/unlink-variants")
    @Operation(summary = "Hủy liên kết Option với Variants", 
               description = "Hủy liên kết lựa chọn này với các variants")
    public ApiResponse<SelectionOptionResponse> unlinkOptionFromVariants(
            @PathVariable String productId,
            @PathVariable String groupId,
            @PathVariable String optionId,
            @Valid @RequestBody OptionVariantLinkRequest request) {
        log.info("Unlinking option {} from variants for product: {}", optionId, productId);
        return ApiResponse.<SelectionOptionResponse>builder()
                .result(selectionService.unlinkOptionFromVariants(productId, groupId, optionId, request))
                .build();
    }
    
    // ========== User-facing Selection Endpoints ==========
    
    @GetMapping("/config")
    @Operation(summary = "Lấy cấu hình Selection cho UI", 
               description = "API cho frontend: Lấy tất cả thông tin cần thiết để render UI chọn variant")
    public ApiResponse<ProductSelectionConfigResponse> getProductSelectionConfig(
            @PathVariable String productId) {
        log.info("Fetching selection config for product: {}", productId);
        return ApiResponse.<ProductSelectionConfigResponse>builder()
                .result(selectionService.getProductSelectionConfig(productId))
                .build();
    }
    
    @PostMapping("/find-variant")
    @Operation(summary = "Tìm Variant theo Options đã chọn", 
               description = "API cho frontend: Tìm variant phù hợp dựa trên các options user đã chọn")
    public ApiResponse<VariantResponse> findVariantBySelections(
            @PathVariable String productId,
            @Valid @RequestBody FindVariantBySelectionRequest request) {
        log.info("Finding variant by selections for product: {}", productId);
        return ApiResponse.<VariantResponse>builder()
                .result(selectionService.findVariantBySelections(productId, request))
                .build();
    }
    
    @GetMapping("/available-options")
    @Operation(summary = "Lấy Options khả dụng", 
               description = "API cho frontend: Lấy danh sách options còn khả dụng dựa trên selections hiện tại")
    public ApiResponse<ProductSelectionConfigResponse> getAvailableOptions(
            @PathVariable String productId,
            @RequestParam(required = false) List<String> selectedOptionIds) {
        log.info("Getting available options for product {} with selections: {}", 
                productId, selectedOptionIds);
        return ApiResponse.<ProductSelectionConfigResponse>builder()
                .result(selectionService.getAvailableOptions(productId, selectedOptionIds))
                .build();
    }
}
