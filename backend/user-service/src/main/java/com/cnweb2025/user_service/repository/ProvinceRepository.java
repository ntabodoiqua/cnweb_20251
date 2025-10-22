package com.cnweb2025.user_service.repository;

import com.cnweb2025.user_service.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProvinceRepository extends JpaRepository<Province, Integer> {
    // Tìm province theo name hoặc nameSlug
    Optional<Province> findByNameIgnoreCaseOrNameSlugIgnoreCase(String name, String nameSlug);
    
    // Tìm province theo nameSlug
    Optional<Province> findByNameSlugIgnoreCase(String nameSlug);
    
    // Tìm tất cả provinces sắp xếp theo tên
    List<Province> findAllByOrderByNameAsc();
    
    // Tìm kiếm province theo từ khóa trong tên hoặc fullName
    @Query("SELECT p FROM Province p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.nameSlug) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Province> searchByKeyword(String keyword);
}
