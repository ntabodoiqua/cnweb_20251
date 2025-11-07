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
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.BrandMapper;
import com.vdt2025.product_service.mapper.CategoryMapper;
import com.vdt2025.product_service.mapper.ProductImageMapper;
import com.vdt2025.product_service.mapper.StoreMapper;
import com.vdt2025.product_service.repository.*;
import com.vdt2025.product_service.specification.ProductSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation cho Product với best practices cho e-commerce
 * - Validation đầy đủ
 * - Authorization (chỉ seller của store hoặc admin mới được thao tác)
 * - Caching
 * - Transaction management
 * - Logging
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
    private final CategoryMapper categoryMapper;
    private final StoreMapper storeMapper;
    private final BrandMapper brandMapper;

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
                    .toList();
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
                    .toList();

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
        
        // Soft delete: set isActive = false
        product.setActive(false);
        productRepository.save(product);
        
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
        
        productRepository.delete(product);
        log.info("Product {} permanently deleted", product.getName());
    }

    // ========== Search & Filter ==========

    @Override
    @Cacheable(value = "product-search", key = "#filter.toString() + '-' + #pageable.toString()")
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> searchProducts(ProductFilterRequest filter, Pageable pageable) {
        log.info("Searching products with filter: {}", filter);
        
        Page<Product> productPage = productRepository.findAll(
                ProductSpecification.withFilter(filter), 
                pageable
        );
        
        return productPage.map(this::mapToProductSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getProductsByStoreId(String storeId, Pageable pageable) {
        log.info("Fetching products for store: {}", storeId);
        
        // Verify store exists
        if (!storeRepository.existsById(storeId)) {
            throw new AppException(ErrorCode.STORE_NOT_FOUND);
        }
        
        Page<Product> productPage = productRepository.findByStoreIdAndIsActiveTrue(storeId, pageable);
        return productPage.map(this::mapToProductSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getProductsByCategoryId(String categoryId, Pageable pageable) {
        log.info("Fetching products for category: {}", categoryId);
        
        // Verify category exists
        if (!categoryRepository.existsById(categoryId)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        Page<Product> productPage = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        return productPage.map(this::mapToProductSummaryResponse);
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
        if (request.getStockQuantity() != null) {
            variant.setStockQuantity(request.getStockQuantity());
        }
        if (request.getImageName() != null) {
            variant.setImageName(request.getImageName());
        }
        if (request.getIsActive() != null) {
            variant.setActive(request.getIsActive());
        }
        
        variant = variantRepository.save(variant);
        log.info("Variant {} updated successfully", variant.getSku());
        
        return mapToVariantResponse(variant);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
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
    public void deleteProductImage(String imageId) {
        log.info("Deleting product image {}", imageId);
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUND));
        checkProductAccess(productImage.getProduct());
        productImageRepository.delete(productImage);
        log.info("Product image {} deleted successfully", imageId);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
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
        return mapToVariantResponse(variantRepository.save(variant));
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
        
        log.info("Product {} status updated to {}", product.getName(), isActive);
        return mapToProductResponse(product);
    }

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public List<ProductResponse> bulkUpdateStatus(BulkStatusUpdateRequest request) {
        log.info("Bulk updating status for {} products", request.getProductIds().size());
        
        List<Product> products = productRepository.findAllById(request.getProductIds());
        
        // Check access for all products
        for (Product product : products) {
            checkProductAccess(product);
            product.setActive(request.getIsActive());
        }
        
        products = productRepository.saveAll(products);
        log.info("Bulk status update completed for {} products", products.size());
        
        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    // ========== Inventory Management ==========

    @Override
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Transactional
    public VariantResponse updateVariantStock(String productId, String variantId, Integer quantity) {
        log.info("Updating stock for variant {} to {}", variantId, quantity);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        
        checkProductAccess(product);
        
        ProductVariant variant = variantRepository.findByProductIdAndId(productId, variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        
        variant.setStockQuantity(quantity);
        variant = variantRepository.save(variant);
        
        log.info("Stock updated for variant {}", variant.getSku());
        return mapToVariantResponse(variant);
    }

    @Override
    @Transactional
    public void decreaseStock(String variantId, Integer quantity) {
        log.info("Decreasing stock for variant {} by {}", variantId, quantity);
        
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        
        if (variant.getStockQuantity() < quantity) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        int updated = variantRepository.decreaseStock(variantId, quantity);
        if (updated == 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        log.info("Stock decreased for variant {}", variant.getSku());
    }

    @Override
    @Transactional
    public void increaseStock(String variantId, Integer quantity) {
        log.info("Increasing stock for variant {} by {}", variantId, quantity);
        
        if (!variantRepository.existsById(variantId)) {
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        
        variantRepository.increaseStock(variantId, quantity);
        log.info("Stock increased for variant {}", variantId);
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
                .stockQuantity(request.getStockQuantity())
                .imageName(request.getImageName())
                .isActive(true)
                .product(product)
                .soldQuantity(0)
                .build();
        
        return variantRepository.save(variant);
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
        
        Integer totalStock = variants.stream()
                .mapToInt(ProductVariant::getStockQuantity)
                .sum();
        
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
                .category(categoryMapper.toCategoryResponse(product.getCategory()))
                .store(storeMapper.toStoreResponse(product.getStore()))
                .brand(product.getBrand() != null ? brandMapper.toBrandResponse(product.getBrand()) : null)
                .variants(variants.stream().map(this::mapToVariantResponse).collect(Collectors.toList()))
                .images(new ArrayList<>()) // TODO: implement images
                .attributes(new ArrayList<>()) // TODO: implement attributes
                .createdBy(product.getCreatedBy())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .totalStock(totalStock)
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
        String thumbnail = variants.stream()
                .map(ProductVariant::getImageName)
                .filter(name -> name != null && !name.isEmpty())
                .findFirst()
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
                .storeCategoryName(product.getStoreCategories().getFirst().getName())
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
                .stockQuantity(variant.getStockQuantity())
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
}
