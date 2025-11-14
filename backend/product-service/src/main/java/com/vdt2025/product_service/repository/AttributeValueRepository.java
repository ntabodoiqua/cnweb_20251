package com.vdt2025.product_service.repository;

import com.vdt2025.product_service.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, String> {
    boolean existsByValueIgnoreCaseAndAttributeId(String name, String attributeId);

    Optional<AttributeValue> findByValueIgnoreCaseAndAttributeId(String value, String attributeId);
}
