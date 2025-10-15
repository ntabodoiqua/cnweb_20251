package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.UserResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.product_service.dto.request.category.CategoryCreationRequest;
import com.vdt2025.product_service.dto.request.category.CategoryFilterRequest;
import com.vdt2025.product_service.dto.request.category.CategoryUpdateRequest;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.CategoryMapper;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.specification.CategorySpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryServiceImp implements CategoryService{
    ProductRepository productRepository;
//    UserRepository userRepository;
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    UserServiceClient userServiceClient;
    FileServiceClient fileServiceClient;
//    FileStorageService fileStorageService;

    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public CategoryResponse createCategory(CategoryCreationRequest request) {
        // Kiểm tra xem danh mục đã tồn tại chưa
        if (categoryRepository.existsByName(request.getName())) {
            log.warn("Category {} already exists", request.getName());
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        // Lấy thông tin người dùng hiện tại từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse currentUser = userServiceClient.getUserByUsername(username).getResult();
        log.info("Current user: {}", username);

        // Tạo danh mục mới
        var category = categoryMapper.toCategory(request);
        category.setCreatedBy(currentUser.getId());
        category = categoryRepository.save(category);
        log.info("Category {} created successfully by user {}", category.getName(), currentUser.getUsername());
        // Trả về thông tin danh mục đã tạo
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Cacheable(value = "categories", key = "#filter.toString() + #pageable.toString()")
    public Page<CategoryResponse> searchCategories(CategoryFilterRequest filter, Pageable pageable) {
        Specification<Category> spec = CategorySpecification.withFilter(filter);
        Page<Category> resultPage = categoryRepository.findAll(spec, pageable);
        return resultPage.map(categoryMapper::toCategoryResponse);
    }

    @Override
    @Cacheable(value = "categories", key = "#id")
    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        log.info("Retrieved category: {}", category.getName());
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @CacheEvict(value = "categories", key = "#id")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public CategoryResponse updateCategory(String id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Lấy thông tin người dùng hiện tại từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Kiểm tra quyền truy cập
        if (!checkAccessRights(category)) {
            log.warn("User {} does not have access rights to update category {}", username, category.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra xem tên danh mục mới có trùng với danh mục khác không
        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByName(request.getName())) {
            log.warn("Category {} already exists", request.getName());
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        // Cập nhật thông tin danh mục
        categoryMapper.updateCategory(category, request);
        category = categoryRepository.save(category);

        log.info("Category {} updated successfully", category.getName());
        return categoryMapper.toCategoryResponse(category);
    }

    // Cập nhật thumbnail của danh mục
    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public String setCategoryThumbnail(String id, MultipartFile file) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Kiểm tra quyền truy cập
        if (!checkAccessRights(category)) {
            log.warn("User does not have access rights to update thumbnail for category {}", category.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Cập nhật thumbnail
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("Invalid file type for thumbnail: {}", contentType);
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        String fileName = fileServiceClient.uploadFile(file).getResult();
        category.setImageName(fileName);
        categoryRepository.save(category);
        log.info("Thumbnail for category {} updated successfully", category.getName());
        return fileName;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Transactional
    @CacheEvict(value = "categories", key = "#id")
    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Kiểm tra quyền truy cập
        if (!checkAccessRights(category)) {
            log.warn("User does not have access rights to delete category {}", category.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        // Xóa danh mục và set Các sản phầm thuộc danh mục này sẽ được chuyển sang danh mục Chưa phân loại
        // Tìm các sản phẩm thuộc danh mục này
        List<Product> products = productRepository.findAllByCategoryId(id);
        if (!products.isEmpty()) {
            // Chuyển các sản phẩm sang danh mục "Chưa phân loại"
            Category uncategorizedCategory = categoryRepository.findByName("Chưa phân loại")
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            products.forEach(product -> product.setCategory(uncategorizedCategory));
            productRepository.saveAll(products);
            log.info("Products in category {} have been moved to 'Chưa phân loại'", category.getName());
        }
        // Xóa danh mục
        categoryRepository.delete(category);
        log.info("Category {} has been deleted successfully", category.getName());
    }

    // Hàm chung để kiểm tra quyền truy cập
    private boolean checkAccessRights(Category category) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse currentUser = userServiceClient.getUserByUsername(username).getResult();

        boolean isAdmin = currentUser.getRole().getName().equals("ADMIN");
        boolean isOwner = category.getCreatedBy().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            log.warn("User {} is not authorized to access category {}", currentUser.getUsername(), category.getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return true;
    }

}
