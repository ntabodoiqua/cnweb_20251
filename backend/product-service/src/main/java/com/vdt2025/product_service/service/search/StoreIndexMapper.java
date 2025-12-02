package com.vdt2025.product_service.service.search;

import com.vdt2025.product_service.document.StoreDocument;
import com.vdt2025.product_service.entity.Store;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.suggest.Completion;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Mapper để chuyển đổi từ Store JPA Entity sang StoreDocument (Elasticsearch)
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StoreIndexMapper {

    /**
     * Chuyển đổi Store entity sang StoreDocument
     */
    public StoreDocument toDocument(Store store) {
        if (store == null) {
            return null;
        }

        // Build completion suggestions
        Completion suggest = buildSuggestion(store);

        return StoreDocument.builder()
                .id(store.getId())
                .sellerProfileId(store.getSellerProfileId())
                .userName(store.getUserName())
                .storeName(store.getStoreName())
                .storeDescription(store.getStoreDescription())
                .logoUrl(store.getLogoUrl())
                .bannerUrl(store.getBannerUrl())
                .contactEmail(store.getContactEmail())
                .contactPhone(store.getContactPhone())
                .shopAddress(store.getShopAddress())
                .provinceId(store.getProvinceId())
                .wardId(store.getWardId())
                .isActive(store.isActive())
                .totalProducts(store.getTotalProducts())
                .totalSold(store.getTotalSold())
                .averageRating(store.getAverageRating())
                .followerCount(store.getFollowerCount())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .suggest(suggest)
                .build();
    }

    /**
     * Build completion suggestion for autocomplete
     */
    private Completion buildSuggestion(Store store) {
        List<String> inputs = new ArrayList<>();

        // Add store name
        if (store.getStoreName() != null) {
            inputs.add(store.getStoreName());
        }

        // Add username
        if (store.getUserName() != null) {
            inputs.add(store.getUserName());
        }

        // Weight based on popularity
        int weight = calculateWeight(store);

        Completion completion = new Completion(inputs.toArray(new String[0]));
        completion.setWeight(weight);
        return completion;
    }

    /**
     * Calculate suggestion weight based on store popularity
     */
    private int calculateWeight(Store store) {
        int weight = 1;

        // Boost by total products
        if (store.getTotalProducts() != null) {
            weight += Math.min(store.getTotalProducts() / 5, 30);
        }

        // Boost by total sold
        if (store.getTotalSold() != null) {
            weight += Math.min(store.getTotalSold() / 10, 30);
        }

        // Boost by rating
        if (store.getAverageRating() != null) {
            weight += (int) (store.getAverageRating() * 5);
        }

        // Boost by followers
        if (store.getFollowerCount() != null) {
            weight += Math.min(store.getFollowerCount() / 10, 20);
        }

        return Math.min(weight, 100); // Cap at 100
    }
}
