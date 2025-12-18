package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.BannerSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BannerSlideRepository extends JpaRepository<BannerSlide,String> {
    boolean existsByDisplayOrderAndStoreIdNull(Integer displayOrder);

    boolean existsByDisplayOrderAndStoreId(Integer displayOrder, String storeID);

    List<BannerSlide> findAllByOrderByDisplayOrderAsc();

    // Lấy danh sách banner của platform (storeId = null)
    List<BannerSlide> findAllByStoreIdIsNullOrderByDisplayOrderAsc();

    // Lấy danh sách banner của store cụ thể
    List<BannerSlide> findAllByStoreIdOrderByDisplayOrderAsc(String storeId);

    // Đếm số lượng banner của platform
    long countByStoreIdIsNull();

    // Đếm số lượng banner của store
    long countByStoreId(String storeId);

    // Kiểm tra banner thuộc về store nào
    Optional<BannerSlide> findByIdAndStoreId(String id, String storeId);

    // Kiểm tra banner thuộc platform
    Optional<BannerSlide> findByIdAndStoreIdIsNull(String id);

    // Kiểm tra displayOrder có bị trùng không (ngoại trừ banner hiện tại) - cho platform
    boolean existsByDisplayOrderAndStoreIdNullAndIdNot(Integer displayOrder, String bannerId);

    // Kiểm tra displayOrder có bị trùng không (ngoại trừ banner hiện tại) - cho store
    boolean existsByDisplayOrderAndStoreIdAndIdNot(Integer displayOrder, String storeId, String bannerId);
}
