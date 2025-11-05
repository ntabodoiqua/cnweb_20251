package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.UserServiceClient;
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
        // TODO: Handle images and attributes
        
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
                .categoryName(product.getCategory().getName())
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
                .isActive(variant.isActive())
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .attributeValues(new ArrayList<>()) // TODO: implement attribute values mapping
                .build();
    }
}
