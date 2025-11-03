package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.UserResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.product_service.dto.request.product.ProductCreationRequest;
import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.dto.request.product.ProductUpdateRequest;
import com.vdt2025.product_service.dto.response.ProductResponse;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.ProductMapper;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.specification.ProductSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductServiceImp implements ProductService {
//    private final UserRepository userRepository;
    ProductMapper productMapper;
    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    UserServiceClient userServiceClient;
    FileServiceClient fileServiceClient;
//    FileStorageService fileStorageService;

    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ProductResponse createProduct(ProductCreationRequest request) {
        // Kiểm tra xem sản phẩm đã tồn tại chưa
        if (productRepository.existsByName(request.getName())) {
            log.warn("Product {} already exists", request.getName());
            throw new AppException(ErrorCode.PRODUCT_EXISTED);
        }
        // Kiểm tra xem danh mục có tồn tại không
        var category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse user = userServiceClient.getUserByUsername(username).getResult();
        // Tạo sản phẩm mới
        var product = productMapper.toProduct(request);
//        product.setImage_name(null);
        product.setCreatedBy(user.getId());
        product.setActive(true);
        product.setCategory(category);
        product = productRepository.save(product);
        log.info("Product {} created successfully", product.getName());
        return productMapper.toProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(String id) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    // Hàm hỗ trợ kiểm tra quyền truy cập
    // Chỉ admin hoặc người tạo sản phẩm mới có quyền truy cập
    private boolean checkAccessRights(Product product) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse currentUser = userServiceClient.getUserByUsername(username).getResult();
        boolean isAdmin = currentUser.getRole().getName().equals("ADMIN");
        boolean isOwner = product.getCreatedBy().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            log.warn("User {} is not authorized to access product {}", currentUser.getUsername(), product.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return true;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(String id) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        // Kiểm tra quyền truy cập
        if (!checkAccessRights(product)) {
            log.warn("User does not have access rights to delete product {}", product.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        productRepository.delete(product);
        log.info("Product {} deleted successfully", product.getName());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateProduct(String id, ProductUpdateRequest request) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        // Kiểm tra quyền truy cập
        if (!checkAccessRights(product)) {
            log.warn("User does not have access rights to update product {}", product.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        // Cập nhật thông tin sản phẩm
        productMapper.updateProduct(product, request);
        // Kiểm tra tên danh mục có tồn tại không
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }
        product = productRepository.save(product);
        log.info("Product {} updated successfully", product.getName());
        return productMapper.toProductResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "#filter.toString() + #pageable.toString()")
    public Page<ProductResponse> searchProducts(ProductFilterRequest filter, Pageable pageable) {
        log.info("Searching products with filter: {}", filter);
        // Tạo truy vấn tìm kiếm với các điều kiện từ filter
        return productRepository.findAll(ProductSpecification.withFilter(filter),pageable)
                .map(productMapper::toProductResponse);
    }

//    @Override
//    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
//    public String setProductThumbnail(String id, MultipartFile file) {
//
//        var product = productRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
//        // Kiểm tra quyền truy cập
//        if (!checkAccessRights(product)) {
//            log.warn("User does not have access rights to update thumbnail for product {}", product.getName());
//            throw new AppException(ErrorCode.UNAUTHORIZED);
//        }
//        // Kiểm tra loại tệp
//        String contentType = file.getContentType();
//        if (contentType == null || !contentType.startsWith("image/")) {
//            log.warn("Invalid file type for thumbnail: {}", contentType);
//            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
//        }
//        // Lưu tệp và cập nhật tên ảnh
//        String fileName = fileServiceClient.uploadFile(file).getResult();
////        product.setImage_name(fileName);
//        productRepository.save(product);
//        log.info("Thumbnail for product {} updated successfully", product.getName());
//        return fileName;
//    }
}
