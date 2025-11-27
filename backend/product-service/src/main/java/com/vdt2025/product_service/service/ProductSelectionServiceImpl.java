package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.product_service.dto.request.selection.*;
import com.vdt2025.product_service.dto.response.*;
import com.vdt2025.product_service.entity.*;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.SelectionMapper;
import com.vdt2025.product_service.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation cho Product Selection (Seller-defined)
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductSelectionServiceImpl implements ProductSelectionService {
    
    ProductRepository productRepository;
    ProductVariantRepository variantRepository;
    ProductSelectionGroupRepository groupRepository;
    ProductSelectionOptionRepository optionRepository;
    SelectionMapper selectionMapper;
    FileServiceClient fileServiceClient;
    CacheEvictService cacheEvictService;
    
    // ========== Selection Group Operations ==========
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionGroupResponse createSelectionGroup(String productId, SelectionGroupCreateRequest request) {
        log.info("Creating selection group '{}' for product: {}", request.getName(), productId);
        
        Product product = getProductAndCheckAccess(productId);
        
        // Check tên đã tồn tại chưa
        if (groupRepository.existsByProductIdAndNameIgnoreCase(productId, request.getName())) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NAME_EXISTS);
        }
        
        // Lấy max displayOrder nếu không được chỉ định
        Integer displayOrder = request.getDisplayOrder();
        if (displayOrder == null) {
            displayOrder = groupRepository.findMaxDisplayOrderByProductId(productId) + 1;
        }
        
        // Tạo group
        ProductSelectionGroup group = ProductSelectionGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(displayOrder)
                .isRequired(request.getIsRequired() != null ? request.getIsRequired() : true)
                .allowMultiple(request.getAllowMultiple() != null ? request.getAllowMultiple() : false)
                .affectsVariant(request.getAffectsVariant() != null ? request.getAffectsVariant() : true)
                .isActive(true)
                .product(product)
                .build();
        
        group = groupRepository.save(group);
        
        // Tạo options nếu có
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            int optionOrder = 0;
            for (SelectionOptionCreateRequest optionReq : request.getOptions()) {
                createOptionForGroup(group, optionReq, optionOrder++);
            }
        }
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Selection group '{}' created with ID: {}", group.getName(), group.getId());
        return selectionMapper.toGroupResponse(group);
    }
    
    @Override
    @Transactional(readOnly = true)
    public SelectionGroupResponse getSelectionGroup(String productId, String groupId) {
        log.info("Fetching selection group {} for product {}", groupId, productId);
        
        ProductSelectionGroup group = groupRepository.findByIdAndProductId(groupId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND));
        
        return selectionMapper.toGroupResponse(group);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SelectionGroupResponse> getSelectionGroups(String productId) {
        log.info("Fetching all selection groups for product {}", productId);
        
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        
        List<ProductSelectionGroup> groups = groupRepository
                .findByProductIdOrderByDisplayOrderAsc(productId);
        
        return selectionMapper.toGroupResponseList(groups);
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionGroupResponse updateSelectionGroup(String productId, String groupId, 
                                                        SelectionGroupUpdateRequest request) {
        log.info("Updating selection group {} for product {}", groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        ProductSelectionGroup group = groupRepository.findByIdAndProductId(groupId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND));
        
        // Check tên mới không trùng
        if (request.getName() != null && !request.getName().equalsIgnoreCase(group.getName())) {
            if (groupRepository.existsByProductIdAndNameIgnoreCaseAndIdNot(
                    productId, request.getName(), groupId)) {
                throw new AppException(ErrorCode.SELECTION_GROUP_NAME_EXISTS);
            }
            group.setName(request.getName());
        }
        
        // Update các fields
        if (request.getDescription() != null) {
            group.setDescription(request.getDescription());
        }
        if (request.getDisplayOrder() != null) {
            group.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsRequired() != null) {
            group.setRequired(request.getIsRequired());
        }
        if (request.getAllowMultiple() != null) {
            group.setAllowMultiple(request.getAllowMultiple());
        }
        if (request.getAffectsVariant() != null) {
            group.setAffectsVariant(request.getAffectsVariant());
        }
        if (request.getIsActive() != null) {
            group.setActive(request.getIsActive());
        }
        
        group = groupRepository.save(group);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Selection group {} updated successfully", groupId);
        return selectionMapper.toGroupResponse(group);
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public void deleteSelectionGroup(String productId, String groupId) {
        log.info("Deleting selection group {} from product {}", groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        ProductSelectionGroup group = groupRepository.findByIdAndProductId(groupId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND));
        
        groupRepository.delete(group);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Selection group {} deleted successfully", groupId);
    }
    
    // ========== Selection Option Operations ==========
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionOptionResponse addOption(String productId, String groupId, 
                                             SelectionOptionCreateRequest request) {
        log.info("Adding option '{}' to group {} of product {}", request.getValue(), groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        ProductSelectionGroup group = groupRepository.findByIdAndProductId(groupId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND));
        
        // Check value đã tồn tại chưa
        if (optionRepository.existsBySelectionGroupIdAndValueIgnoreCase(groupId, request.getValue())) {
            throw new AppException(ErrorCode.SELECTION_OPTION_VALUE_EXISTS);
        }
        
        // Lấy max displayOrder nếu không được chỉ định
        Integer displayOrder = request.getDisplayOrder();
        if (displayOrder == null) {
            displayOrder = optionRepository.findMaxDisplayOrderByGroupId(groupId) + 1;
        }
        
        ProductSelectionOption option = createOptionForGroup(group, request, displayOrder);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Option '{}' added with ID: {}", option.getValue(), option.getId());
        return selectionMapper.toOptionResponse(option);
    }
    
    @Override
    @Transactional(readOnly = true)
    public SelectionOptionResponse getOption(String productId, String groupId, String optionId) {
        log.info("Fetching option {} from group {} of product {}", optionId, groupId, productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        return selectionMapper.toOptionResponse(option);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SelectionOptionResponse> getOptions(String productId, String groupId) {
        log.info("Fetching all options from group {} of product {}", groupId, productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        List<ProductSelectionOption> options = optionRepository
                .findBySelectionGroupIdOrderByDisplayOrderAsc(groupId);
        
        return options.stream()
                .map(selectionMapper::toOptionResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionOptionResponse updateOption(String productId, String groupId, String optionId, 
                                                SelectionOptionUpdateRequest request) {
        log.info("Updating option {} in group {} of product {}", optionId, groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        // Check value mới không trùng
        if (request.getValue() != null && !request.getValue().equalsIgnoreCase(option.getValue())) {
            if (optionRepository.existsBySelectionGroupIdAndValueIgnoreCaseAndIdNot(
                    groupId, request.getValue(), optionId)) {
                throw new AppException(ErrorCode.SELECTION_OPTION_VALUE_EXISTS);
            }
            option.setValue(request.getValue());
        }
        
        // Update các fields
        if (request.getLabel() != null) {
            option.setLabel(request.getLabel());
        }
        if (request.getDescription() != null) {
            option.setDescription(request.getDescription());
        }
        if (request.getDisplayOrder() != null) {
            option.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getPriceAdjustment() != null) {
            option.setPriceAdjustment(request.getPriceAdjustment());
        }
        if (request.getColorCode() != null) {
            option.setColorCode(request.getColorCode());
        }
        if (request.getStockQuantity() != null) {
            option.setStockQuantity(request.getStockQuantity());
        }
        if (request.getIsAvailable() != null) {
            option.setAvailable(request.getIsAvailable());
        }
        if (request.getIsActive() != null) {
            option.setActive(request.getIsActive());
        }
        
        option = optionRepository.save(option);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Option {} updated successfully", optionId);
        return selectionMapper.toOptionResponse(option);
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionOptionResponse updateOptionImage(String productId, String groupId, String optionId, 
                                                     MultipartFile file) {
        log.info("Updating image for option {} in group {} of product {}", optionId, groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        // Validate file type
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
        );
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        
        try {
            ApiResponse<FileInfoResponse> response = fileServiceClient.uploadPublicFile(file);
            FileInfoResponse result = response.getResult();
            
            option.setImageName(result.getFileName());
            option.setImageUrl(result.getFileUrl());
            option = optionRepository.save(option);
            
            // Evict cache
            cacheEvictService.evictProductSelectionConfig(productId);
            
            log.info("Option {} image updated successfully", optionId);
            return selectionMapper.toOptionResponse(option);
        } catch (Exception e) {
            log.error("Failed to upload option image: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_CANNOT_STORED);
        }
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionOptionResponse deleteOptionImage(String productId, String groupId, String optionId) {
        log.info("Deleting image for option {} in group {} of product {}", optionId, groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        option.setImageName(null);
        option.setImageUrl(null);
        option = optionRepository.save(option);
        
        // Evict cache
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Option {} image deleted successfully", optionId);
        return selectionMapper.toOptionResponse(option);
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public void deleteOption(String productId, String groupId, String optionId) {
        log.info("Deleting option {} from group {} of product {}", optionId, groupId, productId);
        
        getProductAndCheckAccess(productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        optionRepository.delete(option);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Option {} deleted successfully", optionId);
    }
    
    // ========== Option-Variant Linking ==========
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionOptionResponse linkOptionToVariants(String productId, String groupId, String optionId, 
                                                         OptionVariantLinkRequest request) {
        log.info("Linking option {} to variants {} for product {}", 
                optionId, request.getVariantIds(), productId);
        
        getProductAndCheckAccess(productId);
        
        // Verify group belongs to product
        ProductSelectionGroup group = groupRepository.findByIdAndProductId(groupId, productId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND));
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        // Lấy variants và verify chúng thuộc product
        List<ProductVariant> variants = variantRepository.findByProductIdAndIdIn(
                productId, request.getVariantIds());
        
        if (variants.size() != request.getVariantIds().size()) {
            log.warn("Some variant IDs not found or don't belong to product {}", productId);
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        
        // Link variants to option
        for (ProductVariant variant : variants) {
            if (!option.getVariants().contains(variant)) {
                option.getVariants().add(variant);
            }
        }
        
        option = optionRepository.save(option);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Option {} linked to {} variants", optionId, variants.size());
        return selectionMapper.toOptionResponse(option);
    }
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public SelectionOptionResponse unlinkOptionFromVariants(String productId, String groupId, String optionId, 
                                                             OptionVariantLinkRequest request) {
        log.info("Unlinking option {} from variants {} for product {}", 
                optionId, request.getVariantIds(), productId);
        
        getProductAndCheckAccess(productId);
        
        // Verify group belongs to product
        if (groupRepository.findByIdAndProductId(groupId, productId).isEmpty()) {
            throw new AppException(ErrorCode.SELECTION_GROUP_NOT_FOUND);
        }
        
        ProductSelectionOption option = optionRepository.findByIdAndSelectionGroupId(optionId, groupId)
                .orElseThrow(() -> new AppException(ErrorCode.SELECTION_OPTION_NOT_FOUND));
        
        // Unlink variants from option
        option.getVariants().removeIf(v -> request.getVariantIds().contains(v.getId()));
        
        option = optionRepository.save(option);
        
        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictProductSelectionConfig(productId);
        
        log.info("Option {} unlinked from variants", optionId);
        return selectionMapper.toOptionResponse(option);
    }
    
    // ========== Variant Selection (User-facing) ==========
    
    @Override
    @Cacheable(value = "productSelectionConfig", key = "#productId")
    @Transactional(readOnly = true)
    public ProductSelectionConfigResponse getProductSelectionConfig(String productId) {
        log.info("Fetching selection config for product: {}", productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // Lấy selection groups với options (eager fetch)
        List<ProductSelectionGroup> groups = groupRepository.findByProductIdWithOptions(productId);
        
        if (groups.isEmpty()) {
            log.warn("Product {} has no selection groups", productId);
            return ProductSelectionConfigResponse.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .selectionGroups(new ArrayList<>())
                    .selectionMatrix(new HashMap<>())
                    .basePrice(product.getMinPrice())
                    .totalVariants(0)
                    .build();
        }
        
        // Build selection groups for UI
        List<ProductSelectionConfigResponse.SelectionGroupForUI> groupsForUI = new ArrayList<>();
        
        for (ProductSelectionGroup group : groups) {
            List<ProductSelectionConfigResponse.SelectionOptionForUI> optionsForUI = 
                    group.getOptions().stream()
                            .filter(ProductSelectionOption::isActive)
                            .map(opt -> ProductSelectionConfigResponse.SelectionOptionForUI.builder()
                                    .optionId(opt.getId())
                                    .value(opt.getValue())
                                    .label(opt.getDisplayLabel())
                                    .imageUrl(opt.getImageUrl())
                                    .colorCode(opt.getColorCode())
                                    .priceAdjustment(opt.getPriceAdjustment())
                                    .available(opt.isAvailable() && !opt.getVariants().isEmpty())
                                    .stockQuantity(opt.getStockQuantity())
                                    .build())
                            .collect(Collectors.toList());
            
            groupsForUI.add(ProductSelectionConfigResponse.SelectionGroupForUI.builder()
                    .groupId(group.getId())
                    .groupName(group.getName())
                    .description(group.getDescription())
                    .displayOrder(group.getDisplayOrder())
                    .required(group.isRequired())
                    .allowMultiple(group.isAllowMultiple())
                    .options(optionsForUI)
                    .build());
        }
        
        // Build selection matrix and out-of-stock combinations
        // Sử dụng query đã eager fetch selectionOptions + inventoryStock để tránh N+1
        List<ProductVariant> variants = variantRepository.findByProductIdWithSelectionsAndStock(productId);
        Map<String, String> selectionMatrix = new HashMap<>();
        List<ProductSelectionConfigResponse.OutOfStockInfo> outOfStockCombinations = new ArrayList<>();
        
        for (ProductVariant variant : variants) {
            // Lấy các option IDs mà variant này được link
            List<String> optionIds = variant.getSelectionOptions().stream()
                    .filter(opt -> opt.isActive() && opt.getSelectionGroup().isActive())
                    .map(ProductSelectionOption::getId)
                    .sorted()
                    .collect(Collectors.toList());
            
            if (!optionIds.isEmpty()) {
                String matrixKey = String.join(",", optionIds);
                selectionMatrix.put(matrixKey, variant.getId());
                
                // Kiểm tra stock = 0 (hết hàng)
                Integer availableStock = 0;
                Integer reservedStock = 0;
                if (variant.getInventoryStock() != null) {
                    availableStock = variant.getInventoryStock().getAvailableQuantity();
                    reservedStock = variant.getInventoryStock().getQuantityReserved();
                }
                
                if (availableStock == null || availableStock <= 0) {
                    outOfStockCombinations.add(
                            ProductSelectionConfigResponse.OutOfStockInfo.builder()
                                    .combinationKey(matrixKey)
                                    .optionIds(optionIds)
                                    .variantId(variant.getId())
                                    .reservedStock(reservedStock)
                                    .build()
                    );
                }
            }
        }
        
        // Lấy base price (min price của product)
        BigDecimal basePrice = product.getMinPrice();
        
        // Đếm total variants
        int totalVariants = variants.size();
        
        log.info("Built selection config with {} groups, {} matrix entries, {} out-of-stock", 
                groupsForUI.size(), selectionMatrix.size(), outOfStockCombinations.size());
        
        return ProductSelectionConfigResponse.builder()
                .productId(productId)
                .productName(product.getName())
                .selectionGroups(groupsForUI)
                .selectionMatrix(selectionMatrix)
                .outOfStockCombinations(outOfStockCombinations)
                .basePrice(basePrice)
                .totalVariants(totalVariants)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public VariantResponse findVariantBySelections(String productId, FindVariantBySelectionRequest request) {
        log.info("Finding variant for product {} with options: {}", productId, request.getOptionIds());
        
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        
        // Remove duplicates và sort
        List<String> uniqueOptionIds = request.getOptionIds().stream()
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        // Tìm variant có đúng tất cả options
        ProductVariant variant = optionRepository.findVariantByOptionIds(
                        productId, uniqueOptionIds, (long) uniqueOptionIds.size())
                .orElseThrow(() -> {
                    log.warn("No variant found for product {} with options {}", productId, uniqueOptionIds);
                    return new AppException(ErrorCode.VARIANT_NOT_FOUND);
                });
        
        log.info("Found variant {} for product {} with options {}", 
                variant.getId(), productId, uniqueOptionIds);
        
        return mapToVariantResponse(variant);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ProductSelectionConfigResponse getAvailableOptions(String productId, List<String> selectedOptionIds) {
        log.info("Getting available options for product {} with selections: {}", 
                productId, selectedOptionIds);
        
        // Lấy full config
        ProductSelectionConfigResponse config = getProductSelectionConfig(productId);
        
        if (selectedOptionIds == null || selectedOptionIds.isEmpty()) {
            return config;
        }
        
        // Lấy các options đã chọn
        List<ProductSelectionOption> selectedOptions = optionRepository
                .findByIdInWithVariants(selectedOptionIds);
        
        if (selectedOptions.isEmpty()) {
            return config;
        }
        
        // Tìm các variants có tất cả selected options
        Set<String> compatibleVariantIds = null;
        
        for (ProductSelectionOption opt : selectedOptions) {
            Set<String> variantIds = opt.getVariants().stream()
                    .map(ProductVariant::getId)
                    .collect(Collectors.toSet());
            
            if (compatibleVariantIds == null) {
                compatibleVariantIds = variantIds;
            } else {
                compatibleVariantIds.retainAll(variantIds); // Intersection
            }
        }
        
        final Set<String> finalCompatibleIds = compatibleVariantIds;
        
        // Update availability cho các options dựa trên compatible variants
        for (var group : config.getSelectionGroups()) {
            for (var option : group.getOptions()) {
                // Option available nếu có ít nhất 1 variant compatible
                // HOẶC option đang được select
                if (selectedOptionIds.contains(option.getOptionId())) {
                    continue; // Keep current availability
                }
                
                // Check xem option này có variant nào compatible không
                ProductSelectionOption opt = optionRepository.findById(option.getOptionId())
                        .orElse(null);
                if (opt != null) {
                    boolean hasCompatible = opt.getVariants().stream()
                            .anyMatch(v -> finalCompatibleIds.contains(v.getId()));
                    option.setAvailable(hasCompatible);
                }
            }
        }
        
        return config;
    }
    
    // ========== Helper Methods ==========
    
    /**
     * Lấy product và kiểm tra quyền truy cập
     */
    private Product getProductAndCheckAccess(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = username.equals("admin");
        boolean isStoreOwner = product.getStore().getUserName().equals(username);
        
        if (!isAdmin && !isStoreOwner) {
            log.warn("User {} is not authorized to access product {}", username, productId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return product;
    }
    
    /**
     * Tạo option cho group
     */
    private ProductSelectionOption createOptionForGroup(ProductSelectionGroup group, 
                                                        SelectionOptionCreateRequest request, 
                                                        Integer displayOrder) {
        ProductSelectionOption option = ProductSelectionOption.builder()
                .value(request.getValue())
                .label(request.getLabel())
                .description(request.getDescription())
                .displayOrder(displayOrder != null ? displayOrder : 
                        (request.getDisplayOrder() != null ? request.getDisplayOrder() : 0))
                .priceAdjustment(request.getPriceAdjustment())
                .colorCode(request.getColorCode())
                .stockQuantity(request.getStockQuantity())
                .isAvailable(true)
                .isActive(true)
                .selectionGroup(group)
                .build();
        
        return optionRepository.save(option);
    }
    
    /**
     * Map variant entity sang response
     */
    private VariantResponse mapToVariantResponse(ProductVariant variant) {
        // Lấy thông tin tồn kho
        Integer availableStock = null;
        Integer reservedStock = null;
        if (variant.getInventoryStock() != null) {
            availableStock = variant.getInventoryStock().getAvailableQuantity();
            reservedStock = variant.getInventoryStock().getQuantityReserved();
        }
        
        return VariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .variantName(variant.getVariantName())
                .price(variant.getPrice())
                .originalPrice(variant.getOriginalPrice())
                .soldQuantity(variant.getSoldQuantity())
                .imageName(variant.getImageName())
                .imageUrl(variant.getImageUrl())
                .isActive(variant.isActive())
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .availableStock(availableStock)
                .reservedStock(reservedStock)
                .attributeValues(variant.getAttributeValues().stream()
                        .map(av -> AttributeValueResponse.builder()
                                .id(av.getId())
                                .value(av.getValue())
                                .attributeId(av.getAttribute().getId())
                                .attributeName(av.getAttribute().getName())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}

