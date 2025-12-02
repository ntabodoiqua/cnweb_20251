package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.response.FollowStatusResponse;
import com.vdt2025.product_service.dto.response.StoreFollowResponse;
import com.vdt2025.product_service.entity.Store;
import com.vdt2025.product_service.entity.StoreFollow;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.StoreFollowRepository;
import com.vdt2025.product_service.repository.StoreRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoreFollowServiceImpl implements StoreFollowService {
    
    StoreFollowRepository storeFollowRepository;
    StoreRepository storeRepository;
    
    @Override
    @Transactional
    public FollowStatusResponse followStore(String storeId) {
        String username = getCurrentUsername();
        log.info("User {} is trying to follow store {}", username, storeId);
        
        // Kiểm tra store tồn tại
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));
        
        // Không cho phép follow store không active
        if (!store.isActive()) {
            throw new AppException(ErrorCode.STORE_NOT_FOUND);
        }
        
        // Không cho phép seller follow chính cửa hàng của mình
        if (store.getUserName().equalsIgnoreCase(username)) {
            throw new AppException(ErrorCode.CANNOT_FOLLOW_OWN_STORE);
        }
        
        // Kiểm tra đã follow chưa
        if (storeFollowRepository.existsByUserIdAndStoreId(username, storeId)) {
            throw new AppException(ErrorCode.ALREADY_FOLLOWING_STORE);
        }
        
        // Tạo follow record
        StoreFollow storeFollow = StoreFollow.builder()
                .userId(username)
                .store(store)
                .build();
        storeFollowRepository.save(storeFollow);
        
        // Cập nhật follower count của store (xử lý trường hợp null)
        int currentCount = store.getFollowerCount() != null ? store.getFollowerCount() : 0;
        store.setFollowerCount(currentCount + 1);
        storeRepository.save(store);
        
        log.info("User {} followed store {} successfully", username, storeId);
        
        return FollowStatusResponse.builder()
                .storeId(storeId)
                .isFollowing(true)
                .followerCount(store.getFollowerCount())
                .build();
    }
    
    @Override
    @Transactional
    public FollowStatusResponse unfollowStore(String storeId) {
        String username = getCurrentUsername();
        log.info("User {} is trying to unfollow store {}", username, storeId);
        
        // Kiểm tra store tồn tại
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));
        
        // Kiểm tra đã follow chưa
        if (!storeFollowRepository.existsByUserIdAndStoreId(username, storeId)) {
            throw new AppException(ErrorCode.NOT_FOLLOWING_STORE);
        }
        
        // Xóa follow record
        storeFollowRepository.deleteByUserIdAndStoreId(username, storeId);
        
        // Cập nhật follower count của store (xử lý trường hợp null)
        int currentCount = store.getFollowerCount() != null ? store.getFollowerCount() : 0;
        int newCount = Math.max(0, currentCount - 1);
        store.setFollowerCount(newCount);
        storeRepository.save(store);
        
        log.info("User {} unfollowed store {} successfully", username, storeId);
        
        return FollowStatusResponse.builder()
                .storeId(storeId)
                .isFollowing(false)
                .followerCount(newCount)
                .build();
    }
    
    @Override
    public FollowStatusResponse getFollowStatus(String storeId) {
        String username = getCurrentUsername();
        
        // Kiểm tra store tồn tại
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new AppException(ErrorCode.STORE_NOT_FOUND));
        
        boolean isFollowing = storeFollowRepository.existsByUserIdAndStoreId(username, storeId);
        int followerCount = store.getFollowerCount() != null ? store.getFollowerCount() : 0;
        
        return FollowStatusResponse.builder()
                .storeId(storeId)
                .isFollowing(isFollowing)
                .followerCount(followerCount)
                .build();
    }
    
    @Override
    public List<FollowStatusResponse> getFollowStatuses(List<String> storeIds) {
        String username = getCurrentUsername();
        
        // Lấy danh sách storeId mà user đang follow
        Set<String> followingStoreIds = storeFollowRepository.findStoreIdsByUserId(username)
                .stream()
                .collect(Collectors.toSet());
        
        List<FollowStatusResponse> responses = new ArrayList<>();
        
        for (String storeId : storeIds) {
            Store store = storeRepository.findById(storeId).orElse(null);
            if (store != null) {
                int followerCount = store.getFollowerCount() != null ? store.getFollowerCount() : 0;
                responses.add(FollowStatusResponse.builder()
                        .storeId(storeId)
                        .isFollowing(followingStoreIds.contains(storeId))
                        .followerCount(followerCount)
                        .build());
            }
        }
        
        return responses;
    }
    
    @Override
    public Page<StoreFollowResponse> getFollowingStores(Pageable pageable) {
        String username = getCurrentUsername();
        log.info("Getting following stores for user {}", username);
        
        Page<StoreFollow> follows = storeFollowRepository.findByUserIdOrderByCreatedAtDesc(username, pageable);
        
        return follows.map(this::mapToStoreFollowResponse);
    }
    
    @Override
    public long getFollowerCount(String storeId) {
        // Kiểm tra store tồn tại
        if (!storeRepository.existsById(storeId)) {
            throw new AppException(ErrorCode.STORE_NOT_FOUND);
        }
        
        return storeFollowRepository.countByStoreId(storeId);
    }
    
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    
    private StoreFollowResponse mapToStoreFollowResponse(StoreFollow storeFollow) {
        Store store = storeFollow.getStore();
        int followerCount = store.getFollowerCount() != null ? store.getFollowerCount() : 0;
        return StoreFollowResponse.builder()
                .id(storeFollow.getId())
                .storeId(store.getId())
                .storeName(store.getStoreName())
                .storeDescription(store.getStoreDescription())
                .logoUrl(store.getLogoUrl())
                .bannerUrl(store.getBannerUrl())
                .totalProducts(store.getTotalProducts())
                .totalSold(store.getTotalSold())
                .averageRating(store.getAverageRating())
                .followerCount(followerCount)
                .followedAt(storeFollow.getCreatedAt())
                .build();
    }
}
