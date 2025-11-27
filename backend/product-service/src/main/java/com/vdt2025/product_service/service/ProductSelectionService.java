package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.selection.*;
import com.vdt2025.product_service.dto.response.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface cho Product Selection (Seller-defined)
 * 
 * Cho phép seller tự định nghĩa các nhóm lựa chọn và options
 * để user có thể chọn variant phù hợp.
 */
public interface ProductSelectionService {
    
    // ========== Selection Group Operations ==========
    
    /**
     * Tạo mới selection group cho product
     */
    SelectionGroupResponse createSelectionGroup(String productId, SelectionGroupCreateRequest request);
    
    /**
     * Lấy thông tin selection group
     */
    SelectionGroupResponse getSelectionGroup(String productId, String groupId);
    
    /**
     * Lấy tất cả selection groups của product
     */
    List<SelectionGroupResponse> getSelectionGroups(String productId);
    
    /**
     * Cập nhật selection group
     */
    SelectionGroupResponse updateSelectionGroup(String productId, String groupId, SelectionGroupUpdateRequest request);
    
    /**
     * Xóa selection group
     */
    void deleteSelectionGroup(String productId, String groupId);
    
    // ========== Selection Option Operations ==========
    
    /**
     * Thêm option vào group
     */
    SelectionOptionResponse addOption(String productId, String groupId, SelectionOptionCreateRequest request);
    
    /**
     * Lấy thông tin option
     */
    SelectionOptionResponse getOption(String productId, String groupId, String optionId);
    
    /**
     * Lấy tất cả options của group
     */
    List<SelectionOptionResponse> getOptions(String productId, String groupId);
    
    /**
     * Cập nhật option
     */
    SelectionOptionResponse updateOption(String productId, String groupId, String optionId, 
                                         SelectionOptionUpdateRequest request);
    
    /**
     * Upload hình ảnh cho option
     */
    SelectionOptionResponse updateOptionImage(String productId, String groupId, String optionId, 
                                              MultipartFile file);
    
    /**
     * Xóa hình ảnh của option
     */
    SelectionOptionResponse deleteOptionImage(String productId, String groupId, String optionId);
    
    /**
     * Xóa option
     */
    void deleteOption(String productId, String groupId, String optionId);
    
    // ========== Option-Variant Linking ==========
    
    /**
     * Liên kết option với variants
     */
    SelectionOptionResponse linkOptionToVariants(String productId, String groupId, String optionId, 
                                                  OptionVariantLinkRequest request);
    
    /**
     * Hủy liên kết option với variants
     */
    SelectionOptionResponse unlinkOptionFromVariants(String productId, String groupId, String optionId, 
                                                      OptionVariantLinkRequest request);
    
    // ========== Variant Selection (User-facing) ==========
    
    /**
     * Lấy cấu hình selection cho UI (user chọn variant)
     * Response được tối ưu cho frontend render
     */
    ProductSelectionConfigResponse getProductSelectionConfig(String productId);
    
    /**
     * Tìm variant dựa trên các options đã chọn
     */
    VariantResponse findVariantBySelections(String productId, FindVariantBySelectionRequest request);
    
    /**
     * Lấy danh sách options available dựa trên selections hiện tại
     * (Dynamic filtering - disable options không có variant)
     */
    ProductSelectionConfigResponse getAvailableOptions(String productId, List<String> selectedOptionIds);
}
