package com.vdt2025.product_service.service;

import com.vdt2025.product_service.dto.request.inventory.InventoryChangeRequest;
import com.vdt2025.product_service.dto.response.InventoryStockResponse;
import com.vdt2025.product_service.entity.InventoryStock;
import com.vdt2025.product_service.entity.InventoryTransaction;
import com.vdt2025.product_service.entity.Product;
import com.vdt2025.product_service.entity.ProductVariant;
import com.vdt2025.product_service.exception.AppException;
import com.vdt2025.product_service.exception.ErrorCode;
import com.vdt2025.product_service.repository.InventoryStockRepository;
import com.vdt2025.product_service.repository.InventoryTransactionRepository;
import com.vdt2025.product_service.repository.ProductVariantRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service implementation cho quản lý tồn kho
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    InventoryStockRepository inventoryStockRepository;
    ProductVariantRepository productVariantRepository;
    InventoryTransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public InventoryStockResponse getInventoryStock(String variantId) {
        log.debug("Getting inventory stock for variant: {}", variantId);
        
        InventoryStock stock = inventoryStockRepository.findByProductVariantId(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));
        
        return mapToResponse(stock);
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void reserveStock(String variantId, Integer quantity) {
        log.info("Reserving {} units of stock for variant: {}", quantity, variantId);
        
        // Validate input
        validateQuantity(quantity);
        
        // Lock inventory row for update (Pessimistic Locking)
        InventoryStock stock = inventoryStockRepository.findByProductVariantIdWithLock(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));
        
        // Business validation: check available stock
        if (!stock.canReserve(quantity)) {
            log.warn("Insufficient stock for variant {}: available={}, requested={}", 
                    variantId, stock.getAvailableQuantity(), quantity);
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }
        
        // Capture before state
        Integer reservedBefore = stock.getQuantityReserved();
        Integer onHandBefore = stock.getQuantityOnHand();
        
        // Update reserved quantity
        stock.setQuantityReserved(stock.getQuantityReserved() + quantity);
        
        // Validate invariant before save
        if (!stock.isValid()) {
            log.error("Invalid inventory state after reserve: variantId={}, onHand={}, reserved={}", 
                    variantId, stock.getQuantityOnHand(), stock.getQuantityReserved());
            throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
        }
        
        inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.RESERVE,
            0, // quantityChange (onHand không đổi)
            onHandBefore,
            stock.getQuantityOnHand(),
            reservedBefore,
            stock.getQuantityReserved(),
            "Reserved stock for order",
            null
        );
        
        log.info("Successfully reserved {} units for variant {}: onHand={}, reserved={}, available={}", 
                quantity, variantId, stock.getQuantityOnHand(), stock.getQuantityReserved(), 
                stock.getAvailableQuantity());
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void confirmSale(String variantId, Integer quantity) {
        log.info("Confirming sale of {} units for variant: {}", quantity, variantId);
        
        validateQuantity(quantity);
        
        // Lock inventory row
        InventoryStock stock = inventoryStockRepository.findByProductVariantIdWithLock(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));
        
        // Validate: must have reserved this quantity before
        if (!stock.canReleaseReserved(quantity)) {
            log.error("Cannot confirm sale: reserved={} < quantity={} for variant {}", 
                    stock.getQuantityReserved(), quantity, variantId);
            throw new AppException(ErrorCode.INVALID_INVENTORY_OPERATION);
        }
        
        // Capture before state
        Integer onHandBefore = stock.getQuantityOnHand();
        Integer reservedBefore = stock.getQuantityReserved();
        
        // Deduct from both onHand and reserved
        stock.setQuantityOnHand(stock.getQuantityOnHand() - quantity);
        stock.setQuantityReserved(stock.getQuantityReserved() - quantity);
        
        // Validate final state
        if (!stock.isValid()) {
            log.error("Invalid inventory state after confirm: variantId={}, onHand={}, reserved={}", 
                    variantId, stock.getQuantityOnHand(), stock.getQuantityReserved());
            throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
        }
        
        inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.CONFIRM_SALE,
            -quantity,
            onHandBefore,
            stock.getQuantityOnHand(),
            reservedBefore,
            stock.getQuantityReserved(),
            "Confirmed sale after payment success",
            "ORDER"
                // referenceId should be passed from caller
        );
        
        log.info("Successfully confirmed sale for variant {}: onHand={}, reserved={}, available={}", 
                variantId, stock.getQuantityOnHand(), stock.getQuantityReserved(), 
                stock.getAvailableQuantity());
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void releaseReservation(String variantId, Integer quantity) {
        log.info("Releasing {} units of reserved stock for variant: {}", quantity, variantId);
        
        validateQuantity(quantity);
        
        // Lock inventory row
        InventoryStock stock = inventoryStockRepository.findByProductVariantIdWithLock(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));
        
        // Validate: must have this much reserved
        if (!stock.canReleaseReserved(quantity)) {
            log.warn("Cannot release: reserved={} < quantity={} for variant {}", 
                    stock.getQuantityReserved(), quantity, variantId);
            throw new AppException(ErrorCode.INVALID_INVENTORY_OPERATION);
        }
        
        // Capture before state
        Integer onHandBefore = stock.getQuantityOnHand();
        Integer reservedBefore = stock.getQuantityReserved();
        
        // Only decrease reserved, keep onHand unchanged
        stock.setQuantityReserved(stock.getQuantityReserved() - quantity);
        
        if (!stock.isValid()) {
            log.error("Invalid inventory state after release: variantId={}, onHand={}, reserved={}", 
                    variantId, stock.getQuantityOnHand(), stock.getQuantityReserved());
            throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
        }
        
        inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.RELEASE_RESERVATION,
            0, // onHand không đổi
            onHandBefore,
            stock.getQuantityOnHand(),
            reservedBefore,
            stock.getQuantityReserved(),
            "Released reservation after order cancellation",
            "ORDER"
        );
        
        log.info("Successfully released {} units for variant {}: onHand={}, reserved={}, available={}", 
                quantity, variantId, stock.getQuantityOnHand(), stock.getQuantityReserved(), 
                stock.getAvailableQuantity());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public void adjustStock(String variantId, Integer newQuantity) {
        log.info("Adjusting stock to {} units for variant: {}", newQuantity, variantId);
        
        if (newQuantity == null || newQuantity < 0) {
            throw new AppException(ErrorCode.INVALID_STOCK_QUANTITY);
        }

        // Lock inventory row
        InventoryStock stock = inventoryStockRepository.findByProductVariantIdWithLock(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));

        // Kiểm tra quyền
        checkProductAccess(stock.getProductVariant());
        
        // Business rule: cannot set stock below reserved quantity
        if (newQuantity < stock.getQuantityReserved()) {
            log.error("Cannot adjust stock: newQuantity={} < reserved={} for variant {}", 
                    newQuantity, stock.getQuantityReserved(), variantId);
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK_FOR_RESERVED);
        }
        
        Integer oldQuantity = stock.getQuantityOnHand();
        Integer reservedBefore = stock.getQuantityReserved();
        
        stock.setQuantityOnHand(newQuantity);
        
        inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.STOCK_ADJUSTMENT,
            newQuantity - oldQuantity,
            oldQuantity,
            newQuantity,
            reservedBefore,
            stock.getQuantityReserved(),
            "Manual stock adjustment",
            "ADJUSTMENT"
        );
        
        log.info("Successfully adjusted stock for variant {}: {} -> {}, reserved={}, available={}", 
                variantId, oldQuantity, newQuantity, stock.getQuantityReserved(), 
                stock.getAvailableQuantity());
    }

    @Override
    @Transactional
    public void increaseStock(String variantId, Integer quantity) {
        log.info("Increasing stock by {} units for variant: {}", quantity, variantId);
        
        validateQuantity(quantity);
        
        // Lock and update
        InventoryStock stock = inventoryStockRepository.findByProductVariantIdWithLock(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));
        
        Integer onHandBefore = stock.getQuantityOnHand();
        Integer reservedBefore = stock.getQuantityReserved();
        
        stock.setQuantityOnHand(stock.getQuantityOnHand() + quantity);
        inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.STOCK_IN,
            quantity,
            onHandBefore,
            stock.getQuantityOnHand(),
            reservedBefore,
            stock.getQuantityReserved(),
            "Stock increased (purchase/return)",
            null
        );
        
        log.info("Successfully increased stock by {} units for variant {}", quantity, variantId);
    }

    @Override
    @Transactional
    public void decreaseStock(String variantId, Integer quantity) {
        log.info("Decreasing stock by {} units for variant: {}", quantity, variantId);
        
        validateQuantity(quantity);
        
        // Lock and check
        InventoryStock stock = inventoryStockRepository.findByProductVariantIdWithLock(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));
        
        // Validate available stock
        if (stock.getAvailableQuantity() < quantity) {
            log.error("Insufficient available stock for variant {}: available={}, requested={}", 
                    variantId, stock.getAvailableQuantity(), quantity);
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        Integer onHandBefore = stock.getQuantityOnHand();
        Integer reservedBefore = stock.getQuantityReserved();
        
        stock.setQuantityOnHand(stock.getQuantityOnHand() - quantity);
        inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.STOCK_OUT,
            -quantity,
            onHandBefore,
            stock.getQuantityOnHand(),
            reservedBefore,
            stock.getQuantityReserved(),
            "Stock decreased (damage/loss/offline sale)",
            null
        );
        
        log.info("Successfully decreased stock by {} units for variant {}", quantity, variantId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAvailableStock(String variantId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            return false;
        }
        
        return inventoryStockRepository.hasAvailableStock(variantId, quantity);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getAvailableStock(String variantId) {
        return inventoryStockRepository.getAvailableStock(variantId)
                .orElse(0);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isLowStock(String variantId) {
        InventoryStock stock = inventoryStockRepository.findByProductVariantId(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND));

        // Low stock if available <= 10% of onHand
        Integer onHand = stock.getQuantityOnHand();
        Integer available = stock.getAvailableQuantity();
        double threshold = onHand * 0.1;
        return available <= threshold;
    }

    @Override
    @Transactional
    public InventoryStockResponse createInventoryStock(String variantId, Integer initialQuantity) {
        log.info("Creating inventory stock for variant {} with initial quantity {}", 
                variantId, initialQuantity);
        
        if (initialQuantity == null || initialQuantity < 0) {
            throw new AppException(ErrorCode.INVALID_STOCK_QUANTITY);
        }
        
        // Check if inventory already exists
        if (inventoryStockRepository.findByProductVariantId(variantId).isPresent()) {
            log.warn("Inventory stock already exists for variant: {}", variantId);
            throw new AppException(ErrorCode.INVENTORY_STOCK_ALREADY_EXISTS);
        }
        
        // Get variant
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        
        // Create inventory
        InventoryStock stock = InventoryStock.builder()
                .productVariant(variant)
                .quantityOnHand(initialQuantity)
                .quantityReserved(0)
                .build();
        
        stock = inventoryStockRepository.save(stock);
        
        // Log transaction
        logTransaction(
            stock,
            InventoryTransaction.TransactionType.INITIAL_STOCK,
            initialQuantity,
            0,
            initialQuantity,
            0,
            0,
            "Initial stock creation",
            null
        );
        
        log.info("Successfully created inventory stock for variant {}: onHand={}", 
                variantId, initialQuantity);

        return mapToResponse(stock);
    }

    // ========== Helper Methods ==========

    private void checkProductAccess(ProductVariant variant) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = username.equals("admin"); // Simplified admin check
        boolean isStoreOwner = variant.getProduct().getStore().getUserName().equals(username);

        if (!isAdmin && !isStoreOwner) {
            log.warn("User {} is not authorized to access product {}", username, variant.getSku());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new AppException(ErrorCode.INVALID_STOCK_QUANTITY);
        }
    }

    private InventoryStockResponse mapToResponse(InventoryStock stock) {
        return InventoryStockResponse.builder()
                .id(stock.getId())
                .variantId(stock.getProductVariant().getId())
                .variantSku(stock.getProductVariant().getSku())
                .quantityOnHand(stock.getQuantityOnHand())
                .quantityReserved(stock.getQuantityReserved())
                .availableQuantity(stock.getAvailableQuantity())
                .inStock(stock.isInStock())
                .createdAt(stock.getCreatedAt())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }

    /**
     * Log inventory transaction for audit trail
     */
    private void logTransaction(
            InventoryStock stock,
            InventoryTransaction.TransactionType type,
            Integer quantityChange,
            Integer quantityBefore,
            Integer quantityAfter,
            Integer reservedBefore,
            Integer reservedAfter,
            String reason,
            String referenceType) {
        
        String performedBy;
        try {
            performedBy = SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            performedBy = "SYSTEM";
        }
        
        InventoryTransaction transaction = InventoryTransaction.builder()
                .variant(stock.getProductVariant())
                .transactionType(type)
                .quantityChange(quantityChange)
                .quantityBefore(quantityBefore)
                .quantityAfter(quantityAfter)
                .reservedBefore(reservedBefore)
                .reservedAfter(reservedAfter)
                .reason(reason)
                .performedBy(performedBy)
                .referenceType(referenceType)
                .referenceId(null)
                .build();
        
        transactionRepository.save(transaction);
        log.debug("Logged inventory transaction: type={}, variant={}, change={}", 
                type, stock.getProductVariant().getId(), quantityChange);
    }

    //=========== Internal methods ==========
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void reserveStockBatch(List<InventoryChangeRequest> requests) {
        if (requests == null || requests.isEmpty()) return;

        // BƯỚC 1: Gộp các request trùng variantId lại với nhau (đề phòng FE gửi trùng)
        // Map<VariantId, TotalQuantity>
        Map<String, Integer> quantityMap = requests.stream()
                .collect(Collectors.groupingBy(
                        InventoryChangeRequest::getVariantId,
                        Collectors.summingInt(InventoryChangeRequest::getQuantity)
                ));

        // BƯỚC 2: Lấy danh sách ID và SẮP XẾP TĂNG DẦN
        // Việc sort variantId giúp tránh Deadlock khi 2 transaction
        // cùng tranh chấp các resource giống nhau nhưng khác thứ tự.
        List<String> variantIds = quantityMap.keySet().stream()
                .sorted()
                .collect(Collectors.toList());

        log.info("Starting batch reserve for Variants: {}", variantIds);

        // BƯỚC 3: Lock DB
        List<InventoryStock> stocks = inventoryStockRepository.findAllByProductVariantIdInWithLock(variantIds);

        // Kiểm tra xem có lấy đủ số lượng bản ghi không (đề phòng ID rác)
        if (stocks.size() != variantIds.size()) {
            List<String> foundIds = stocks.stream()
                    .map(s -> s.getProductVariant().getId())
                    .toList();
            List<String> missingIds = variantIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();

            throw new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND);
        }

        // BƯỚC 4: Duyệt và xử lý logic
        List<InventoryTransaction> transactions = new ArrayList<>();

        for (InventoryStock stock : stocks) {
            String vId = stock.getProductVariant().getId();
            Integer requestedQty = quantityMap.get(vId);

            validateQuantity(requestedQty);

            // Check tồn kho
            if (!stock.canReserve(requestedQty)) {
                log.warn("Batch reserve failed for Variant {} insufficient. Available: {}, Requested: {}",
                        vId, stock.getAvailableQuantity(), requestedQty);
                // Ném lỗi -> Transaction Rollback toàn bộ các items trước đó
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }

            // Capture state cũ
            int onHandBefore = stock.getQuantityOnHand();
            int reservedBefore = stock.getQuantityReserved();

            // Update logic
            stock.setQuantityReserved(stock.getQuantityReserved() + requestedQty);

            // Validate state
            if (!stock.isValid()) {
                throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
            }

            // Tạo log transaction (nhưng chưa save vội)
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .variant(stock.getProductVariant())
                    .transactionType(InventoryTransaction.TransactionType.RESERVE)
                    .quantityChange(0) // onHand không đổi
                    .quantityBefore(onHandBefore)
                    .quantityAfter(stock.getQuantityOnHand())
                    .reservedBefore(reservedBefore)
                    .reservedAfter(stock.getQuantityReserved())
                    .reason("Batch reserve stock")
                    .performedBy(SecurityContextHolder.getContext().getAuthentication().getName())
                    .referenceType(null)
                    .referenceId(null)
                    .build();
            transactions.add(transaction);
            log.info("Reserved {} for variant {}", requestedQty, vId);
        }

        // BƯỚC 5: Save All
        inventoryStockRepository.saveAll(stocks);

        // Lưu transaction history
        transactionRepository.saveAll(transactions);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void confirmSaleBatch(List<InventoryChangeRequest> requests) {
        if (requests == null || requests.isEmpty()) return;

        // 1. Gom nhóm số lượng
        Map<String, Integer> quantityMap = requests.stream()
                .collect(Collectors.groupingBy(
                        InventoryChangeRequest::getVariantId,
                        Collectors.summingInt(InventoryChangeRequest::getQuantity)
                ));

        // 2. Sắp xếp ID để tránh Deadlock
        List<String> variantIds = quantityMap.keySet().stream()
                .sorted()
                .collect(Collectors.toList());

        // 3. Batch Lock DB (Pessimistic Write)
        List<InventoryStock> stocks = inventoryStockRepository.findAllByProductVariantIdInWithLock(variantIds);

        // Validate đủ số lượng bản ghi
        if (stocks.size() != variantIds.size()) {
            throw new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND);
        }

        // 4. Xử lý logic
        List<InventoryTransaction> transactions = new ArrayList<>(); // Nếu muốn lưu log

        for (InventoryStock stock : stocks) {
            String vId = stock.getProductVariant().getId();
            Integer confirmedQty = quantityMap.get(vId);

            validateQuantity(confirmedQty);

            // CHECK QUAN TRỌNG: Phải đảm bảo số lượng đã được Reserve trước đó
            // Nếu Reserved < Confirmed => Có lỗi logic (Ví dụ: Timeout hủy đơn nhưng Payment lại thành công sau đó)
            if (!stock.canReleaseReserved(confirmedQty)) {
                log.error("Data inconsistency. Variant {}: Reserved={}, Confirming={}",
                        vId, stock.getQuantityReserved(), confirmedQty);
                throw new AppException(ErrorCode.INVALID_INVENTORY_OPERATION);
            }

            // Capture state cũ (để log)
            int onHandBefore = stock.getQuantityOnHand();
            int reservedBefore = stock.getQuantityReserved();

            // UPDATE LOGIC: Trừ cả OnHand và Reserved
            stock.setQuantityOnHand(stock.getQuantityOnHand() - confirmedQty);
            stock.setQuantityReserved(stock.getQuantityReserved() - confirmedQty);

            // Validate state lần cuối
            if (!stock.isValid()) {
                throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
            }

            // Ghi log
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .variant(stock.getProductVariant())
                    .transactionType(InventoryTransaction.TransactionType.CONFIRM_SALE)
                    .quantityChange(-confirmedQty)
                    .quantityBefore(onHandBefore)
                    .quantityAfter(stock.getQuantityOnHand())
                    .reservedBefore(reservedBefore)
                    .reservedAfter(stock.getQuantityReserved())
                    .reason("Batch confirm sale")
                    .performedBy(SecurityContextHolder.getContext().getAuthentication().getName())
                    .referenceType("ORDER")
                    .referenceId(null)
                    .build();
            transactions.add(transaction);

            log.info("Confirmed sale {} for variant {})", confirmedQty, vId);
        }

        // 5. Save All
        inventoryStockRepository.saveAll(stocks);
        transactionRepository.saveAll(transactions);

        // TODO: Gửi Event (Kafka/RabbitMQ) báo "ItemSold" để:
        // - Service Product cập nhật "sold_count" (số lượng đã bán)
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void releaseReservationBatch(List<InventoryChangeRequest> requests) {
        if (requests == null || requests.isEmpty()) return;

        // 1. Gom nhóm số lượng (Group by VariantId)
        Map<String, Integer> quantityMap = requests.stream()
                .collect(Collectors.groupingBy(
                        InventoryChangeRequest::getVariantId,
                        Collectors.summingInt(InventoryChangeRequest::getQuantity)
                ));

        // 2. Sắp xếp ID để tránh Deadlock (Bắt buộc)
        List<String> variantIds = quantityMap.keySet().stream()
                .sorted()
                .collect(Collectors.toList());


        // 3. Batch Lock DB (Pessimistic Write)
        List<InventoryStock> stocks = inventoryStockRepository.findAllByProductVariantIdInWithLock(variantIds);

        if (stocks.size() != variantIds.size()) {
            throw new AppException(ErrorCode.INVENTORY_STOCK_NOT_FOUND);
        }

        // 4. Xử lý Logic
        for (InventoryStock stock : stocks) {
            String vId = stock.getProductVariant().getId();
            Integer quantityToRelease = quantityMap.get(vId);

            validateQuantity(quantityToRelease);

            // CHECK AN TOÀN: Có đủ hàng reserved để release không?
            // Nếu không đủ, chứng tỏ logic hệ thống bị sai (Release 2 lần? Hoặc chưa Reserve mà đã Release?)
            if (!stock.canReleaseReserved(quantityToRelease)) {
                log.error("Data inconsistency. Variant {}: Reserved={}, Releasing={}",
                        vId, stock.getQuantityReserved(), quantityToRelease);
                throw new AppException(ErrorCode.INVALID_INVENTORY_OPERATION);
            }

            // UPDATE LOGIC: Chỉ trừ Reserved, OnHand giữ nguyên
            stock.setQuantityReserved(stock.getQuantityReserved() - quantityToRelease);

            // Validate state
            if (!stock.isValid()) {
                throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
            }

            log.info("Released reservation {} for variant {})", quantityToRelease, vId);
        }

        // 5. Save All
        inventoryStockRepository.saveAll(stocks);
    }
}
