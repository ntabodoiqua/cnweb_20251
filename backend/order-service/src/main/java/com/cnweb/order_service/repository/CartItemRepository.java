package com.cnweb.order_service.repository;

import com.cnweb.order_service.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    
    List<CartItem> findByCartId(String cartId);
    
    Optional<CartItem> findByCartIdAndProductIdAndVariantId(String cartId, String productId, String variantId);

    @Modifying
    void deleteByCartId(String cartId);
}
