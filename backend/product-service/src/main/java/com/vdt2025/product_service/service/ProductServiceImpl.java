package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.product_service.dto.request.FindVariantRequest;
import com.vdt2025.product_service.dto.request.product.*;
import com.vdt2025.product_service.dto.response.*;
import com.vdt2025.product_service.entity.*;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.messaging.ProductEventPublisher;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.BrandMapper;
import com.vdt2025.product_service.mapper.CategoryMapper;
import com.vdt2025.product_service.mapper.ProductImageMapper;
import com.vdt2025.product_service.mapper.StoreMapper;
import com.vdt2025.product_service.repository.*;
import com.vdt2025.product_service.specification.ProductSpecification;
import com.vdt2025.product_service.util.SpecsHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service implementation cho Product với best practices cho e-commerce
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductServiceImpl implements ProductService {

    ProductRepository productRepository;
    ProductVariantRepository variantRepository;
    CategoryRepository categoryRepository;
    StoreRepository storeRepository;
    BrandRepository brandRepository;
    ProductImageMapper productImageMapper;
    UserServiceClient userServiceClient;
    FileServiceClient fileServiceClient;
    ProductImageRepository productImageRepository;
    AttributeValueRepository attributeValueRepository;
    ProductAttributeRepository productAttributeRepository;
    InventoryStockRepository inventoryStockRepository;
    private final CategoryMapper categoryMapper;
    private final StoreMapper storeMapper;
    private final BrandMapper brandMapper;
    CategoryManagementService categoryManagementService;
    private final CacheEvictService cacheEvictService;
    private final InventoryService inventoryService;
    private final ProductEventPublisher productEventPublisher;

    @Value("${product-images.max-per-product:5}")
    @NonFinal
    private int maxImagesPerProduct;

    // ========== CRUD Operations ==========
    
    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request) {
        log.info("Creating new product: {}", request.getName());
        
        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (category.isPlatformCategory() && category.isRootCategory()) {
            log.warn("Cannot create product under platform root category: {}", category.getName());
            throw new AppException(ErrorCode.INVALID_CATEGORY_FOR_PRODUCT);
        }
        
        // Validate store exists
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));
        
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isStoreOwner = store.getUserName().equals(username);
        boolean isAdmin = username.equals("admin"); // Simplified admin check
        
        if (!isAdmin && !isStoreOwner) {
            log.warn("User {} is not authorized to create product for store {}", username, store.getStoreName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Check if product name already exists in this store
        if (productRepository.existsByNameAndStoreId(request.getName(), store.getId())) {
            log.warn("Product {} already exists in store {}", request.getName(), store.getStoreName());
            throw new AppException(ErrorCode.PRODUCT_EXISTED);
        }

        List<Category> newStoreCategories = new ArrayList<>();
        // Validate store categories if provided
        if (request.getStoreCategoryIds() != null && !request.getStoreCategoryIds().isEmpty()) {
            List<String> requestedIds = request.getStoreCategoryIds();
            // Load tất cả categories hợp lệ trong 1 query
            List<Category> validCategories = categoryRepository.findByStoreId(request.getStoreId());

            // Tạo Map tra cứu nhanh: id → category
            Map<String, Category> categoryMap = validCategories.stream()
                    .collect(Collectors.toMap(Category::getId, c -> c));

            // Tìm các ID không hợp lệ (không có trong map)
            List<String> invalidIds = requestedIds.stream()
                    .filter(categoryId -> !categoryMap.containsKey(categoryId))
                    .toList();

            if (!invalidIds.isEmpty()) {
                log.warn("Store {} has no categories with IDs: {}", request.getStoreId(), invalidIds);
                throw new AppException(ErrorCode.STORE_CATEGORY_NOT_FOUND);
            }

            // Map sang entity
            newStoreCategories = requestedIds.stream()
                    .map(categoryMap::get)
                    .collect(Collectors.toCollection(ArrayList::new));
        }
        
        // Validate brand if provided
        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
        }
        
        // Create product
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .category(category)
                .store(store)
                .brand(brand)
                .isActive(true)
                .createdBy(username)
                .viewCount(0L)
                .soldCount(0)
                .ratingCount(0)
                .storeCategories(newStoreCategories)
                .build();
        
        product = productRepository.save(product);
        
        // Create variants if provided
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            BigDecimal minPrice = null;
            BigDecimal maxPrice = null;
            for (VariantCreationRequest variantReq : request.getVariants()) {
                createVariantForProduct(product, variantReq);
                // Update min/max price
                if (minPrice == null || variantReq.getPrice().compareTo(minPrice) < 0) {
                    minPrice = variantReq.getPrice();
                }
                if (maxPrice == null || variantReq.getPrice().compareTo(maxPrice) > 0) {
                    maxPrice = variantReq.getPrice();
                }
            }
            product.setMinPrice(minPrice);
            product.setMaxPrice(maxPrice);
            product = productRepository.save(product);
        }
        
        // Evict product search cache khi thêm sản phẩm mới
        cacheEvictService.evictProductSearchCache();
        
        // Publish event qua RabbitMQ để sync với Elasticsearch
        productEventPublisher.publishProductCreated(product.getId());
        
        log.info("Product {} created successfully with ID: {}", product.getName(), product.getId());
        return mapToProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(String id) {
        log.info("Fetching product with ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // Check if product is soft deleted
        if (product.isDeleted()) {
            log.warn("Product {} has been deleted", id);
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        
        return mapToProductResponse(product);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public ProductResponse updateProduct(String id, ProductUpdateRequest request) {
        log.info("Updating product with ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // Authorization check
        checkProductAccess(product);
        
        // Update fields
        if (request.getName() != null) {
            // Check if new name conflicts
            if (productRepository.existsByNameAndStoreIdAndIdNot(
                    request.getName(), product.getStore().getId(), id)) {
                throw new AppException(ErrorCode.PRODUCT_EXISTED);
            }
            product.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        
        if (request.getShortDescription() != null) {
            product.setShortDescription(request.getShortDescription());
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        if (request.getStoreCategoryIds() != null && !request.getStoreCategoryIds().isEmpty()) {
            List<String> requestedIds = request.getStoreCategoryIds();
            String storeId = product.getStore().getId();

            // Load tất cả categories hợp lệ trong 1 query
            List<Category> validCategories = categoryRepository.findByStoreId(storeId);

            // Tạo Map tra cứu nhanh: id → category
            Map<String, Category> categoryMap = validCategories.stream()
                    .collect(Collectors.toMap(Category::getId, c -> c));

            // Tìm các ID không hợp lệ (không có trong map)
            List<String> invalidIds = requestedIds.stream()
                    .filter(categoryId -> !categoryMap.containsKey(categoryId))
                    .toList();

            if (!invalidIds.isEmpty()) {
                log.warn("Store {} has no categories with IDs: {}", storeId, invalidIds);
                throw new AppException(ErrorCode.STORE_CATEGORY_NOT_FOUND);
            }

            // Map sang entity
            List<Category> newStoreCategories = requestedIds.stream()
                    .map(categoryMap::get)
                    .collect(Collectors.toCollection(ArrayList::new));

            // Cập nhật product
            product.setStoreCategories(newStoreCategories);
        }
        
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
            product.setBrand(brand);
        }
        
        if (request.getIsActive() != null) {
            product.setActive(request.getIsActive());
        }
        
        product = productRepository.save(product);
        log.info("Product {} updated successfully", product.getName());
        
        // Publish event qua RabbitMQ để sync với Elasticsearch
        productEventPublisher.publishProductUpdated(product.getId());
        
        return mapToProductResponse(product);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public void deleteProduct(String id) {
        log.info("Soft deleting product with ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        checkProductAccess(product);
        
        // Soft delete: set isDeleted = true
        product.setDeleted(true);
        productRepository.save(product);

        // Soft delete tất cả variants
        List<ProductVariant> variants = variantRepository.findByProductId(id);
        for (ProductVariant variant : variants) {
            variant.setDeleted(true);
        }
        variantRepository.saveAll(variants);
        
        // Evict product search cache khi xóa sản phẩm
        cacheEvictService.evictProductSearchCache();
        
        // Publish event qua RabbitMQ để sync với Elasticsearch
        productEventPublisher.publishProductDeleted(id);
        
        log.info("Product {} soft deleted successfully", product.getName());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public void permanentDeleteProduct(String id) {
        log.info("Permanently deleting product with ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            log.warn("Cannot permanently delete product {} with existing variants", product.getName());
            throw new AppException(ErrorCode.CANNOT_DELETE_PRODUCT_WITH_VARIANTS);
        }
        
        productRepository.delete(product);
        
        // Evict product search cache khi xóa vĩnh viễn sản phẩm
        cacheEvictService.evictProductSearchCache();
        
        log.info("Product {} permanently deleted", product.getName());
    }

    // ========== Search & Filter ==========

    @Override
    @Cacheable(
            value = "product-search",
            key = "#filter.toString() + '-' + #pageable.toString()",
            condition = "!#filter.hasStockFilter()"
    )
    @Transactional(readOnly = true)
    public PageCacheDTO<ProductSummaryResponse> searchProductsInternal(ProductFilterRequest filter, Pageable pageable) {
        // Xử lý Sort direction
        if (filter.getSortBy() != null && !filter.getSortBy().isBlank()) {
            String sortField = filter.getSortBy();
            String sortFieldLower = sortField.toLowerCase();

            // Với averageRating và ratingCount, để Specification xử lý ORDER BY với COALESCE
            // vì nullsLast() của Spring Data JPA không hoạt động đúng với tất cả DB
            boolean isRatingSort = "averagerating".equals(sortFieldLower) || "ratingcount".equals(sortFieldLower);
            
            if (!isRatingSort) {
                // 1. Mapping 'price' từ FE sang 'minPrice' trong Entity
                if ("price".equalsIgnoreCase(sortField)) {
                    sortField = "minPrice";
                }

                // 2. Mapping các trường khác (nếu cần) để tránh lỗi tương tự
                // Ví dụ FE gửi 'sold' nhưng Entity là 'soldCount'
                if ("sold".equalsIgnoreCase(sortField)) {
                    sortField = "soldCount";
                }
                Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDirection())
                        ? Sort.Direction.ASC : Sort.Direction.DESC;

                // Fix: Null values should be at the bottom (NULLS_LAST)
                Sort.Order order = (direction == Sort.Direction.ASC)
                        ? Sort.Order.asc(sortField)
                        : Sort.Order.desc(sortField);

                pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                        Sort.by(order.nullsLast()));
            } else {
                // Với rating sort, tạo Pageable không có Sort để Specification xử lý
                pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            }
        }

        // Query DB (Nặng nhất -> Cần Cache)
        Page<Product> productPage = productRepository.findAll(
                ProductSpecification.withFilter(filter),
                pageable
        );

        // Map sang DTO (Stock để mặc định là null hoặc 0)
        List<ProductSummaryResponse> content = productPage
                .map(this::mapToProductSummaryResponse)
                .getContent();

        return new PageCacheDTO<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements()
        );
    }


    // ========== Variant Management ==========

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public VariantResponse addVariant(String productId, VariantCreationRequest request) {
        log.info("Adding variant to product: {}", productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        checkProductAccess(product);
        
        // Check SKU uniqueness
        if (variantRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
        }
        
        ProductVariant variant = createVariantForProduct(product, request);
        if (product.getMinPrice() == null || variant.getPrice().compareTo(product.getMinPrice()) < 0) {
            product.setMinPrice(variant.getPrice());
        }
        if (product.getMaxPrice() == null || variant.getPrice().compareTo(product.getMaxPrice()) > 0) {
            product.setMaxPrice(variant.getPrice());
        }
        productRepository.save(product);
        cacheEvictService.evictProductDetails(productId);
        log.info("Variant {} added successfully", variant.getSku());
        return mapToVariantResponse(variant);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public VariantResponse updateVariant(String productId, String variantId, VariantUpdateRequest request) {
        log.info("Updating variant {} for product {}", variantId, productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        checkProductAccess(product);
        
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        
        // Update fields
        if (request.getVariantName() != null) {
            variant.setVariantName(request.getVariantName());
        }
        if (request.getPrice() != null) {
            variant.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            variant.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getImageName() != null) {
            variant.setImageName(request.getImageName());
        }
        
        variant = variantRepository.save(variant);
        log.info("Variant {} updated successfully", variant.getSku());
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictVariantSelectionCaches(productId);
        return mapToVariantResponse(variant);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @CacheEvict(value = "products", key = "#productId")
    public ProductImageResponse updateProductImage(String productId, MultipartFile file, Integer displayOrder) {
        log.info("Updating image for product {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        checkProductAccess(product);
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
        );
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        Long imageCount = productImageRepository.countByProductId(productId);
        if (imageCount > maxImagesPerProduct) {
            throw new AppException(ErrorCode.MAX_IMAGE_FOR_PRODUCT_REACHED);
        }
        if (productImageRepository.existsByProductIdAndDisplayOrder(productId, displayOrder)) {
            throw new AppException(ErrorCode.DUPLICATE_IMAGE_DISPLAY_ORDER);
        }

        try {
            ApiResponse<FileInfoResponse> response = fileServiceClient.uploadPublicFile(file);
            FileInfoResponse result = response.getResult();
            var productImage = ProductImage.builder()
                    .imageName(result.getFileName())
                    .imageUrl(result.getFileUrl())
                    .displayOrder(displayOrder)
                    .isPrimary(displayOrder == 1)
                    .product(product)
                    .build();
            cacheEvictService.evictProductSearchCache();
            return (
                    productImageMapper.toProductImageResponse(
                            productImageRepository.save(productImage)
                    )
            );
        } catch (Exception e) {
            throw new AppException(ErrorCode.FILE_CANNOT_STORED);
        }

    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @CacheEvict(value = "products", key = "#productId")
    public void deleteProductImage(String productId, String imageId) {
        log.info("Deleting product image {}", imageId);
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND));
        checkProductAccess(productImage.getProduct());
        productImageRepository.delete(productImage);
        log.info("Product image {} deleted successfully", imageId);
        cacheEvictService.evictProductSearchCache();
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    @CacheEvict(value = "products", key = "#productId")
    public List<ProductImageResponse> updateProductImageOrder(String productId, List<ImageOrderUpdateRequest> imageOrders) {
        log.info("Updating image order for product {}", productId);

        // Lấy product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        checkProductAccess(product);

        // Lấy toàn bộ ảnh thuộc product
        List<ProductImage> productImages = productImageRepository.findAllByProductId(productId);
        if (productImages.isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND);
        }

        // Chuyển về map để tra cứu nhanh trong bộ nhớ
        Map<String, ProductImage> imageMap = productImages.stream()
                .collect(Collectors.toMap(ProductImage::getId, img -> img));

        // Kiểm tra trùng displayOrder trong input trước khi update
        Set<Integer> seenOrders = new HashSet<>();
        for (ImageOrderUpdateRequest req : imageOrders) {
            if (!seenOrders.add(req.getDisplayOrder())) {
                throw new AppException(ErrorCode.DUPLICATE_IMAGE_DISPLAY_ORDER);
            }
        }

        // Áp dụng update vào bộ nhớ
        for (ImageOrderUpdateRequest req : imageOrders) {
            ProductImage img = imageMap.get(req.getImageId());
            if (img == null) {
                throw new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND);
            }
            if (!img.getProduct().getId().equals(productId)) {
                throw new AppException(ErrorCode.PRODUCT_IMAGE_NOT_BELONG_TO_PRODUCT);
            }

            img.setDisplayOrder(req.getDisplayOrder());
            img.setPrimary(req.getDisplayOrder() == 1);
        }

        // Lưu tất cả trong 1 query batch update
        List<ProductImage> savedImages = productImageRepository.saveAll(productImages);

        // Trả về response
        List<ProductImageResponse> responses = savedImages.stream()
                .map(productImageMapper::toProductImageResponse)
                .toList();

        log.info("Image order updated for product {}", productId);
        cacheEvictService.evictProductSearchCache();
        return responses;
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public void deleteVariant(String productId, String variantId) {
        log.info("Deleting variant {} from product {}", variantId, productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        checkProductAccess(product);
        
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        
        variantRepository.delete(variant);
        cacheEvictService.evictVariantSelectionCaches(productId);
        log.info("Variant {} deleted successfully", variant.getSku());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VariantResponse> getVariantsByProductId(String productId) {
        log.info("Fetching variants for product: {}", productId);
        
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        
        List<ProductVariant> variants = variantRepository.findByProductId(productId);
        return variants.stream()
                .map(this::mapToVariantResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public VariantResponse addVariantAttribute(String productId, String variantId, VariantAttributeRequest request) {
        log.info("Adding attribute [{}:{}] to variant {} of product {}",
                request.getAttributeId(), request.getValue(), variantId, productId);

        // Lấy variant kèm product
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Kiểm tra quyền trên product
        checkProductAccess(variant.getProduct());

        // Lấy AttributeValue theo attributeId + value
        AttributeValue attributeValue = attributeValueRepository
                .findByValueIgnoreCaseAndAttributeId(request.getValue(), request.getAttributeId())
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND));

        // Kiểm tra attribute này có thuộc về danh mục sản phẩm không
        Category category = variant.getProduct().getCategory();
        Category productCategory = (category != null) ? category.getParentCategory() : null;

        if (productCategory == null) {
            log.warn("Product {} has no valid category or parent category", variant.getProduct().getId());
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        if (!attributeValue.getAttribute().getCategories().contains(productCategory)) {
            log.warn("Attribute value {} does not belong to product category {}",
                    attributeValue.getValue(), productCategory.getName());
            throw new AppException(ErrorCode.ATTRIBUTE_NOT_APPLICABLE_TO_PRODUCT_CATEGORY);
        }
        // Kiểm tra attributes hoặc value còn active không
        if (!attributeValue.getAttribute().isActive() || !attributeValue.isActive()) {
            log.warn("Attribute value {} or its attribute is inactive", attributeValue.getValue());
            throw new AppException(ErrorCode.ATTRIBUTE_VALUE_INACTIVE);
        }

        // Nếu variant đã có attributeValue → bỏ qua
        if (variant.getAttributeValues().stream()
                .anyMatch(av -> av.getId().equals(attributeValue.getId()))) {
            log.warn("Variant {} already contains attribute value {}", variantId, attributeValue.getValue());
            return mapToVariantResponse(variant);
        }

        // Thêm và lưu
        variant.getAttributeValues().add(attributeValue);
        // Variant đã có attribute, set active nếu trước đó inactive
        if (!variant.isActive()) {
            variant.setActive(true);
            log.info("Variant {} was inactive, setting to active after adding attribute", variantId);
        }
        cacheEvictService.evictProductDetails(productId);
        return mapToVariantResponse(variantRepository.save(variant));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public VariantResponse removeVariantAttribute(String productId, String variantId, VariantAttributeRequest request) {
        log.info("Removing attribute [{}:{}] from variant {} of product {}",
                request.getAttributeId(), request.getValue(), variantId, productId);

        // Lấy variant kèm product
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Kiểm tra quyền trên product
        checkProductAccess(variant.getProduct());

        // Lấy AttributeValue theo attributeId + value
        AttributeValue attributeValue = attributeValueRepository
                .findByValueIgnoreCaseAndAttributeId(request.getValue(), request.getAttributeId())
                .orElseThrow(() -> new AppException(ErrorCode.ATTRIBUTE_VALUE_NOT_FOUND));

        // Nếu variant không có attributeValue → bỏ qua
        if (variant.getAttributeValues().stream()
                .noneMatch(av -> av.getId().equals(attributeValue.getId()))) {
            log.warn("Variant {} does not contain attribute value {}", variantId, attributeValue.getValue());
            return mapToVariantResponse(variant);
        }

        // Xóa và lưu
        variant.getAttributeValues().removeIf(av -> av.getId().equals(attributeValue.getId()));

        // Nếu không còn attribute nào, disable variant
        if (variant.getAttributeValues().isEmpty()) {
            variant.setActive(false);
            log.info("Variant {} has no attributes left, setting to inactive", variantId);
        }
        cacheEvictService.evictProductDetails(productId);
        return mapToVariantResponse(variantRepository.save(variant));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public VariantResponse updateVariantImage(String productId, String variantId, MultipartFile file) {
        log.info("Updating image for variant {} of product {}", variantId, productId);

        // Validate product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Authorization check
        checkProductAccess(product);

        // Validate variant exists and belongs to product
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Validate file type
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
        );
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }

        try {
            // Upload file to file-service
            ApiResponse<FileInfoResponse> response = fileServiceClient.uploadPublicFile(file);
            FileInfoResponse result = response.getResult();

            // Update variant with new image info
            variant.setImageName(result.getFileName());
            variant.setImageUrl(result.getFileUrl());
            variant = variantRepository.save(variant);

            // Evict cache
            cacheEvictService.evictProductDetails(productId);
            cacheEvictService.evictVariantCaches(variantId);

            log.info("Variant {} image updated successfully", variantId);
            return mapToVariantResponse(variant);
        } catch (Exception e) {
            log.error("Failed to upload variant image: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_CANNOT_STORED);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public VariantResponse deleteVariantImage(String productId, String variantId) {
        log.info("Deleting image for variant {} of product {}", variantId, productId);

        // Validate product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Authorization check
        checkProductAccess(product);

        // Validate variant exists and belongs to product
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Check if variant has image
        if (variant.getImageUrl() == null && variant.getImageName() == null) {
            log.warn("Variant {} has no image to delete", variantId);
            return mapToVariantResponse(variant);
        }

        // Remove image info from variant
        variant.setImageName(null);
        variant.setImageUrl(null);
        variant = variantRepository.save(variant);

        // Evict cache
        cacheEvictService.evictProductDetails(productId);
        cacheEvictService.evictVariantCaches(variantId);

        log.info("Variant {} image deleted successfully", variantId);
        return mapToVariantResponse(variant);
    }

    // ========== Status Management ==========

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public ProductResponse updateProductStatus(String id, boolean isActive) {
        log.info("Updating product {} status to {}", id, isActive);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        checkProductAccess(product);
        
        product.setActive(isActive);
        product = productRepository.save(product);
        // Vô hiệu hóa toàn bộ variant nếu product inactive
        if (!isActive) {
            List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
            for (ProductVariant variant : variants) {
                variant.setActive(false);
            }
            variantRepository.saveAll(variants);
            log.info("All variants of product {} have been deactivated", product.getName());
        }
        
        // Publish event qua RabbitMQ để sync với Elasticsearch
        productEventPublisher.publishProductStatusChanged(product.getId());
        
        log.info("Product {} status updated to {}", product.getName(), isActive);
        return mapToProductResponse(product);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public void bulkUpdateStatus(BulkStatusUpdateRequest request) {
        log.info("Bulk updating status for {} products", request.getProductIds().size());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = username.equals("admin"); // Simplified admin check

        List<String> productIds = request.getProductIds();

        if (!isAdmin) {
            // Check bằng 1 query duy nhất
            List<String> allowed = productRepository.findAccessibleProductIdsNative(productIds, username);
            log.info("User {} has access to {} out of {} products for bulk update",
                    username, allowed.size(), productIds.size());
            log.info("Allowed product IDs: {}", allowed);
            if (allowed.size() != productIds.size()) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        // Bulk update
        productRepository.bulkUpdateStatusNative(productIds, request.getIsActive());
        variantRepository.bulkUpdateVariantStatusNative(productIds, request.getIsActive());
        log.info("Bulk status update completed for {} products", request.getProductIds().size());
        
        // Evict caches
        for (String productId : productIds) {
            cacheEvictService.evictProductDetails(productId);
        }
        // Evict product search cache để refresh danh sách sản phẩm
        cacheEvictService.evictProductSearchCache();
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public VariantResponse updateVariantStatus(String productId, String variantId, boolean isActive) {
        log.info("Updating variant {} status to {}", variantId, isActive);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        checkProductAccess(product);
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        if (isActive && !product.isActive()) {
            log.warn("Cannot activate variant {} because parent product {} is inactive",
                    variantId, productId);
            throw new AppException(ErrorCode.CANNOT_ACTIVATE_VARIANT_OF_INACTIVE_PRODUCT);
        }
        variant.setActive(isActive);
        variant = variantRepository.save(variant);
        log.info("Variant {} status updated to {}", variant.getSku(), isActive);
        cacheEvictService.evictProductDetails(productId);
        return mapToVariantResponse(variant);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public List<VariantResponse> bulkUpdateVariantStatus(String productId, BulkVariantStatusUpdateRequest request) {
        log.info("Bulk updating status for {} variants of product {}",
                request.getVariantIds().size(), productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        checkProductAccess(product);
        List<ProductVariant> variants = variantRepository.findByProductIdAndIdIn(
                productId, request.getVariantIds());
        if (request.getIsActive() && !product.isActive()) {
            log.warn("Cannot activate variants of product {} because it is inactive", productId);
            throw new AppException(ErrorCode.CANNOT_ACTIVATE_VARIANT_OF_INACTIVE_PRODUCT);
        }
        for (ProductVariant variant : variants) {
            variant.setActive(request.getIsActive());
        }
        variants = variantRepository.saveAll(variants);
        log.info("Bulk status update completed for {} variants", variants.size());
        cacheEvictService.evictProductDetails(productId);
        return variants.stream()
                .map(this::mapToVariantResponse)
                .collect(Collectors.toList());
    }
    // ========== Statistics & Metrics ==========

    @Override
    @Transactional
    public void incrementViewCount(String productId) {
        productRepository.incrementViewCount(productId);
    }

    @Override
    @Transactional
    public void updateSoldCount(String productId, Integer quantity) {
        productRepository.updateSoldCount(productId, quantity);
    }

    @Override
    @Transactional
    public void updateSoldCountBatch(Map<String, Integer> variantQuantityMap) {
        if (variantQuantityMap == null || variantQuantityMap.isEmpty()) {
            log.debug("updateSoldCountBatch called with empty map, skipping");
            return;
        }

        log.info("Updating sold count for {} variants", variantQuantityMap.size());

        // Lấy thông tin variants để biết productId tương ứng
        List<String> variantIds = new ArrayList<>(variantQuantityMap.keySet());
        List<ProductVariant> variants = variantRepository.findAllById(variantIds);

        if (variants.isEmpty()) {
            log.warn("No variants found for IDs: {}", variantIds);
            return;
        }

        // Map productId -> tổng quantity bán được (gom các variants cùng product)
        Map<String, Integer> productQuantityMap = new HashMap<>();

        for (ProductVariant variant : variants) {
            String variantId = variant.getId();
            Integer quantity = variantQuantityMap.get(variantId);

            if (quantity == null || quantity <= 0) {
                continue;
            }

            // Cập nhật soldQuantity cho variant
            int updatedRows = variantRepository.updateSoldQuantity(variantId, quantity);
            if (updatedRows > 0) {
                log.debug("Updated soldQuantity for variant {}: +{}", variantId, quantity);
            }

            // Gom quantity theo productId
            String productId = variant.getProduct().getId();
            productQuantityMap.merge(productId, quantity, Integer::sum);
        }

        // Cập nhật soldCount cho các products
        for (Map.Entry<String, Integer> entry : productQuantityMap.entrySet()) {
            String productId = entry.getKey();
            Integer totalQuantity = entry.getValue();

            int updatedRows = productRepository.updateSoldCount(productId, totalQuantity);
            if (updatedRows > 0) {
                log.debug("Updated soldCount for product {}: +{}", productId, totalQuantity);
            }

            // Evict cache cho product đã cập nhật
            cacheEvictService.evictProductDetails(productId);
        }

        log.info("Successfully updated sold count for {} variants across {} products", 
                variants.size(), productQuantityMap.size());
    }

    // ========== Helper Methods ==========

    private void checkProductAccess(Product product) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = username.equals("admin"); // Simplified admin check
        boolean isStoreOwner = product.getStore().getUserName().equals(username);
        
        if (!isAdmin && !isStoreOwner) {
            log.warn("User {} is not authorized to access product {}", username, product.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private ProductVariant createVariantForProduct(Product product, VariantCreationRequest request) {
        ProductVariant variant = ProductVariant.builder()
                .sku(request.getSku())
                .variantName(request.getVariantName())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .imageName(request.getImageName())
                .isActive(true)
                .product(product)
                .soldQuantity(0)
                .build();
        
        var res =  variantRepository.save(variant);
        // Khởi tạo inventory cho variant
        inventoryService.createInventoryStock(res.getId(), request.getStockQuantity());
        return res;
    }

    private String generateSKU(Product product) {
        return "SKU-" + product.getId().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();
    }

    private ProductResponse mapToProductResponse(Product product) {
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        
        // Calculate min/max price and total stock
        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        
        BigDecimal maxPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

//        Integer totalStock = variants.stream()
//                .mapToInt(ProductVariant::getStockQuantity)
//                .sum();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .viewCount(product.getViewCount())
                .soldCount(product.getSoldCount())
                .averageRating(product.getAverageRating())
                .ratingCount(product.getRatingCount())
                .isActive(product.isActive())
                .category(CategoryResponse.fromEntityWithSubCategories(product.getCategory()))
                .store(storeMapper.toStoreResponse(product.getStore()))
                .brand(product.getBrand() != null ? brandMapper.toBrandResponse(product.getBrand()) : null)
                .variants(variants.stream().map(this::mapToVariantResponse).collect(Collectors.toList()))
                .images(getProductImages(product.getId()))
                .createdBy(product.getCreatedBy())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
//                .totalStock(totalStock)
                .storeCategories(
                        Optional.ofNullable(product.getStoreCategories())
                                .filter(list -> !list.isEmpty())
                                .map(list -> list.stream()
                                        .map(categoryMapper::toCategoryResponse)
                                        .toList()
                                )
                                .orElse(null)
                )
                .build();
    }

    private ProductSummaryResponse mapToProductSummaryResponse(Product product) {
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        
        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        
        BigDecimal maxPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        
        // Get first image as thumbnail
        String thumbnail = productImageRepository.findFirstByProductIdOrderByDisplayOrderAsc(product.getId())
                .map(ProductImage::getImageUrl)
                .orElse(null);
        
        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .shortDescription(product.getShortDescription())
                .thumbnailImage(thumbnail)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .soldCount(product.getSoldCount())
                .averageRating(product.getAverageRating())
                .ratingCount(product.getRatingCount())
                .isActive(product.isActive())
                .storeName(product.getStore().getStoreName())
                .storeId(product.getStore().getId())
                .platformCategoryName(product.getCategory().getName())
                .storeCategoryName(
                        Optional.ofNullable(product.getStoreCategories())
                                .filter(list -> !list.isEmpty())
                                .map(list -> list.stream()
                                        .map(Category::getName)
                                        .toList()
                                )
                                .orElse(null)
                )
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .createdAt(product.getCreatedAt())
                .build();
    }

    private VariantResponse mapToVariantResponse(ProductVariant variant) {
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
                .attributeValues(variant.getAttributeValues().stream()
                        .map(this::mapToAttributeValueResponse)
                        .collect(Collectors.toList()))
                .build();
    }
    
    private AttributeValueResponse mapToAttributeValueResponse(AttributeValue value) {
        return AttributeValueResponse.builder()
                .id(value.getId())
                .value(value.getValue())
                .attributeId(value.getAttribute().getId())
                .attributeName(value.getAttribute().getName())
                .build();
    }

    // Lấy list ảnh của product
    private List<ProductImageResponse> getProductImages(String productId) {
        List<ProductImage> images = productImageRepository.findAllByProductIdOrderByDisplayOrderAsc(productId);
        return images.stream()
                .map(productImageMapper::toProductImageResponse)
                .collect(Collectors.toList());
    }

    
    // ========== Variant Selection Implementation ==========
    
    /**
     * Lấy danh sách options để chọn variant
     * Algorithm:
     * 1. Lấy tất cả variants active của product (eager fetch attribute values)
     * 2. Collect tất cả unique attributes và values từ các variants
     * 3. Build variant matrix: key = "val1,val2,val3" (sorted) -> variantId
     * 4. Mark available options (có ít nhất 1 variant với option đó)
     */
    @Override
    @Cacheable(value = "variantSelectionOptions", key = "#productId")
    public ProductVariantSelectionResponse getProductVariantSelectionOptions(String productId) {
        log.info("Fetching variant selection options for product: {}", productId);
        
        // Validate product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        // Get all active variants with attribute values (eager fetch to avoid N+1)
        List<ProductVariant> variants = variantRepository.findByProductIdWithAttributeValues(productId);
        
        if (variants.isEmpty()) {
            log.warn("Product {} has no variants", productId);
            return ProductVariantSelectionResponse.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .attributeGroups(new ArrayList<>())
                    .variantMatrix(new HashMap<>())
                    .totalVariants(0)
                    .build();
        }
        
        // Step 1: Collect all unique attributes and their values across all variants
        Map<String, Set<AttributeValue>> attributeValuesMap = new LinkedHashMap<>();
        
        for (ProductVariant variant : variants) {
            for (AttributeValue value : variant.getAttributeValues()) {
                String attrId = value.getAttribute().getId();
                attributeValuesMap.putIfAbsent(attrId, new LinkedHashSet<>());
                attributeValuesMap.get(attrId).add(value);
            }
        }
        
        // Step 2: Build attribute groups with options
        List<VariantAttributeGroup> attributeGroups = new ArrayList<>();
        
        for (Map.Entry<String, Set<AttributeValue>> entry : attributeValuesMap.entrySet()) {
            String attributeId = entry.getKey();
            Set<AttributeValue> values = entry.getValue();
            
            if (values.isEmpty()) continue;
            
            // Get attribute name from first value
            String attributeName = values.iterator().next().getAttribute().getName();
            
            // Build options for this attribute
            List<VariantAttributeOption> options = values.stream()
                    .map(value -> VariantAttributeOption.builder()
                            .valueId(value.getId())
                            .value(value.getValue())
                            .available(true) // All values in map are available (có ít nhất 1 variant)
                            .build())
                    .collect(Collectors.toList());
            
            attributeGroups.add(VariantAttributeGroup.builder()
                    .attributeId(attributeId)
                    .attributeName(attributeName)
                    .options(options)
                    .build());
        }
        
        // Step 3: Build variant matrix for quick lookup
        // Key: "valueId1,valueId2,valueId3" (sorted), Value: variantId
        Map<String, String> variantMatrix = new HashMap<>();
        
        for (ProductVariant variant : variants) {
            // Sort attribute value IDs to ensure consistent key
            String matrixKey = variant.getAttributeValues().stream()
                    .map(AttributeValue::getId)
                    .sorted()
                    .collect(Collectors.joining(","));
            
            variantMatrix.put(matrixKey, variant.getId());
        }
        
        log.info("Built variant selection with {} attribute groups, {} total variants", 
                attributeGroups.size(), variants.size());
        
        return ProductVariantSelectionResponse.builder()
                .productId(productId)
                .productName(product.getName())
                .attributeGroups(attributeGroups)
                .variantMatrix(variantMatrix)
                .totalVariants(variants.size())
                .build();
    }
    
    /**
     * Tìm variant dựa trên combination của attribute values
     * Algorithm:
     * 1. Validate request (không null, không empty)
     * 2. Sort attribute value IDs để đảm bảo consistent lookup
     * 3. Query database với HAVING COUNT để match EXACT combination
     * 4. Return variant hoặc throw exception nếu không tìm thấy
     */
    @Override
    @Cacheable(value = "variantByAttributes", key = "#productId + '-' + T(java.util.Arrays).toString(#request.getAttributeValueIds().toArray())")
    public VariantResponse findVariantByAttributes(String productId, FindVariantRequest request) {
        log.info("Finding variant for product {} with attributes: {}", 
                productId, request.getAttributeValueIds());
        
        // Validate product exists
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        
        // Validate request
        if (request.getAttributeValueIds() == null || request.getAttributeValueIds().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        // Remove duplicates and sort for consistent query
        List<String> uniqueAttributeValueIds = request.getAttributeValueIds().stream()
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        // Find variant with exact match of attribute values
        ProductVariant variant = variantRepository
                .findByProductIdAndAttributeValues(
                        productId, 
                        uniqueAttributeValueIds, 
                        (long) uniqueAttributeValueIds.size()
                )
                .orElseThrow(() -> {
                    log.warn("No variant found for product {} with attributes {}", 
                            productId, uniqueAttributeValueIds);
                    return new AppException(ErrorCode.VARIANT_NOT_FOUND);
                });
        
        log.info("Found variant {} for product {} with attributes {}", 
                variant.getId(), productId, uniqueAttributeValueIds);
        
        return mapToVariantResponse(variant);
    }

    // ========== Internal Service Communication ==========

    @Override
    @Transactional(readOnly = true)
    public List<VariantInternalDTO> getVariantsForInternal(List<String> variantIds) {
        // 1. Query tối ưu: Variant + Product + Store + Stock (1 SQL query)
        List<ProductVariant> variants = variantRepository.findAllByIdWithDetails(variantIds);

        return variants.stream()
                .map(variant -> {
                    // Xử lý Stock (Null safety)
                    int quantity = 0;
                    if (variant.getInventoryStock() != null) {
                        quantity = variant.getInventoryStock().getAvailableQuantity();
                    }

                    // Lấy thông tin Product và Store (Giả định Product luôn có Store do rằng buộc nullable=false)
                    Product product = variant.getProduct();
                    Store store = product.getStore();

                    return VariantInternalDTO.builder()
                            .id(variant.getId())
                            .productId(product.getId())
                            .variantName(variant.getVariantName())
                            .sku(variant.getSku())
                            .productName(product.getName())
                            .imageUrl(variant.getImageUrl())
                            .stockQuantity(quantity)
                            .price(variant.getPrice())
                            .originalPrice(variant.getOriginalPrice())
                            .isActive(variant.isActive())

                            // --- MAPPING STORE INFO ---
                            .storeId(store.getId())
                            .storeName(store.getStoreName())
                            .storeLogo(store.getLogoUrl())
                            .storeOwnerUsername(store.getUserName()) // Username của seller
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VariantValidationDTO> validateVariants(List<String> variantIds) {
        // 1. Fail-fast
        if (variantIds == null || variantIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<VariantValidationDTO> result = new ArrayList<>();

        // 2. Query tối ưu: Lấy Variant + Product + Store + Stock
        List<ProductVariant> variants = variantRepository.findAllByIdWithDetails(variantIds);

        // 3. Map để truy xuất nhanh
        Map<String, ProductVariant> variantMap = variants.stream()
                .collect(Collectors.toMap(ProductVariant::getId, Function.identity()));

        // 4. Duyệt theo danh sách ID đầu vào
        for (String id : variantIds) {
            ProductVariant variant = variantMap.get(id);

            // Case: Không tìm thấy
            if (variant == null) {
                result.add(VariantValidationDTO.builder()
                        .variantId(id)
                        .isActive(false)
                        .isDeleted(true)
                        .inStock(false)
                        .availableStock(0)
                        .message("Variant not found")
                        .build());
                continue;
            }

            // Lấy các entity liên quan
            Product product = variant.getProduct();
            Store store = product.getStore();
            InventoryStock stock = variant.getInventoryStock();

            // Tính toán Stock
            int availableQty = (stock != null) ? stock.getAvailableQuantity() : 0;

            // --- LOGIC VALIDATION QUAN TRỌNG ---
            // Một item khả dụng khi: Variant OK + Product OK + STORE OK
            boolean isVariantActive = variant.isActive() && !variant.isDeleted();
            boolean isProductActive = product.isActive() && !product.isDeleted();
            boolean isStoreActive = store.isActive(); // Check thêm trạng thái cửa hàng

            // Kết luận cuối cùng
            boolean itemActive = isVariantActive && isProductActive && isStoreActive;

            // Tạo thông báo lỗi cụ thể
            String message = null;
            if (!itemActive) {
                if (!isStoreActive) message = "Store is inactive";
                else if (!isProductActive) message = "Product is inactive";
                else message = "Variant is inactive";
            }

            result.add(VariantValidationDTO.builder()
                    .variantId(variant.getId())
                    .isActive(itemActive)
                    .isDeleted(variant.isDeleted())
                    .inStock(availableQty > 0)
                    .availableStock(availableQty)
                    .message(message)
                    .build());
        }

        return result;
    }

    // ========== Specs & Metadata Management ==========

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public ProductSpecsResponse updateProductSpecs(String productId, ProductSpecsUpdateRequest request) {
        log.info("Updating specs for product: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Authorization check
        checkProductAccess(product);

        // Validate specs data structure
        SpecsHelper.validateSpecs(request.getSpecs());
        
        // Normalize specs values
        SpecsHelper.normalizeSpecs(request.getSpecs());

        // Update specs
        product.setSpecs(request.getSpecs());
        productRepository.save(product);

        // Evict cache
        cacheEvictService.evictProductCaches(productId);

        return ProductSpecsResponse.builder()
                .productId(product.getId())
                .specs(product.getSpecs())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "productSpecs", key = "#productId")
    public ProductSpecsResponse getProductSpecs(String productId) {
        log.info("Getting specs for product: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return ProductSpecsResponse.builder()
                .productId(product.getId())
                .specs(product.getSpecs())
                .build();
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public void deleteProductSpecs(String productId) {
        log.info("Deleting specs for product: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Authorization check
        checkProductAccess(product);

        // Delete specs (set to null or empty map)
        product.setSpecs(null);
        productRepository.save(product);

        // Evict cache
        cacheEvictService.evictProductCaches(productId);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public VariantMetadataResponse updateVariantMetadata(String productId, String variantId, 
                                                         VariantMetadataUpdateRequest request) {
        log.info("Updating metadata for variant: {} of product: {}", variantId, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Verify variant belongs to product
        if (!variant.getProduct().getId().equals(productId)) {
            throw new AppException(ErrorCode.VARIANT_NOT_BELONG_TO_PRODUCT);
        }

        // Authorization check
        checkProductAccess(product);

        // Validate metadata data structure
        SpecsHelper.validateSpecs(request.getMetadata());
        
        // Normalize metadata values
        SpecsHelper.normalizeSpecs(request.getMetadata());

        // Update metadata
        variant.setMetadata(request.getMetadata());
        variantRepository.save(variant);

        // Evict cache
        cacheEvictService.evictVariantCaches(variantId);

        return VariantMetadataResponse.builder()
                .variantId(variant.getId())
                .productId(productId)
                .metadata(variant.getMetadata())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "variantSpecs", key = "#variantId")
    public VariantMetadataResponse getVariantMetadata(String productId, String variantId) {
        log.info("Getting metadata for variant: {} of product: {}", variantId, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Verify variant belongs to product
        if (!variant.getProduct().getId().equals(productId)) {
            throw new AppException(ErrorCode.VARIANT_NOT_BELONG_TO_PRODUCT);
        }

        return VariantMetadataResponse.builder()
                .variantId(variant.getId())
                .productId(productId)
                .metadata(variant.getMetadata())
                .build();
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public void deleteVariantMetadata(String productId, String variantId) {
        log.info("Deleting metadata for variant: {} of product: {}", variantId, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        // Verify variant belongs to product
        if (!variant.getProduct().getId().equals(productId)) {
            throw new AppException(ErrorCode.VARIANT_NOT_BELONG_TO_PRODUCT);
        }

        // Authorization check
        checkProductAccess(product);

        // Delete metadata (set to null or empty map)
        variant.setMetadata(null);
        variantRepository.save(variant);

        // Evict cache
        cacheEvictService.evictVariantCaches(variantId);
    }
}
