package com.cnweb.order_service.repository;

import com.cnweb.order_service.dto.response.CartDTO;
import com.cnweb.order_service.dto.response.CartItemDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Repository
@RequiredArgsConstructor
@Slf4j
public class RedisCartRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CART_PREFIX = "cart:";
    private static final Duration CART_TTL = Duration.ofDays(30); // 30 days for guest carts
    private static final Duration USER_CART_TTL = Duration.ofDays(90); // 90 days for user carts

    /**
     * Generate Redis key for cart
     */
    private String getCartKey(String identifier) {
        return CART_PREFIX + identifier;
    }

    /**
     * Save cart to Redis
     */
    public void saveCart(CartDTO cart) {
        String key = getCartKey(cart.getSessionId() != null ? cart.getSessionId() : cart.getUserName());
        cart.setUpdatedAt(LocalDateTime.now());
        cart.calculateTotals();
        
        redisTemplate.opsForValue().set(key, cart, 
            cart.getUserName() != null ? USER_CART_TTL : CART_TTL);
        
        log.info("Saved cart to Redis: {}", key);
    }

    /**
     * Remove multiple items from cart
     */
    public CartDTO removeItems(String identifier, List<String> variantIds) {
        CartDTO cart = getCart(identifier);

        if (cart == null) {
            return null;
        }

        cart.getItems().removeIf(item ->
                item.getVariantId() != null && variantIds.contains(item.getVariantId())
        );

        saveCart(cart);
        return cart;
    }

    /**
     * Get cart from Redis
     */
    public CartDTO getCart(String identifier) {
        String key = getCartKey(identifier);
        Object value = redisTemplate.opsForValue().get(key);
        
        if (value instanceof CartDTO) {
            return (CartDTO) value;
        }
        
        return null;
    }

    /**
     * Add item to cart
     */
    public CartDTO addItem(String identifier, CartItemDTO item) {
        CartDTO cart = getCart(identifier);
        
        if (cart == null) {
            cart = CartDTO.builder()
                    .sessionId(identifier.startsWith("guest:") ? identifier : null)
                    .userName(identifier.startsWith("guest:") ? null : identifier)
                    .items(new ArrayList<>())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        item.setAddedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        // Check if item already exists (same product and variant)
        boolean found = false;
        for (CartItemDTO existingItem : cart.getItems()) {
            if (existingItem.getProductId().equals(item.getProductId()) &&
                    ((existingItem.getVariantId() == null && item.getVariantId() == null) ||
                            (existingItem.getVariantId() != null && existingItem.getVariantId().equals(item.getVariantId())))) {
                // Update quantity
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                existingItem.setUpdatedAt(LocalDateTime.now());
                found = true;
                break;
            }
        }

        if (!found) {
            cart.getItems().add(item);
        }

        saveCart(cart);
        return cart;
    }

    /**
     * Update item quantity
     */
    public CartDTO updateItem(String identifier, String productId, String variantId, Integer quantity) {
        CartDTO cart = getCart(identifier);
        
        if (cart == null) {
            return null;
        }

        for (CartItemDTO item : cart.getItems()) {
            if (item.getProductId().equals(productId) &&
                    ((item.getVariantId() == null && variantId == null) ||
                            (item.getVariantId() != null && item.getVariantId().equals(variantId)))) {
                item.setQuantity(quantity);
                item.setUpdatedAt(LocalDateTime.now());
                break;
            }
        }

        saveCart(cart);
        return cart;
    }

    /**
     * Remove item from cart
     */
    public CartDTO removeItem(String identifier, String productId, String variantId) {
        CartDTO cart = getCart(identifier);
        
        if (cart == null) {
            return null;
        }

        cart.getItems().removeIf(item ->
                item.getProductId().equals(productId) &&
                        ((item.getVariantId() == null && variantId == null) ||
                                (item.getVariantId() != null && item.getVariantId().equals(variantId)))
        );

        saveCart(cart);
        return cart;
    }

    /**
     * Clear cart
     */
    public void clearCart(String identifier) {
        String key = getCartKey(identifier);
        redisTemplate.delete(key);
        log.info("Cleared cart from Redis: {}", key);
    }

    /**
     * Merge guest cart into user cart
     */
    public CartDTO mergeCart(String guestSessionId, String userName) {
        CartDTO guestCart = getCart(guestSessionId);
        CartDTO userCart = getCart(userName);

        if (guestCart == null || guestCart.getItems().isEmpty()) {
            return userCart;
        }

        if (userCart == null) {
            // No existing user cart, convert guest cart to user cart
            guestCart.setSessionId(null);
            guestCart.setUserName(userName);
            saveCart(guestCart);
            clearCart(guestSessionId);
            return guestCart;
        }

        // Merge items from guest cart to user cart
        for (CartItemDTO guestItem : guestCart.getItems()) {
            boolean found = false;
            
            for (CartItemDTO userItem : userCart.getItems()) {
                if (userItem.getProductId().equals(guestItem.getProductId()) &&
                        ((userItem.getVariantId() == null && guestItem.getVariantId() == null) ||
                                (userItem.getVariantId() != null && userItem.getVariantId().equals(guestItem.getVariantId())))) {
                    // Merge quantities
                    userItem.setQuantity(userItem.getQuantity() + guestItem.getQuantity());
                    userItem.setUpdatedAt(LocalDateTime.now());
                    found = true;
                    break;
                }
            }

            if (!found) {
                userCart.getItems().add(guestItem);
            }
        }

        saveCart(userCart);
        clearCart(guestSessionId);
        
        log.info("Merged guest cart {} into user cart {}", guestSessionId, userName);
        return userCart;
    }

    /**
     * Get all cart keys for persistence job
     */
    public Set<String> getAllCartKeys() {
        return redisTemplate.keys(CART_PREFIX + "*");
    }
}
