package com.cnweb.payment_service.scheduler;

import com.cnweb.payment_service.dto.zalopay.QueryOrderRequest;
import com.cnweb.payment_service.dto.zalopay.QueryOrderResponse;
import com.cnweb.payment_service.entity.ZaloPayTransaction;
import com.cnweb.payment_service.repository.ZaloPayTransactionRepository;
import com.cnweb.payment_service.service.ZaloPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler để tự động query trạng thái đơn hàng pending
 * Chạy mỗi phút để check các đơn hàng chưa nhận được callback
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderStatusQueryScheduler {
    
    private final ZaloPayTransactionRepository transactionRepository;
    private final ZaloPayService zaloPayService;
    
    /**
     * Tự động query trạng thái các đơn hàng PENDING
     * Chạy mỗi 1 phút theo best practice của ZaloPay
     */
    @Scheduled(fixedDelay = 60000) // 60 seconds = 1 minute
    public void queryPendingOrders() {
        try {
            // Tìm các transaction PENDING được tạo trong vòng 15 phút (thời gian expire mặc định)
            LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
            
            List<ZaloPayTransaction> pendingTransactions = transactionRepository
                    .findPendingTransactionsAfter(fifteenMinutesAgo);
            
            if (pendingTransactions.isEmpty()) {
                log.debug("No pending transactions to query");
                return;
            }
            
            log.info("Found {} pending transactions to query", pendingTransactions.size());
            
            for (ZaloPayTransaction transaction : pendingTransactions) {
                try {
                    queryAndUpdateTransaction(transaction);
                } catch (Exception e) {
                    log.error("Error querying transaction {}: {}", 
                            transaction.getAppTransId(), e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Error in order status query scheduler: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Query và update một transaction
     */
    private void queryAndUpdateTransaction(ZaloPayTransaction transaction) {
        String appTransId = transaction.getAppTransId();
        
        log.info("Querying status for transaction: {}", appTransId);
        
        QueryOrderRequest request = QueryOrderRequest.builder()
                .appTransId(appTransId)
                .build();
        
        QueryOrderResponse response = zaloPayService.queryOrderStatus(request);
        
        // Log kết quả
        log.info("Query result for {}: status={}, message={}", 
                appTransId, response.getStatus(), response.getMessage());
        
        // Nếu đơn hàng đã expired (quá 15 phút mà vẫn PENDING), update status
        if ("PENDING".equals(response.getStatus()) && isExpired(transaction)) {
            updateTransactionToExpired(transaction);
        }
    }
    
    /**
     * Kiểm tra transaction đã hết hạn chưa
     */
    private boolean isExpired(ZaloPayTransaction transaction) {
        // Mặc định thời gian hết hạn là 15 phút
        LocalDateTime expireTime = transaction.getCreatedAt().plusMinutes(15);
        return LocalDateTime.now().isAfter(expireTime);
    }
    
    /**
     * Update transaction sang trạng thái EXPIRED
     */
    private void updateTransactionToExpired(ZaloPayTransaction transaction) {
        try {
            transaction.setStatus(ZaloPayTransaction.TransactionStatus.EXPIRED);
            transactionRepository.save(transaction);
            log.info("Updated transaction {} to EXPIRED", transaction.getAppTransId());
        } catch (Exception e) {
            log.error("Error updating transaction to expired: {}", e.getMessage(), e);
        }
    }
}
