package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.CreatePlatformCategoryRequest;
import com.vdt2025.product_service.dto.request.CreateStoreCategoryRequest;
import com.vdt2025.product_service.dto.response.CategoryResponse;
import com.vdt2025.product_service.entity.Category;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service quản lý Categories
 * - Platform Categories: Do Admin quản lý (2 cấp)
 * - Store Categories: Do Seller quản lý (1 cấp)
 */
public interface CategoryManagementService {

    // ===== PLATFORM CATEGORIES (Admin) =====

    /**
     * Admin tạo platform category (có thể là root hoặc sub-category)
     */
    CategoryResponse createPlatformCategory(CreatePlatformCategoryRequest request);

    /**
     * Admin cập nhật platform category
     */
    CategoryResponse updatePlatformCategory(String categoryId, CreatePlatformCategoryRequest request);

    /**
     * Admin xóa platform category
     */
    void deletePlatformCategory(String categoryId);

    /**
     * Lấy tất cả platform categories (cấu trúc cây)
     */
    List<CategoryResponse> getAllPlatformCategories();

    /**
     * Lấy tất cả root platform categories
     */
    List<CategoryResponse> getAllPlatformRootCategories();

    /**
     * Lấy platform category theo ID (bao gồm subcategories)
     */
    CategoryResponse getPlatformCategoryById(String categoryId);

    // ===== STORE CATEGORIES (Seller) =====

    /**
     * Seller tạo store category (chỉ 1 cấp, không có parent)
     */
    CategoryResponse createStoreCategory(String storeId, CreateStoreCategoryRequest request, String sellerId);

    /**
     * Seller cập nhật store category của mình
     */
    CategoryResponse updateStoreCategory(String storeId, String categoryId, CreateStoreCategoryRequest request, String sellerName);

    /**
     * Seller xóa store category của mình
     */
    void deleteStoreCategory(String storeId, String categoryId, String sellerId);

    /**
     * Lấy tất cả store categories của một store
     */
    List<CategoryResponse> getAllStoreCategoriesByStoreId(String storeId);

    /**
     * Lấy store category theo ID
     */
    CategoryResponse getStoreCategoryById(String storeId, String categoryId);

    // ===== COMMON =====

    /**
     * Cập nhật ảnh thumbnail cho category
     */
    String updateCategoryThumbnail(String categoryId, MultipartFile file);

    /**
     * Lấy tất cả categories (Platform + Store) cho dropdown/filter
     */
    List<CategoryResponse> getAllCategories();

    /**
     * Tìm category theo ID (bất kể loại)
     */
    Category findCategoryById(String categoryId);
}