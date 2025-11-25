package com.cnweb.order_service.service;

import com.cnweb.order_service.client.ProductClient;
import com.cnweb.order_service.client.VariantInternalDTO;
import com.cnweb.order_service.client.VariantValidationDTO;
import com.cnweb.order_service.client.VariantsQueryRequest;
import com.cnweb.order_service.dto.request.AddToCartRequest;
import com.cnweb.order_service.dto.request.UpdateCartItemRequest;
import com.cnweb.order_service.dto.response.CartDTO;
import com.cnweb.order_service.dto.response.CartItemChangeDTO;
import com.cnweb.order_service.dto.response.CartItemDTO;
import com.cnweb.order_service.dto.response.CartValidationResult;
import com.cnweb.order_service.repository.RedisCartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
     * Auto-validates and syncs with product-service to ensure data freshness
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
        
        // Auto-validate and sync cart with product-service if cart has items
        log.info("cart before validate: {}", cart);
        if (!cart.getItems().isEmpty()) {
            CartValidationResult validationResult = validateAndSyncCart(identifier, cart);
            cart = validationResult.getCart();
            
            if (validationResult.isHasChanges()) {
                log.info("Cart auto-synced for identifier: {}. Changes detected: {}", 
                        identifier, validationResult.getChanges().size());
            }
        }
        
        return cart;
    }

    /**
     * Add item to cart with product validation
     */
    public CartDTO addToCart(String identifier, AddToCartRequest request) {
        // Validate product/variant from product-service
        VariantInternalDTO variant = null;
        try {
            if (request.getVariantId() != null && !request.getVariantId().isEmpty()) {
                // Get variant info from product-service
                VariantsQueryRequest queryRequest = VariantsQueryRequest.builder()
                        .variantIds(Collections.singletonList(request.getVariantId()))
                        .build();
                
                List<VariantInternalDTO> variants = productClient.getVariants(queryRequest).getResult();
                
                if (variants == null || variants.isEmpty()) {
                    throw new RuntimeException("Product variant not found");
                }
                
                variant = variants.getFirst();
                
                if (!variant.isActive() || variant.isDeleted()) {
                    throw new RuntimeException("Product variant is not available");
                }
                
                // Check existing quantity in cart
                CartDTO existingCart = redisCartRepository.getCart(identifier);
                int existingQuantity = 0;
                
                if (existingCart != null && existingCart.getItems() != null) {
                    for (CartItemDTO existingItem : existingCart.getItems()) {
                        if (existingItem.getVariantId() != null && 
                            existingItem.getVariantId().equals(request.getVariantId())) {
                            existingQuantity = existingItem.getQuantity();
                            break;
                        }
                    }
                }
                
                // Validate TOTAL quantity (existing + new)
                int totalQuantity = existingQuantity + request.getQuantity();
                if (variant.getStockQuantity() < totalQuantity) {
                    throw new RuntimeException(
                        String.format("Insufficient stock. Available: %d, Already in cart: %d, Requested: %d, Total would be: %d",
                            variant.getStockQuantity(), existingQuantity, request.getQuantity(), totalQuantity)
                    );
                }
                
                // Use product-service data to ensure accuracy
                request.setPrice(variant.getPrice());
                request.setOriginalPrice(variant.getOriginalPrice());
                request.setProductName(variant.getProductName());
                request.setVariantName(variant.getVariantName());
                request.setImageUrl(variant.getImageUrl());
            } else {
                throw new RuntimeException("Variant ID is required");
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
                .sku(variant.getSku())
                .imageUrl(request.getImageUrl())
                .storeName(variant.getStoreName())
                .storeId(variant.getStoreId())
                .storeLogo(variant.getStoreLogo())
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
                VariantsQueryRequest queryRequest = VariantsQueryRequest.builder()
                        .variantIds(Collections.singletonList(request.getVariantId()))
                        .build();
                
                List<VariantValidationDTO> validations = productClient.validateVariants(queryRequest).getResult();
                
                if (validations != null && !validations.isEmpty()) {
                    VariantValidationDTO validation = validations.getFirst();
                    
                    if (!validation.isActive() || validation.isDeleted() || !validation.isInStock()) {
                        throw new RuntimeException("Product variant is not available");
                    }
                    
                    // Validate the NEW quantity directly (updateCartItem sets absolute quantity, not incremental)
                    if (validation.getAvailableStock() < request.getQuantity()) {
                        throw new RuntimeException(
                            String.format("Insufficient stock. Available: %d, Requested: %d",
                                validation.getAvailableStock(), request.getQuantity())
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error validating stock for cart update: {}", e.getMessage());
            throw new RuntimeException("Failed to validate stock: " + e.getMessage());
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
     * Validate and sync cart with product-service
     * Returns detailed validation result with change tracking
     */
    public CartValidationResult validateAndSyncCart(String identifier, CartDTO cart) {
        List<CartItemChangeDTO> changes = new ArrayList<>();
        boolean hasChanges = false;
        boolean allValid = true;
        
        if (cart == null) {
            cart = getCartWithoutValidation(identifier);
        }
        
        if (cart.getItems().isEmpty()) {
            return CartValidationResult.builder()
                    .valid(true)
                    .hasChanges(false)
                    .cart(cart)
                    .message("Cart is empty")
                    .build();
        }
        
        // Collect all variant IDs
        List<String> variantIds = cart.getItems().stream()
                .map(CartItemDTO::getVariantId)
                .filter(id -> id != null && !id.isEmpty())
                .toList();
        
        if (variantIds.isEmpty()) {
            return CartValidationResult.builder()
                    .valid(false)
                    .hasChanges(false)
                    .cart(cart)
                    .message("No valid variants in cart")
                    .build();
        }
        
        try {
            // Batch validate all variants
            VariantsQueryRequest queryRequest = VariantsQueryRequest.builder()
                    .variantIds(variantIds)
                    .build();
            
            List<VariantInternalDTO> variants = productClient.getVariants(queryRequest).getResult();
            log.info("Fetched {} variants for cart validation", variants.size());
            log.info("Variants: {}", variants);
            
            // Create a map for quick lookup
            java.util.Map<String, VariantInternalDTO> variantMap = variants.stream()
                    .collect(java.util.stream.Collectors.toMap(
                            VariantInternalDTO::getId,
                            v -> v
                    ));
            
            // Track items to remove (unavailable products)
            List<CartItemDTO> itemsToRemove = new ArrayList<>();
            
            // Validate and sync each cart item
            for (CartItemDTO item : cart.getItems()) {
                VariantInternalDTO variant = variantMap.get(item.getVariantId());
                
                // Check if variant is unavailable
                if (variant == null || !variant.isActive() || variant.isDeleted()) {
                    log.warn("Cart item unavailable: variant {}", item.getVariantId());
                    
                    changes.add(CartItemChangeDTO.builder()
                            .variantId(item.getVariantId())
                            .productName(item.getProductName())
                            .variantName(item.getVariantName())
                            .unavailable(true)
                            .message("Product is no longer available and has been removed from cart")
                            .build());
                    
                    itemsToRemove.add(item);
                    hasChanges = true;
                    allValid = false;
                    continue;
                }
                
                boolean itemChanged = false;
                CartItemChangeDTO.CartItemChangeDTOBuilder changeBuilder = CartItemChangeDTO.builder()
                        .variantId(item.getVariantId())
                        .productName(item.getProductName())
                        .variantName(item.getVariantName());
                
                // Check price changes
                if (!variant.getPrice().equals(item.getPrice())) {
                    log.info("Price changed for variant {}: {} -> {}", 
                            item.getVariantId(), item.getPrice(), variant.getPrice());
                    
                    changeBuilder
                            .priceChanged(true)
                            .oldPrice(item.getPrice())
                            .newPrice(variant.getPrice());
                    
                    // Update price in cart
                    item.setPrice(variant.getPrice());
                    item.setOriginalPrice(variant.getOriginalPrice());
                    item.setUpdatedAt(LocalDateTime.now());
                    
                    itemChanged = true;
                    hasChanges = true;
                    allValid = false; // Price changed, need user confirmation
                }
                
                // Check stock availability
                if (variant.getStockQuantity() < item.getQuantity()) {
                    log.warn("Insufficient stock for variant {}: Available={}, Requested={}", 
                            item.getVariantId(), variant.getStockQuantity(), item.getQuantity());
                    
                    changeBuilder
                            .stockChanged(true)
                            .oldQuantity(item.getQuantity())
                            .newQuantity(variant.getStockQuantity())
                            .availableStock(variant.getStockQuantity());
                    
                    // Adjust quantity to available stock (or remove if 0)
                    if (variant.getStockQuantity() > 0) {
                        item.setQuantity(variant.getStockQuantity());
                        item.setUpdatedAt(LocalDateTime.now());
                        itemChanged = true;
                    } else {
                        itemsToRemove.add(item);
                        changeBuilder.unavailable(true);
                    }
                    
                    hasChanges = true;
                    allValid = false;
                }
                
                // Update store info if changed
                if (!variant.getStoreName().equals(item.getStoreName()) ||
                    !variant.getStoreId().equals(item.getStoreId())) {
                    item.setStoreName(variant.getStoreName());
                    item.setStoreId(variant.getStoreId());
                    item.setStoreLogo(variant.getStoreLogo());
                    item.setUpdatedAt(LocalDateTime.now());
                    hasChanges = true;
                }
                
                // Add change record if item was modified
                if (itemChanged || changeBuilder.build().isUnavailable()) {
                    String message = buildChangeMessage(changeBuilder.build());
                    changes.add(changeBuilder.message(message).build());
                }
            }
            
            // Remove unavailable items
            if (!itemsToRemove.isEmpty()) {
                cart.getItems().removeAll(itemsToRemove);
            }
            
        } catch (Exception e) {
            log.error("Error validating cart: {}", e.getMessage(), e);
            return CartValidationResult.builder()
                    .valid(false)
                    .hasChanges(false)
                    .cart(cart)
                    .message("Error validating cart: " + e.getMessage())
                    .build();
        }
        
        // Recalculate totals and save if there were changes
        if (hasChanges) {
            cart.calculateTotals();
            redisCartRepository.saveCart(cart);
            
            // Persist to database for authenticated users
            if (!identifier.startsWith("guest:")) {
                cartPersistenceService.persistCartToDatabase(identifier);
            }
        }
        
        String message = allValid ? "Cart is valid" : 
                String.format("Cart has %d change(s). Please review before checkout.", changes.size());
        
        return CartValidationResult.builder()
                .valid(allValid)
                .hasChanges(hasChanges)
                .changes(changes)
                .cart(cart)
                .message(message)
                .build();
    }

    /**
     * Remove multiple items from cart
     */
    public CartDTO removeCartItems(String identifier, List<String> variantIds) {
        CartDTO cart = redisCartRepository.removeItems(identifier, variantIds);

        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }

        // Trigger async persistence for authenticated users
        if (!identifier.startsWith("guest:")) {
            cartPersistenceService.persistCartToDatabase(identifier);
        }

        log.info("Removed {} items from cart for identifier: {}", variantIds.size(), identifier);
        return cart;
    }
    
    /**
     * Get cart without auto-validation (internal use)
     */
    private CartDTO getCartWithoutValidation(String identifier) {
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
     * Build human-readable change message
     */
    private String buildChangeMessage(CartItemChangeDTO change) {
        List<String> messages = new ArrayList<>();
        
        if (change.isUnavailable()) {
            messages.add("Product is no longer available");
        }
        
        if (change.isPriceChanged()) {
            messages.add(String.format("Price changed from %s to %s", 
                    change.getOldPrice(), change.getNewPrice()));
        }
        
        if (change.isStockChanged()) {
            if (change.getNewQuantity() == 0) {
                messages.add("Out of stock");
            } else {
                messages.add(String.format("Quantity adjusted from %d to %d due to limited stock", 
                        change.getOldQuantity(), change.getNewQuantity()));
            }
        }
        
        return String.join(". ", messages);
    }
    
    /**
     * Validate entire cart before checkout (public API)
     * Returns simple boolean for backward compatibility
     */
    public boolean validateCart(String identifier) {
        CartDTO cart = getCartWithoutValidation(identifier);
        CartValidationResult result = validateAndSyncCart(identifier, cart);
        return result.isValid();
    }
    
    /**
     * Get detailed validation result (for checkout or user notification)
     */
    public CartValidationResult getCartValidationResult(String identifier) {
        CartDTO cart = getCartWithoutValidation(identifier);
        return validateAndSyncCart(identifier, cart);
    }
}
