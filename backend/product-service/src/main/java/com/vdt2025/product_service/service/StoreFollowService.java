package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.response.FollowStatusResponse;
import com.vdt2025.product_service.dto.response.StoreFollowResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StoreFollowService {
    
    /**
     * Follow một cửa hàng
     * @param storeId ID của cửa hàng cần follow
     * @return FollowStatusResponse
     */
    FollowStatusResponse followStore(String storeId);
    
    /**
     * Unfollow một cửa hàng
     * @param storeId ID của cửa hàng cần unfollow
     * @return FollowStatusResponse
     */
    FollowStatusResponse unfollowStore(String storeId);
    
    /**
     * Kiểm tra trạng thái follow của user với store
     * @param storeId ID của cửa hàng
     * @return FollowStatusResponse
     */
    FollowStatusResponse getFollowStatus(String storeId);
    
    /**
     * Kiểm tra trạng thái follow của user với nhiều store
     * @param storeIds Danh sách ID của các cửa hàng
     * @return List<FollowStatusResponse>
     */
    List<FollowStatusResponse> getFollowStatuses(List<String> storeIds);
    
    /**
     * Lấy danh sách các cửa hàng mà user đang follow
     * @param pageable Phân trang
     * @return Page<StoreFollowResponse>
     */
    Page<StoreFollowResponse> getFollowingStores(Pageable pageable);
    
    /**
     * Lấy số lượng follower của một cửa hàng
     * @param storeId ID của cửa hàng
     * @return Số lượng follower
     */
    long getFollowerCount(String storeId);
}
