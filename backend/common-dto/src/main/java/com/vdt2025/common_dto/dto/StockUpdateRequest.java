package com.vdt2025.common_dto.dto;

public record StockUpdateRequest(
        String productId,
        String variantId,
        Integer quantity
) {}