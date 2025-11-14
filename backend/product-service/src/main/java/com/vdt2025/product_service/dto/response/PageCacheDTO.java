package com.vdt2025.product_service.dto.response;

import java.util.List;

public record PageCacheDTO<T>(
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements
) {}