package com.vdt2025.product_service.configuration;

import com.vdt2025.product_service.entity.Category;
import com.vdt2025.product_service.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    CategoryRepository categoryRepository;

    @Bean
    ApplicationRunner applicationRunner(@Value("${app.default-admin-id}") String adminId) {
        return args -> {
            // Tạo category mặc định nếu chưa có
            String defaultCategoryName = "Chưa phân loại";
            if (!categoryRepository.existsByName(defaultCategoryName)) {
                Category defaultCategory = Category.builder()
                        .name(defaultCategoryName)
                        .description("Danh mục mặc định cho các sản phẩm chưa được phân loại")
                        .createdBy("admin")
                        .build();
                categoryRepository.save(defaultCategory);
                log.info("Default category created successfully.");
            }
        };
    }
}
