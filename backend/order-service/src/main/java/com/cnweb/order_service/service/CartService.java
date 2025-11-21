package com.cnweb.order_service.service;

import com.cnweb.order_service.client.ProductClient;
import com.cnweb.order_service.client.ProductValidationDTO;
import com.cnweb.order_service.client.VariantInfoDTO;
import com.cnweb.order_service.dto.request.AddToCartRequest;
import com.cnweb.order_service.dto.request.UpdateCartItemRequest;
import com.cnweb.order_service.dto.response.CartDTO;
import com.cnweb.order_service.dto.response.CartItemDTO;
import com.cnweb.order_service.repository.RedisCartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final RedisCartRepository redisCartRepository;
    private final CartPersistenceService cartPersistenceService;
    private final ProductClient productClient;

    /**
     * Get cart for user or guest session
     */
    public CartDTO getCart(String identifier) {
        // Try to get from Redis first
        CartDTO cart = redisCartRepository.getCart(identifier);
        
        // If not found in Redis and it's a user (not guest), try to load from database
        if (cart == null && !identifier.startsWith("guest:")) {
            cart = cartPersistenceService.loadCartFromDatabase(identifier);
        }
        
        // If still null, return empty cart
        if (cart == null) {
            cart = CartDTO.builder()
                    .sessionId(identifier.startsWith("guest:") ? identifier : null)
                    .userName(identifier.startsWith("guest:") ? null : identifier)
                    .items(new java.util.ArrayList<>())
                    .totalItems(0)
                    .totalPrice(java.math.BigDecimal.ZERO)
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        
        return cart;
    }

    /**
     * Add item to cart with product validation
     */
    public CartDTO addToCart(String identifier, AddToCartRequest request) {
        // Validate product/variant from product-service
        try {
            if (request.getVariantId() != null && !request.getVariantId().isEmpty()) {
                // Validate variant
                VariantInfoDTO variant = productClient.getVariantById(request.getVariantId()).getResult();
                
                if (variant == null || !variant.isActive() || variant.isDeleted()) {
                    throw new RuntimeException("Product variant is not available");
                }
                
                if (variant.getStockQuantity() < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + variant.getStockQuantity());
                }
                
                // Use product-service price to ensure accuracy
                request.setPrice(variant.getPrice());
                request.setOriginalPrice(variant.getOriginalPrice());
                request.setProductName(variant.getProductName());
                request.setVariantName(variant.getVariantName());
                request.setImageUrl(variant.getImageUrl());
            } else {
                // Validate product only
                List<ProductValidationDTO> validations = productClient.validateProducts(
                        Collections.singletonList(request.getProductId()),
                        null
                ).getResult();
                
                if (validations.isEmpty() || !validations.get(0).isValid()) {
                    throw new RuntimeException("Product is not available");
                }
                
                ProductValidationDTO validation = validations.get(0);
                if (!validation.isInStock()) {
                    throw new RuntimeException("Product is out of stock");
                }
                
                if (validation.getAvailableStock() < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + validation.getAvailableStock());
                }
                
                // Use product-service price
                request.setPrice(validation.getCurrentPrice());
            }
        } catch (Exception e) {
            log.error("Error validating product for cart: {}", e.getMessage());
            throw new RuntimeException("Failed to validate product: " + e.getMessage());
        }

        CartItemDTO item = CartItemDTO.builder()
                .productId(request.getProductId())
                .productName(request.getProductName())
                .variantId(request.getVariantId())
                .variantName(request.getVariantName())
                .imageUrl(request.getImageUrl())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .build();

        CartDTO cart = redisCartRepository.addItem(identifier, item);
        
        // Trigger async persistence for authenticated users
        if (!identifier.startsWith("guest:")) {
            cartPersistenceService.persistCartToDatabase(identifier);
        }
        
        log.info("Added item to cart for identifier: {}", identifier);
        return cart;
    }

    /**
     * Update cart item quantity with stock validation
     */
    public CartDTO updateCartItem(String identifier, UpdateCartItemRequest request) {
        // Validate stock availability
        try {
            if (request.getVariantId() != null && !request.getVariantId().isEmpty()) {
                VariantInfoDTO variant = productClient.getVariantById(request.getVariantId()).getResult();
                
                if (variant != null && variant.getStockQuantity() < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + variant.getStockQuantity());
                }
            }
        } catch (Exception e) {
            log.error("Error validating stock for cart update: {}", e.getMessage());
        }

        CartDTO cart = redisCartRepository.updateItem(
                identifier,
                request.getProductId(),
                request.getVariantId(),
                request.getQuantity()
        );
        
        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }
        
        // Trigger async persistence for authenticated users
        if (!identifier.startsWith("guest:")) {
            cartPersistenceService.persistCartToDatabase(identifier);
        }
        
        log.info("Updated cart item for identifier: {}", identifier);
        return cart;
    }

    /**
     * Remove item from cart
     */
    public CartDTO removeFromCart(String identifier, String productId, String variantId) {
        CartDTO cart = redisCartRepository.removeItem(identifier, productId, variantId);
        
        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }
        
        // Trigger async persistence for authenticated users
        if (!identifier.startsWith("guest:")) {
            cartPersistenceService.persistCartToDatabase(identifier);
        }
        
        log.info("Removed item from cart for identifier: {}", identifier);
        return cart;
    }

    /**
     * Clear entire cart
     */
    public void clearCart(String identifier) {
        redisCartRepository.clearCart(identifier);
        
        // Trigger async persistence for authenticated users
        if (!identifier.startsWith("guest:")) {
            cartPersistenceService.persistCartToDatabase(identifier);
        }
        
        log.info("Cleared cart for identifier: {}", identifier);
    }

    /**
     * Merge guest cart into user cart after login
     */
    public CartDTO mergeCart(String guestSessionId, String userName) {
        CartDTO mergedCart = redisCartRepository.mergeCart(guestSessionId, userName);
        
        // Trigger async persistence for the merged cart
        cartPersistenceService.persistCartToDatabase(userName);
        
        log.info("Merged guest cart {} into user cart {}", guestSessionId, userName);
        return mergedCart;
    }

    /**
     * Get cart count (total items)
     */
    public Integer getCartCount(String identifier) {
        CartDTO cart = getCart(identifier);
        return cart.getTotalItems() != null ? cart.getTotalItems() : 0;
    }
    
    /**
     * Validate entire cart before checkout
     * Returns validation results for all items
     */
    public boolean validateCart(String identifier) {
        CartDTO cart = getCart(identifier);
        
        if (cart.getItems().isEmpty()) {
            return false;
        }
        
        boolean allValid = true;
        
        for (CartItemDTO item : cart.getItems()) {
            try {
                if (item.getVariantId() != null && !item.getVariantId().isEmpty()) {
                    VariantInfoDTO variant = productClient.getVariantById(item.getVariantId()).getResult();
                    
                    if (variant == null || !variant.isActive() || variant.isDeleted()) {
                        log.warn("Cart item invalid: variant {} not available", item.getVariantId());
                        allValid = false;
                    } else if (variant.getStockQuantity() < item.getQuantity()) {
                        log.warn("Cart item invalid: variant {} insufficient stock", item.getVariantId());
                        allValid = false;
                    } else if (!variant.getPrice().equals(item.getPrice())) {
                        log.warn("Cart item price changed: variant {} old={} new={}", 
                                item.getVariantId(), item.getPrice(), variant.getPrice());
                        // Update price in cart
                        item.setPrice(variant.getPrice());
                        allValid = false; // Price changed, need user confirmation
                    }
                }
            } catch (Exception e) {
                log.error("Error validating cart item: {}", e.getMessage());
                allValid = false;
            }
        }
        
        // Update cart if prices changed
        if (!allValid) {
            redisCartRepository.saveCart(cart);
        }
        
        return allValid;
    }
}
