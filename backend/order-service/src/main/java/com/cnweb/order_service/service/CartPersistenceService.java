package com.cnweb.order_service.service;

import com.cnweb.order_service.dto.response.CartDTO;
import com.cnweb.order_service.dto.response.CartItemDTO;
import com.cnweb.order_service.entity.Cart;
import com.cnweb.order_service.entity.CartItem;
import com.cnweb.order_service.repository.CartItemRepository;
import com.cnweb.order_service.repository.CartRepository;
import com.cnweb.order_service.repository.RedisCartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartPersistenceService {

    private final RedisCartRepository redisCartRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    /**
     * Async method to persist cart from Redis to database
     */
    @Async("taskExecutor")
    @Transactional
    public void persistCartToDatabase(String identifier) {
        try {
            CartDTO cartDTO = redisCartRepository.getCart(identifier);
            
            if (cartDTO == null || cartDTO.getUserName() == null) {
                // Only persist carts with user names (authenticated users)
                return;
            }

            saveCartToDatabase(cartDTO);
            log.info("Persisted cart to database for user: {}", cartDTO.getUserName());
            
        } catch (Exception e) {
            log.error("Error persisting cart to database for identifier: {}", identifier, e);
        }
    }

    /**
     * Scheduled job to persist all user carts from Redis to database
     * Runs every 5 minutes
     */
    @Scheduled(fixedDelay = 300000) // 5 minutes
    @Transactional
    public void scheduledPersistence() {
        try {
            log.info("Starting scheduled cart persistence job");
            
            Set<String> cartKeys = redisCartRepository.getAllCartKeys();
            int persistedCount = 0;
            
            for (String key : cartKeys) {
                String identifier = key.replace("cart:", "");
                
                // Skip guest carts (those starting with "guest:")
                if (identifier.startsWith("guest:")) {
                    continue;
                }
                
                CartDTO cartDTO = redisCartRepository.getCart(identifier);
                
                if (cartDTO != null && cartDTO.getUserName() != null) {
                    saveCartToDatabase(cartDTO);
                    persistedCount++;
                }
            }
            
            log.info("Scheduled cart persistence completed. Persisted {} carts", persistedCount);
            
        } catch (Exception e) {
            log.error("Error in scheduled cart persistence job", e);
        }
    }

    /**
     * Save cart DTO to database
     */
    @Transactional
    public void saveCartToDatabase(CartDTO cartDTO) {
        if (cartDTO.getUserName() == null) {
            return;
        }

        Optional<Cart> existingCartOpt = cartRepository.findByUserName(cartDTO.getUserName());
        Cart cart;

        if (existingCartOpt.isPresent()) {
            cart = existingCartOpt.get();
            // Clear existing items
            cartItemRepository.deleteByCartId(cart.getId());
        } else {
            cart = Cart.builder()
                    .userName(cartDTO.getUserName())
                    .cartItems(new ArrayList<>())
                    .build();
        }

        // Convert DTOs to entities
        for (CartItemDTO itemDTO : cartDTO.getItems()) {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .productId(itemDTO.getProductId())
                    .productName(itemDTO.getProductName())
                    .variantId(itemDTO.getVariantId())
                    .variantName(itemDTO.getVariantName())
                    .imageUrl(itemDTO.getImageUrl())
                    .quantity(itemDTO.getQuantity())
                    .price(itemDTO.getPrice())
                    .originalPrice(itemDTO.getOriginalPrice())
                    .build();
            
            cart.getCartItems().add(cartItem);
        }

        cartRepository.save(cart);
    }

    /**
     * Load cart from database to Redis (on login or when Redis cache is empty)
     */
    @Transactional(readOnly = true)
    public CartDTO loadCartFromDatabase(String userName) {
        Optional<Cart> cartOpt = cartRepository.findByUserName(userName);
        
        if (cartOpt.isEmpty()) {
            return null;
        }

        Cart cart = cartOpt.get();
        CartDTO cartDTO = CartDTO.builder()
                .cartId(cart.getId())
                .userName(cart.getUserName())
                .items(new ArrayList<>())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();

        for (CartItem item : cart.getCartItems()) {
            CartItemDTO itemDTO = CartItemDTO.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .variantId(item.getVariantId())
                    .variantName(item.getVariantName())
                    .imageUrl(item.getImageUrl())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .originalPrice(item.getOriginalPrice())
                    .addedAt(item.getCreatedAt())
                    .updatedAt(item.getUpdatedAt())
                    .build();
            
            cartDTO.getItems().add(itemDTO);
        }

        cartDTO.calculateTotals();
        
        // Save to Redis
        redisCartRepository.saveCart(cartDTO);
        
        return cartDTO;
    }
}
