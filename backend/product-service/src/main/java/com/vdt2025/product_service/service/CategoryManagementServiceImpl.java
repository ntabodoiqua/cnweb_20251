package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.dto.response.ApiResponse;
import com.vdt2025.common_dto.dto.response.FileInfoResponse;
import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.product_service.dto.request.CreatePlatformCategoryRequest;
import com.vdt2025.product_service.dto.request.CreateStoreCategoryRequest;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.CategoryRepository;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryManagementServiceImpl implements CategoryManagementService {

    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final FileServiceClient fileServiceClient;

    // PLATFORM CATEGORIES (Admin)

    @Override
    @Transactional
    public CategoryResponse createPlatformCategory(CreatePlatformCategoryRequest request) {
        log.info("Admin is creating platform category: {}", request.getName());

        // Tên category không được trùng trong platform categories
        if (categoryRepository.existsByNameAndCategoryType(request.getName(), Category.CategoryType.PLATFORM)) {
            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.isActive())
                .categoryType(Category.CategoryType.PLATFORM)
                .createdBy("admin")
                .build();

        // Xử lý parent category (nếu có)
        if (request.getParentId() != null && !request.getParentId().isEmpty()) {
            Category parentCategory = categoryRepository.findByIdAndCategoryType(
                    request.getParentId(),
                    Category.CategoryType.PLATFORM
            ).orElseThrow(() -> new AppException(ErrorCode.PARENT_CATEGORY_NOT_FOUND));

            // Validate: Parent phải là root category (level 0)
            if (parentCategory.getLevel() != 0) {
                throw new AppException(ErrorCode.INVALID_PARENT_CATEGORY);
            }

            category.setParentCategory(parentCategory);
            category.setLevel(1); // Sub-category
        } else {
            category.setLevel(0); // Root category
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Platform category created successfully: {} (ID: {})", savedCategory.getName(), savedCategory.getId());

        return CategoryResponse.fromEntity(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updatePlatformCategory(String categoryId, CreatePlatformCategoryRequest request) {
        log.info("Admin is updating platform category: {}", categoryId);

        Category category = categoryRepository.findByIdAndCategoryType(
                categoryId,
                Category.CategoryType.PLATFORM
        ).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Validate: Tên mới không được trùng với category khác
        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByNameAndCategoryType(request.getName(), Category.CategoryType.PLATFORM)) {
            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Platform category updated successfully: {}", categoryId);

        return CategoryResponse.fromEntity(updatedCategory);
    }

    @Override
    @Transactional
    public void deletePlatformCategory(String categoryId) {
        log.info("Deleting platform category: {}", categoryId);

        Category category = categoryRepository.findByIdAndCategoryType(
                categoryId,
                Category.CategoryType.PLATFORM
        ).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Validate: Không được xóa nếu có products
        if (!category.getProducts().isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }

        // Validate: Không được xóa nếu có sub-categories
        if (!category.getSubCategories().isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_SUBCATEGORIES);
        }

        categoryRepository.delete(category);
        log.info("Platform category deleted successfully: {}", categoryId);
    }

    @Override
    public List<CategoryResponse> getAllPlatformCategories() {
        log.info("Getting all platform categories");
        List<Category> categories = categoryRepository.findAllByCategoryType(Category.CategoryType.PLATFORM);
        return categories.stream()
                .map(CategoryResponse::fromEntityWithSubCategories)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllPlatformRootCategories() {
        log.info("Getting all platform root categories");
        List<Category> rootCategories = categoryRepository.findAllPlatformRootCategories();
        return rootCategories.stream()
                .map(CategoryResponse::fromEntityWithSubCategories)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getPlatformCategoryById(String categoryId) {
        log.info("Getting platform category by ID: {}", categoryId);
        Category category = categoryRepository.findByIdAndCategoryType(
                categoryId,
                Category.CategoryType.PLATFORM
        ).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return CategoryResponse.fromEntityWithSubCategories(category);
    }

    // ===== STORE CATEGORIES (Seller) =====

    @Override
    @Transactional
    public CategoryResponse createStoreCategory(String storeId, CreateStoreCategoryRequest request, String sellerName) {
        log.info("Seller {} creating store category for store {}: {}", sellerName, storeId, request.getName());

        // Validate: Store tồn tại và thuộc về seller này
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getUserName().equals(sellerName)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // Validate: Tên category không được trùng trong store này
        if (categoryRepository.existsByNameAndCategoryTypeAndStoreId(
                request.getName(),
                Category.CategoryType.STORE,
                storeId)) {
            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS_IN_STORE);
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.isActive())
                .categoryType(Category.CategoryType.STORE)
                .store(store)
                .level(0) // Store categories luôn là root level
                .createdBy(sellerName)
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Store category created successfully: {} (ID: {})", savedCategory.getName(), savedCategory.getId());

        return CategoryResponse.fromEntity(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateStoreCategory(String storeId, String categoryId,
                                                CreateStoreCategoryRequest request, String sellerName) {
        log.info("Seller {} updating store category {} for store {}", sellerName, categoryId, storeId);

        // Validate: Store tồn tại và thuộc về seller này
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getUserName().equals(sellerName)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Validate: Tên mới không được trùng với category khác trong store
        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByNameAndCategoryTypeAndStoreId(
                        request.getName(),
                        Category.CategoryType.STORE,
                        storeId)) {
            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS_IN_STORE);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());

        Category updatedCategory = categoryRepository.save(category);
        log.info("Store category updated successfully: {}", categoryId);

        return CategoryResponse.fromEntity(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteStoreCategory(String storeId, String categoryId, String sellerId) {
        log.info("Seller {} deleting store category {} from store {}", sellerId, categoryId, storeId);

        // Validate: Store tồn tại và thuộc về seller này
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getUserName().equals(sellerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Validate: Không được xóa nếu có products
        if (!category.getProducts().isEmpty()) {
            throw new AppException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }

        categoryRepository.delete(category);
        log.info("Store category deleted successfully: {}", categoryId);
    }

    @Override
    public List<CategoryResponse> getAllStoreCategoriesByStoreId(String storeId) {
        log.info("Getting all store categories for store: {}", storeId);

        // Validate: Store tồn tại
        if (!storeRepository.existsById(storeId)) {
            throw new AppException(ErrorCode.STORE_NOT_FOUND);
        }

        List<Category> categories = categoryRepository.findAllByStoreId(storeId);
        return categories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getStoreCategoryById(String storeId, String categoryId) {
        log.info("Getting store category {} from store {}", categoryId, storeId);

        Category category = categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return CategoryResponse.fromEntity(category);
    }

    // ===== COMMON =====

    @Override
    @Transactional
    public String updateCategoryThumbnail(String categoryId, MultipartFile file) {
        log.info("Updating thumbnail for category {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Validate loại file (chỉ cho phép ảnh)
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
        );
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        // Kiểm tra người dùng có quyền cập nhật ảnh thumbnail không
        // Admin có quyền cập nhật platform categories
        // Seller chỉ có quyền cập nhật store categories của mình

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (category.getCategoryType() == Category.CategoryType.PLATFORM) {
            // Chỉ admin mới được cập nhật platform category
            if (!SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
            }
        } else if (category.getCategoryType() == Category.CategoryType.STORE) {
            // Chỉ seller của store đó mới được cập nhật
            if (!category.getStore().getUserName().equals(username)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
            }
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        ApiResponse<FileInfoResponse> response = fileServiceClient.uploadPublicFile(file);
        String imageUrl = response.getResult().getFileUrl();
        String imageName = response.getResult().getFileName();

        category.setImageUrl(imageUrl);
        category.setImageName(imageName);
        categoryRepository.save(category);

        log.info("Category thumbnail updated successfully for category {}", categoryId);
        return imageUrl;
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        log.info("Getting all categories (Platform + Store)");
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Category findCategoryById(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }
}
