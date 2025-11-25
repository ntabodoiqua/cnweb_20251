package com.cnweb.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Result of cart validation with change notifications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartValidationResult implements Serializable {
    
    boolean valid;
    boolean hasChanges;
    
    @Builder.Default
    List<CartItemChangeDTO> changes = new ArrayList<>();
    
    CartDTO cart;
    
    String message;
}
