package com.cnweb.order_service.controller;

import com.cnweb.order_service.dto.ApiResponse;
import com.cnweb.order_service.dto.request.AddToCartRequest;
import com.cnweb.order_service.dto.request.MergeCartRequest;
import com.cnweb.order_service.dto.request.UpdateCartItemRequest;
import com.cnweb.order_service.dto.response.CartDTO;
import com.cnweb.order_service.dto.response.CartValidationResult;
import com.cnweb.order_service.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart", description = "Cart management APIs")
public class CartController {

    private final CartService cartService;

    /**
     * Get cart identifier from authentication or session
     */
    private String getCartIdentifier(String sessionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if user is authenticated with valid JWT token
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())
                && authentication.getPrincipal() instanceof Jwt) {
            String userName = authentication.getName();
            if (userName != null && !userName.isEmpty()) {
                return userName;
            }
        }

        // For guest users, use session ID
        if (sessionId != null && !sessionId.isEmpty()) {
            return "guest:" + sessionId;
        }

        // Fallback: generate new session ID
        return "guest:" + java.util.UUID.randomUUID().toString();
    }

    @GetMapping
    @Operation(summary = "Get cart", description = "Get current cart for authenticated user or guest session")
    public ResponseEntity<ApiResponse<CartDTO>> getCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        CartDTO cart = cartService.getCart(identifier);

        return ResponseEntity.ok(ApiResponse.<CartDTO>builder()
                .code(200)
                .message("Cart retrieved successfully")
                .result(cart)
                .build());
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Add a product item to cart")
    public ResponseEntity<ApiResponse<CartDTO>> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        CartDTO cart = cartService.addToCart(identifier, request);

        return ResponseEntity.ok(ApiResponse.<CartDTO>builder()
                .code(200)
                .message("Item added to cart successfully")
                .result(cart)
                .build());
    }

    @PutMapping("/items")
    @Operation(summary = "Update cart item", description = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItem(
            @Valid @RequestBody UpdateCartItemRequest request,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        CartDTO cart = cartService.updateCartItem(identifier, request);

        return ResponseEntity.ok(ApiResponse.<CartDTO>builder()
                .code(200)
                .message("Cart item updated successfully")
                .result(cart)
                .build());
    }

    @DeleteMapping("/items")
    @Operation(summary = "Remove item from cart", description = "Remove a product item from cart")
    public ResponseEntity<ApiResponse<CartDTO>> removeFromCart(
            @RequestParam String productId,
            @RequestParam(required = false) String variantId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        CartDTO cart = cartService.removeFromCart(identifier, productId, variantId);

        return ResponseEntity.ok(ApiResponse.<CartDTO>builder()
                .code(200)
                .message("Item removed from cart successfully")
                .result(cart)
                .build());
    }

    @DeleteMapping
    @Operation(summary = "Clear cart", description = "Clear all items from cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        cartService.clearCart(identifier);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Cart cleared successfully")
                .build());
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge cart", description = "Merge guest cart into user cart after login")
    public ResponseEntity<ApiResponse<CartDTO>> mergeCart(
            @Valid @RequestBody MergeCartRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.<CartDTO>builder()
                    .code(401)
                    .message("Authentication required to merge cart")
                    .build());
        }


        String userName = authentication.getName();

        String guestSessionId = "guest:" + request.getGuestSessionId();
        CartDTO cart = cartService.mergeCart(guestSessionId, userName);

        return ResponseEntity.ok(ApiResponse.<CartDTO>builder()
                .code(200)
                .message("Cart merged successfully")
                .result(cart)
                .build());
    }

    @GetMapping("/count")
    @Operation(summary = "Get cart count", description = "Get total number of items in cart")
    public ResponseEntity<ApiResponse<Integer>> getCartCount(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        Integer count = cartService.getCartCount(identifier);

        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .code(200)
                .message("Cart count retrieved successfully")
                .result(count)
                .build());
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate cart", description = "Validate all items in cart (stock, price, availability)")
    public ResponseEntity<ApiResponse<Boolean>> validateCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        boolean isValid = cartService.validateCart(identifier);

        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .code(200)
                .message(isValid ? "Cart is valid" : "Cart has invalid items or price changes")
                .result(isValid)
                .build());
    }

    @GetMapping("/validate/detailed")
    @Operation(summary = "Get detailed cart validation",
            description = "Get detailed validation result with all changes (price, stock, availability)")
    public ResponseEntity<ApiResponse<CartValidationResult>> getDetailedValidation(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        CartValidationResult result = cartService.getCartValidationResult(identifier);

        return ResponseEntity.ok(ApiResponse.<CartValidationResult>builder()
                .code(200)
                .message(result.getMessage())
                .result(result)
                .build());
    }

    @DeleteMapping("/items/bulk")
    @Operation(summary = "Remove multiple items from cart", description = "Remove multiple product items from cart")
    public ResponseEntity<ApiResponse<CartDTO>> removeCartItems(
            @RequestBody List<String> variantIds,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        String identifier = getCartIdentifier(sessionId);
        CartDTO cart = cartService.removeCartItems(identifier, variantIds);

        return ResponseEntity.ok(ApiResponse.<CartDTO>builder()
                .code(200)
                .message("Items removed from cart successfully")
                .result(cart)
                .build());
    }
}