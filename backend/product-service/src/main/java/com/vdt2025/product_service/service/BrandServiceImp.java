package com.vdt2025.product_service.service;

import com.vdt2025.common_dto.service.FileServiceClient;
import com.vdt2025.common_dto.service.UserServiceClient;
import com.vdt2025.product_service.dto.request.brand.BrandCreationRequest;
import com.vdt2025.product_service.dto.request.brand.BrandFilterRequest;
import com.vdt2025.product_service.dto.request.brand.BrandUpdateRequest;
import com.vdt2025.product_service.dto.response.BrandResponse;
import com.vdt2025.product_service.entity.Brand;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.mapper.BrandMapper;
import com.vdt2025.product_service.repository.BrandRepository;
import com.vdt2025.product_service.repository.ProductRepository;
import com.vdt2025.product_service.specification.BrandSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BrandServiceImp implements BrandService{
    ProductRepository productRepository;
    //    UserRepository userRepository;
    BrandRepository brandRepository;
    BrandMapper brandMapper;
    UserServiceClient userServiceClient;
    FileServiceClient fileServiceClient;
//    FileStorageService fileStorageService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public BrandResponse createBrand(BrandCreationRequest request) {
        // Kiểm tra xem brand đã tồn tại chưa
        if (brandRepository.existsByNameIgnoreCase(request.getName())) {
            log.warn("Brand {} already exists", request.getName());
            throw new AppException(ErrorCode.BRAND_EXISTED);
        }
        // Tạo brand mới
        var brand = brandMapper.toBrand(request);
        brand.setActive(true);
        brand = brandRepository.save(brand);
        log.info("Brand {} created successfully by user {}", brand.getName(), "Admin");
        // Trả về thông tin brand đã tạo
        return brandMapper.toBrandResponse(brand);
    }

    @Override
    public Page<BrandResponse> searchBrands(BrandFilterRequest filter, Pageable pageable) {
        Specification<Brand> spec = BrandSpecification.withFilter(filter);
        Page<Brand> resultPage = brandRepository.findAll(spec, pageable);
        return resultPage.map(brandMapper::toBrandResponse);
    }

    @Override
    @Cacheable(value = "brands", key = "#id")
    public BrandResponse getBrandById(String id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
        log.info("Retrieved brand: {}", brand.getName());
        return brandMapper.toBrandResponse(brand);
    }

    @Override
    @CacheEvict(value = "brands", key = "#id")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public BrandResponse updateBrand(String id, BrandUpdateRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));

        // Kiểm tra xem tên brand mới có trùng với tên brand khác không
        if (!brand.getName().equalsIgnoreCase(request.getName())
                && brandRepository.existsByNameIgnoreCase(request.getName())) {
            log.warn("Brand {} already exists", request.getName());
            throw new AppException(ErrorCode.BRAND_EXISTED);
        }
        // Cập nhật thông tin danh mục
        brandMapper.updateBrand(brand, request);
        brand = brandRepository.save(brand);

        log.info("Brand {} updated successfully", brand.getName());
        return brandMapper.toBrandResponse(brand);
    }

//  Cập nhật ảnh của brand
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String setBrandThumbnail(String id, MultipartFile file) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
        // Cập nhật thumbnail
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("Invalid file type for thumbnail: {}", contentType);
            throw new AppException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        com.vdt2025.common_dto.dto.response.FileInfoResponse response = fileServiceClient.uploadPublicFile(file).getResult();
        brand.setLogoName(response.getFileName());
        brand.setLogoUrl(response.getFileUrl());
        brandRepository.save(brand);
        log.info("Thumbnail for brand {} updated successfully", brand.getName());
        return response.getFileUrl();
    }

//    @Override
//    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
//    @Transactional
//    @CacheEvict(value = "brands", key = "#id")
//    public void deleteBrand(String id) {
//        Brand brand = brandRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
//
//        // Kiểm tra quyền truy cập
//        if (!checkAccessRights(brand)) {
//            log.warn("User does not have access rights to delete brand {}", brand.getName());
//            throw new AppException(ErrorCode.UNAUTHORIZED);
//        }
//        // Xóa brand và set Các sản phầm thuộc brand này sẽ được chuyển sang chưa phân loại
//        // Tìm các sản phẩm thuộc brand này
//        List<Product> products = productRepository.findAllByBrandId(id);
//        if (!products.isEmpty()) {
//            // Chuyển các sản phẩm sang brand "Chưa phân loại"
//            Brand uncategorizedBrand = brandRepository.findByName("Chưa phân loại")
//                    .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND));
//
//            products.forEach(product -> product.setBrand(uncategorizedBrand));
//            productRepository.saveAll(products);
//            log.info("Products in brand {} have been moved to 'Chưa phân loại'", brand.getName());
//        }
//        // Xóa danh mục
//        brandRepository.delete(brand);
//        log.info("Brand {} has been deleted successfully", brand.getName());
//    }

}
