package com.vdt2025.product_service.controller;

import com.vdt2025.product_service.dto.response.ApiResponse;
import com.vdt2025.product_service.dto.response.FollowStatusResponse;
import com.vdt2025.product_service.dto.response.StoreFollowResponse;
import com.vdt2025.product_service.service.StoreFollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Store Follow", description = "APIs for following/unfollowing stores")
public class StoreFollowController {
    
    StoreFollowService storeFollowService;
    MessageSource messageSource;
    
    @PostMapping("/{storeId}/follow")
    @Operation(summary = "Follow a store", description = "Follow a store by its ID")
    public ApiResponse<FollowStatusResponse> followStore(
            @Parameter(description = "Store ID") @PathVariable String storeId,
            Locale locale) {
        log.info("Request to follow store: {}", storeId);
        var result = storeFollowService.followStore(storeId);
        return ApiResponse.<FollowStatusResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.store.followed", null, locale))
                .build();
    }
    
    @DeleteMapping("/{storeId}/follow")
    @Operation(summary = "Unfollow a store", description = "Unfollow a store by its ID")
    public ApiResponse<FollowStatusResponse> unfollowStore(
            @Parameter(description = "Store ID") @PathVariable String storeId,
            Locale locale) {
        log.info("Request to unfollow store: {}", storeId);
        var result = storeFollowService.unfollowStore(storeId);
        return ApiResponse.<FollowStatusResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.store.unfollowed", null, locale))
                .build();
    }
    
    @GetMapping("/{storeId}/follow/status")
    @Operation(summary = "Get follow status", description = "Check if current user is following the store")
    public ApiResponse<FollowStatusResponse> getFollowStatus(
            @Parameter(description = "Store ID") @PathVariable String storeId,
            Locale locale) {
        var result = storeFollowService.getFollowStatus(storeId);
        return ApiResponse.<FollowStatusResponse>builder()
                .result(result)
                .message(messageSource.getMessage("success.store.follow.status", null, locale))
                .build();
    }
    
    @PostMapping("/follow/statuses")
    @Operation(summary = "Get follow statuses for multiple stores", description = "Check follow status for multiple stores at once")
    public ApiResponse<List<FollowStatusResponse>> getFollowStatuses(
            @RequestBody List<String> storeIds,
            Locale locale) {
        var result = storeFollowService.getFollowStatuses(storeIds);
        return ApiResponse.<List<FollowStatusResponse>>builder()
                .result(result)
                .message(messageSource.getMessage("success.store.follow.statuses", null, locale))
                .build();
    }
    
    @GetMapping("/following")
    @Operation(summary = "Get following stores", description = "Get list of stores that current user is following")
    public ApiResponse<Page<StoreFollowResponse>> getFollowingStores(
            Pageable pageable,
            Locale locale) {
        log.info("Request to get following stores");
        var result = storeFollowService.getFollowingStores(pageable);
        return ApiResponse.<Page<StoreFollowResponse>>builder()
                .result(result)
                .message(messageSource.getMessage("success.store.following.retrieved", null, locale))
                .build();
    }
    
    @GetMapping("/{storeId}/followers/count")
    @Operation(summary = "Get follower count", description = "Get the number of followers for a store")
    public ApiResponse<Long> getFollowerCount(
            @Parameter(description = "Store ID") @PathVariable String storeId,
            Locale locale) {
        var result = storeFollowService.getFollowerCount(storeId);
        return ApiResponse.<Long>builder()
                .result(result)
                .message(messageSource.getMessage("success.store.follower.count", null, locale))
                .build();
    }
}
