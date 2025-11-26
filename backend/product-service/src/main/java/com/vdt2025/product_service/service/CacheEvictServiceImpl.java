package com.vdt2025.product_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class CacheEvictServiceImpl implements CacheEvictService{
    private final StringRedisTemplate redisTemplate;

    @Override
    public void evictUserStores(String username) {
        String pattern = "storesOfCurrentSeller::" + username + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public void evictProductDetails(String productId) {
        String pattern = "products::" + productId + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public void evictProductCaches(String productId) {
        String pattern = "productSpecs::" + productId + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public void evictVariantCaches(String variantId) {
        String pattern = "variantSpecs::" + variantId + "*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public void evictProductSearchCache() {
        String pattern = "product-search::*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
