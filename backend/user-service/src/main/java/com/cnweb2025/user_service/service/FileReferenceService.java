package com.cnweb2025.user_service.service;

import com.cnweb2025.user_service.repository.SellerProfileRepository;
import com.cnweb2025.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service để kiểm tra file references trong User Service
 * Kiểm tra các file được tham chiếu trong:
 * - User.avatarName
 * - SellerProfile.documentName
 * - SellerProfile.logoName  
 * - SellerProfile.bannerName
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileReferenceService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;

    /**
     * Tìm các file còn được tham chiếu trong database
     * 
     * @param fileNames Danh sách file names cần kiểm tra
     * @return Set các file name còn được tham chiếu
     */
    public Set<String> findReferencedFiles(List<String> fileNames) {
        Set<String> referencedFiles = new HashSet<>();

        // 1. Kiểm tra trong User avatars
        Set<String> avatarFiles = findReferencedAvatars(fileNames);
        referencedFiles.addAll(avatarFiles);
        log.debug("Found {} avatar references", avatarFiles.size());

        // 2. Kiểm tra trong SellerProfile documents
        Set<String> documentFiles = findReferencedDocuments(fileNames);
        referencedFiles.addAll(documentFiles);
        log.debug("Found {} document references", documentFiles.size());

        // 3. Kiểm tra trong SellerProfile logos
        Set<String> logoFiles = findReferencedLogos(fileNames);
        referencedFiles.addAll(logoFiles);
        log.debug("Found {} logo references", logoFiles.size());

        // 4. Kiểm tra trong SellerProfile banners
        Set<String> bannerFiles = findReferencedBanners(fileNames);
        referencedFiles.addAll(bannerFiles);
        log.debug("Found {} banner references", bannerFiles.size());

        return referencedFiles;
    }

    /**
     * Tìm files được tham chiếu trong User.avatarName
     */
    private Set<String> findReferencedAvatars(List<String> fileNames) {
        Set<String> referenced = new HashSet<>();
        
        // Lấy tất cả avatarName không null
        List<String> allAvatars = userRepository.findAllAvatarNames();
        
        for (String fileName : fileNames) {
            for (String avatarUrl : allAvatars) {
                if (avatarUrl != null && avatarUrl.contains(fileName)) {
                    referenced.add(fileName);
                    break;
                }
            }
        }
        
        return referenced;
    }

    /**
     * Tìm files được tham chiếu trong SellerProfile.documentName
     */
    private Set<String> findReferencedDocuments(List<String> fileNames) {
        Set<String> referenced = new HashSet<>();
        
        // Lấy tất cả documentName không null
        List<String> allDocuments = sellerProfileRepository.findAllDocumentNames();
        
        for (String fileName : fileNames) {
            if (allDocuments.contains(fileName)) {
                referenced.add(fileName);
            }
        }
        
        return referenced;
    }

    /**
     * Tìm files được tham chiếu trong SellerProfile.logoName
     */
    private Set<String> findReferencedLogos(List<String> fileNames) {
        Set<String> referenced = new HashSet<>();
        
        // Lấy tất cả logoName không null
        List<String> allLogos = sellerProfileRepository.findAllLogoNames();
        
        for (String fileName : fileNames) {
            for (String logoUrl : allLogos) {
                if (logoUrl != null && logoUrl.contains(fileName)) {
                    referenced.add(fileName);
                    break;
                }
            }
        }
        
        return referenced;
    }

    /**
     * Tìm files được tham chiếu trong SellerProfile.bannerName
     */
    private Set<String> findReferencedBanners(List<String> fileNames) {
        Set<String> referenced = new HashSet<>();
        
        // Lấy tất cả bannerName không null
        List<String> allBanners = sellerProfileRepository.findAllBannerNames();
        
        for (String fileName : fileNames) {
            for (String bannerUrl : allBanners) {
                if (bannerUrl != null && bannerUrl.contains(fileName)) {
                    referenced.add(fileName);
                    break;
                }
            }
        }
        
        return referenced;
    }
}
