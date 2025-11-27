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
    public void evictVariantSelectionCaches(String productId) {
        // Evict variantSelectionOptions cache
        String pattern1 = "variantSelectionOptions::" + productId + "*";
        Set<String> keys1 = redisTemplate.keys(pattern1);
        if (keys1 != null && !keys1.isEmpty()) {
            redisTemplate.delete(keys1);
        }
        
        // Evict variantByAttributes cache (pattern: productId-[...])
        String pattern2 = "variantByAttributes::" + productId + "-*";
        Set<String> keys2 = redisTemplate.keys(pattern2);
        if (keys2 != null && !keys2.isEmpty()) {
            redisTemplate.delete(keys2);
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
