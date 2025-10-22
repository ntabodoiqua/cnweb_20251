package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.response.WardResponse;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.WardMapper;
import com.cnweb2025.user_service.repository.WardRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WardServiceImp implements WardService {
    WardRepository wardRepository;
    WardMapper wardMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "wards", key = "'province_' + #provinceId")
    public List<WardResponse> getWardsByProvinceId(Integer provinceId) {
        log.info("Fetching all wards for province ID: {}", provinceId);
        return wardRepository.findByProvinceIdOrderByNameAsc(provinceId)
                .stream()
                .map(wardMapper::toWardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WardResponse> getWardsByProvinceIdWithPagination(Integer provinceId, Pageable pageable) {
        log.info("Fetching wards for province ID: {} with pagination - Page: {}, Size: {}", 
                provinceId, pageable.getPageNumber(), pageable.getPageSize());
        return wardRepository.findByProvinceId(provinceId, pageable)
                .map(wardMapper::toWardResponse);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "wards", key = "#id")
    public WardResponse getWardById(Integer id) {
        log.info("Fetching ward by ID: {}", id);
        return wardRepository.findById(id)
                .map(wardMapper::toWardResponse)
                .orElseThrow(() -> new AppException(ErrorCode.WARD_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "wards", key = "'slug_' + #slug")
    public WardResponse getWardBySlug(String slug) {
        log.info("Fetching ward by slug: {}", slug);
        return wardRepository.findBySlugIgnoreCase(slug)
                .map(wardMapper::toWardResponse)
                .orElseThrow(() -> new AppException(ErrorCode.WARD_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardResponse> searchWards(String keyword) {
        log.info("Searching wards with keyword: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            log.warn("Empty keyword provided for ward search");
            return List.of();
        }
        return wardRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(wardMapper::toWardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardResponse> searchWardsByProvinceId(String keyword, Integer provinceId) {
        log.info("Searching wards with keyword: {} in province ID: {}", keyword, provinceId);
        if (keyword == null || keyword.trim().isEmpty()) {
            return getWardsByProvinceId(provinceId);
        }
        return wardRepository.searchByKeywordAndProvinceId(keyword.trim(), provinceId)
                .stream()
                .map(wardMapper::toWardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countWardsByProvinceId(Integer provinceId) {
        log.info("Counting wards for province ID: {}", provinceId);
        return wardRepository.countByProvinceId(provinceId);
    }
}
