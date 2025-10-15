package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.product.ProductCreationRequest;
import com.vdt2025.product_service.dto.request.product.ProductFilterRequest;
import com.vdt2025.product_service.dto.request.product.ProductUpdateRequest;
import com.vdt2025.product_service.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    ProductResponse createProduct(ProductCreationRequest request);

    ProductResponse getProductById(String id);

    ProductResponse updateProduct(String id, ProductUpdateRequest request);

    String setProductThumbnail(String id, MultipartFile file);

    Page<ProductResponse> searchProducts(ProductFilterRequest filter, Pageable pageable);

    void deleteProduct(String id);
}
