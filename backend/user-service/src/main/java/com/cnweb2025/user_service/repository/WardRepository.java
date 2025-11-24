package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.Ward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, Integer> {
    // Tìm tất cả wards theo provinceId
    List<Ward> findByProvinceIdOrderByNameAsc(Integer provinceId);
    
    // Tìm tất cả wards theo provinceId với phân trang
    Page<Ward> findByProvinceId(Integer provinceId, Pageable pageable);
    
    // Tìm ward theo slug
    Optional<Ward> findBySlugIgnoreCase(String slug);
    
    // Tìm kiếm ward theo từ khóa trong tên hoặc path
    @Query("SELECT w FROM Ward w WHERE " +
           "LOWER(w.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.nameWithType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Ward> searchByKeyword(String keyword);
    
    // Tìm kiếm ward theo từ khóa và provinceId
    @Query("SELECT w FROM Ward w WHERE w.province.id = :provinceId AND (" +
           "LOWER(w.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.nameWithType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(w.slug) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Ward> searchByKeywordAndProvinceId(@Param("keyword") String keyword, @Param("provinceId") Integer provinceId);
    
    // Đếm số lượng wards theo provinceId
    long countByProvinceId(Integer provinceId);
}
