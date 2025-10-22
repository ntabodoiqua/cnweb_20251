package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.dto.response.ProvinceResponse;
import com.cnweb2025.user_service.exception.AppException;
import com.cnweb2025.user_service.exception.ErrorCode;
import com.cnweb2025.user_service.mapper.ProvinceMapper;
import com.cnweb2025.user_service.repository.ProvinceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProvinceServiceImp implements ProvinceService {
    ProvinceRepository provinceRepository;
    ProvinceMapper provinceMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "provinces", key = "'all'")
    public List<ProvinceResponse> getAllProvinces() {
        log.info("Fetching all provinces (34 provinces)");
        return provinceRepository.findAllByOrderByNameAsc()
                .stream()
                .map(provinceMapper::toProvinceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "provinces", key = "#id")
    public ProvinceResponse getProvinceById(Integer id) {
        log.info("Fetching province by ID: {}", id);
        return provinceRepository.findById(id)
                .map(provinceMapper::toProvinceResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "provinces", key = "'slug_' + #slug")
    public ProvinceResponse getProvinceBySlug(String slug) {
        log.info("Fetching province by slug: {}", slug);
        return provinceRepository.findByNameSlugIgnoreCase(slug)
                .map(provinceMapper::toProvinceResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PROVINCE_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProvinceResponse> searchProvinces(String keyword) {
        log.info("Searching provinces with keyword: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProvinces();
        }
        return provinceRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(provinceMapper::toProvinceResponse)
                .collect(Collectors.toList());
    }
}
