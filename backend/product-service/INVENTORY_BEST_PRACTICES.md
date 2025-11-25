# Cập nhật Product Service - Inventory Management Best Practices

## Tổng quan

Đã cập nhật product-service để áp dụng các best practices trong quản lý tồn kho (inventory management) cho hệ thống e-commerce.

## Các thay đổi chính

### 1. InventoryStock Entity - Cải thiện toàn diện

**File:** `backend/product-service/src/main/java/com/vdt2025/product_service/entity/InventoryStock.java`

#### Các cải tiến:

##### a) Validation & Constraints

- Thêm `@Min(0)` validation cho `quantityOnHand` và `quantityReserved`
- Đảm bảo số lượng không bao giờ âm
- Thêm `@Builder.Default` để khởi tạo giá trị mặc định

##### b) Optimistic Locking

```java
@Version
@Column(name = "version", nullable = false)
@Builder.Default
Long version = 0L;
```

- Tự động tăng version mỗi khi entity được update
- Ngăn chặn race condition khi nhiều request cùng update stock
- Throw `OptimisticLockException` nếu detect conflict

##### c) Database Indexes

```java
@Table(
    name = "inventory_stocks",
    indexes = {
        @Index(name = "idx_inventory_product_variant", columnList = "product_variant_id"),
        @Index(name = "idx_inventory_available", columnList = "quantity_on_hand, quantity_reserved")
    }
)
```

- Index trên `product_variant_id` cho lookup nhanh
- Composite index cho queries kiểm tra available stock

##### d) Business Logic Methods

```java
public Integer getAvailableQuantity() {
    return quantityOnHand - quantityReserved;
}

public boolean canReserve(Integer quantity) {
    return getAvailableQuantity() >= quantity;
}

public boolean isValid() {
    return quantityReserved <= quantityOnHand &&
           quantityOnHand >= 0 &&
           quantityReserved >= 0;
}
```

- Encapsulation: Logic tính toán nằm trong entity
- Reusability: Các method được dùng ở nhiều nơi
- Maintainability: Dễ maintain và test

##### e) Audit Fields

```java
@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
LocalDateTime createdAt;

@UpdateTimestamp
@Column(name = "updated_at", nullable = false)
LocalDateTime updatedAt;
```

---

### 2. InventoryStockRepository - Locking & Query Optimization

**File:** `backend/product-service/src/main/java/com/vdt2025/product_service/repository/InventoryStockRepository.java`

#### Các cải tiến:

##### a) Pessimistic Locking

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT i FROM InventoryStock i WHERE i.productVariant.id = :variantId")
Optional<InventoryStock> findByProductVariantIdWithLock(@Param("variantId") String variantId);
```

- Sử dụng `SELECT FOR UPDATE` để lock row
- Lock được giữ cho đến khi transaction commit/rollback
- Đảm bảo atomic operations cho critical inventory updates

##### b) Query Helper Methods

```java
@Query("SELECT CASE WHEN (i.quantityOnHand - i.quantityReserved) >= :quantity THEN true ELSE false END " +
       "FROM InventoryStock i WHERE i.productVariant.id = :variantId")
boolean hasAvailableStock(@Param("variantId") String variantId, @Param("quantity") Integer quantity);
```

- Các query helper giúp giảm database roundtrips
- Type-safe queries với JPQL

##### c) Deprecated Old Methods

```java
@Deprecated
@Modifying
@Query("UPDATE InventoryStock i SET i.quantityReserved = ...")
int reserveStock(...);
```

- Đánh dấu các bulk update queries là deprecated
- Khuyến khích dùng InventoryService với proper locking thay vì direct queries

---

### 3. InventoryService - Business Logic Layer

**Files:**

- `backend/product-service/src/main/java/com/vdt2025/product_service/service/InventoryService.java`
- `backend/product-service/src/main/java/com/vdt2025/product_service/service/InventoryServiceImpl.java`

#### Áp dụng SOLID Principles:

##### a) Single Responsibility Principle

- Tách riêng inventory logic khỏi ProductService
- InventoryService chỉ quan tâm đến inventory operations
- ProductService focus vào product domain logic

##### b) Transaction Management

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void reserveStock(String variantId, Integer quantity) {
    // 1. Lock
    InventoryStock stock = inventoryStockRepository
        .findByProductVariantIdWithLock(variantId)
        .orElseThrow(...);

    // 2. Validate
    if (!stock.canReserve(quantity)) {
        throw new AppException(ErrorCode.OUT_OF_STOCK);
    }

    // 3. Update
    stock.setQuantityReserved(stock.getQuantityReserved() + quantity);

    // 4. Save
    inventoryStockRepository.save(stock);

    // 5. Log transaction
    logTransaction(...);
}
```

**Transaction Isolation Levels:**

- `REPEATABLE_READ` cho critical operations (reserve, confirm, release)
- `READ_COMMITTED` (default) cho read operations
- Ngăn chặn phantom reads và non-repeatable reads

##### c) Concurrency Control Strategy

```
Pessimistic Locking (SELECT FOR UPDATE):
├─ reserveStock()
├─ confirmSale()
├─ releaseReservation()
└─ adjustStock()

Optimistic Locking (@Version):
└─ Tự động handle bởi Hibernate khi có concurrent modifications
```

##### d) Error Handling

```java
// Specific error codes
if (!stock.canReserve(quantity)) {
    throw new AppException(ErrorCode.OUT_OF_STOCK);
}

if (!stock.isValid()) {
    throw new AppException(ErrorCode.INVALID_INVENTORY_STATE);
}
```

##### e) Flow chuẩn cho E-commerce

```
Customer places order → reserveStock()
                        ├─ Lock inventory
                        ├─ Check available: (onHand - reserved) >= quantity
                        ├─ Increase reserved
                        └─ Save & log

Payment success → confirmSale()
                  ├─ Lock inventory
                  ├─ Decrease onHand
                  ├─ Decrease reserved
                  └─ Save & log

Payment failed/timeout → releaseReservation()
                         ├─ Lock inventory
                         ├─ Decrease reserved
                         ├─ Keep onHand unchanged
                         └─ Save & log
```

---

### 4. InventoryTransaction - Audit Trail

**Files:**

- `backend/product-service/src/main/java/com/vdt2025/product_service/entity/InventoryTransaction.java`
- `backend/product-service/src/main/java/com/vdt2025/product_service/repository/InventoryTransactionRepository.java`

#### Mục đích:

- Track tất cả thay đổi inventory
- Audit trail cho compliance
- Debugging và analytics

#### Transaction Types:

```java
public enum TransactionType {
    INITIAL_STOCK,          // Khởi tạo tồn kho
    STOCK_IN,               // Nhập hàng
    STOCK_OUT,              // Xuất hàng (bán)
    STOCK_ADJUSTMENT,       // Điều chỉnh
    RESERVE,                // Giữ chỗ
    RELEASE_RESERVATION,    // Xả hàng giữ chỗ
    CONFIRM_SALE,           // Xác nhận bán
    RETURN,                 // Hoàn hàng
    DAMAGE,                 // Hàng hỏng
    LOST,                   // Mất hàng
    TRANSFER_IN,            // Chuyển kho vào
    TRANSFER_OUT,           // Chuyển kho ra
    MANUAL_ADJUSTMENT       // Điều chỉnh thủ công
}
```

#### Stored Information:

```java
- variant: Product variant
- transactionType: Loại giao dịch
- quantityChange: Thay đổi (+/-)
- quantityBefore/After: Trạng thái trước/sau
- reservedBefore/After: Reserved trước/sau
- reason: Lý do
- performedBy: User thực hiện
- referenceType/Id: Tham chiếu (ORDER, ADJUSTMENT, etc.)
- metadata: JSON metadata (optional)
- createdAt: Timestamp
```

#### Indexes:

```java
indexes = {
    @Index(name = "idx_inv_tx_variant", columnList = "variant_id"),
    @Index(name = "idx_inv_tx_type", columnList = "transaction_type"),
    @Index(name = "idx_inv_tx_created", columnList = "created_at"),
    @Index(name = "idx_inv_tx_reference", columnList = "reference_type, reference_id")
}
```

---

### 5. ProductVariant Entity - Relationship Update

**File:** `backend/product-service/src/main/java/com/vdt2025/product_service/entity/ProductVariant.java`

#### Thay đổi:

```java
// One-to-One với InventoryStock
@OneToOne(mappedBy = "productVariant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
InventoryStock inventoryStock;
```

**Lợi ích:**

- Bidirectional relationship giúp navigate dễ dàng
- `cascade = CascadeType.ALL`: Tự động cascade operations
- `orphanRemoval = true`: Tự động xóa inventory khi variant bị xóa
- `fetch = FetchType.LAZY`: Không load inventory khi không cần

---

### 6. Error Codes - Mở rộng

**File:** `backend/product-service/src/main/java/com/vdt2025/product_service/exception/ErrorCode.java`

#### Thêm error codes mới:

```java
INVALID_INVENTORY_STATE(1904, "error.1904", HttpStatus.INTERNAL_SERVER_ERROR),
INVALID_INVENTORY_OPERATION(1905, "error.1905", HttpStatus.BAD_REQUEST),
INVALID_STOCK_QUANTITY(1906, "error.1906", HttpStatus.BAD_REQUEST),
INVENTORY_STOCK_ALREADY_EXISTS(1907, "error.1907", HttpStatus.CONFLICT),
```

---

## Best Practices Summary

### 1. **Concurrency Control**

- ✅ Pessimistic Locking cho critical updates
- ✅ Optimistic Locking với @Version field
- ✅ Transaction isolation REPEATABLE_READ
- ✅ Double-check validation sau khi lock

### 2. **Data Integrity**

- ✅ Validation constraints (@Min, @NotNull)
- ✅ Business rule validation (canReserve, isValid)
- ✅ Invariant: reserved <= onHand, onHand >= 0
- ✅ Atomic operations trong transaction

### 3. **Performance**

- ✅ Database indexes cho frequent queries
- ✅ Minimize roundtrips (load + check + update trong 1 transaction)
- ✅ Lazy loading cho relationships
- ✅ Query optimization với JPQL

### 4. **Maintainability**

- ✅ Single Responsibility: Tách inventory logic riêng
- ✅ Clear method names và comprehensive Javadoc
- ✅ Encapsulation: Business logic trong entity
- ✅ Type-safe với enums

### 5. **Observability**

- ✅ Comprehensive logging (info, warn, error)
- ✅ Audit trail với InventoryTransaction
- ✅ Track before/after states
- ✅ Record user và reason

### 6. **Error Handling**

- ✅ Specific error codes
- ✅ Clear error messages
- ✅ Fail-fast validation
- ✅ Proper exception hierarchy

---

## Migration Notes

### Database Migration Required

#### 1. Thêm version column vào inventory_stocks

```sql
ALTER TABLE inventory_stocks
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
```

#### 2. Tạo indexes

```sql
CREATE INDEX idx_inventory_product_variant ON inventory_stocks(product_variant_id);
CREATE INDEX idx_inventory_available ON inventory_stocks(quantity_on_hand, quantity_reserved);
```

#### 3. Tạo inventory_transactions table

```sql
CREATE TABLE inventory_transactions (
    id VARCHAR(36) PRIMARY KEY,
    variant_id VARCHAR(36) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    quantity_change INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    reserved_before INT NOT NULL,
    reserved_after INT NOT NULL,
    reason TEXT,
    performed_by VARCHAR(100),
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    metadata TEXT,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    INDEX idx_inv_tx_variant (variant_id),
    INDEX idx_inv_tx_type (transaction_type),
    INDEX idx_inv_tx_created (created_at),
    INDEX idx_inv_tx_reference (reference_type, reference_id)
);
```

---

## Usage Examples

### Ví dụ 1: Customer đặt hàng

```java
@Service
public class OrderService {

    @Autowired
    private InventoryService inventoryService;

    @Transactional
    public Order createOrder(OrderRequest request) {
        // 1. Validate và tạo order
        Order order = ...;

        // 2. Reserve stock cho từng item
        for (OrderItem item : order.getItems()) {
            try {
                inventoryService.reserveStock(
                    item.getVariantId(),
                    item.getQuantity()
                );
            } catch (AppException e) {
                if (e.getErrorCode() == ErrorCode.OUT_OF_STOCK) {
                    // Handle out of stock
                }
                throw e;
            }
        }

        return orderRepository.save(order);
    }
}
```

### Ví dụ 2: Payment success

```java
@Service
public class PaymentService {

    @Autowired
    private InventoryService inventoryService;

    @Transactional
    public void handlePaymentSuccess(String orderId) {
        Order order = orderRepository.findById(orderId)...;

        // Confirm sale - trừ stock thực sự
        for (OrderItem item : order.getItems()) {
            inventoryService.confirmSale(
                item.getVariantId(),
                item.getQuantity()
            );
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
    }
}
```

### Ví dụ 3: Order timeout/cancel

```java
@Service
public class OrderTimeoutService {

    @Autowired
    private InventoryService inventoryService;

    @Transactional
    public void handleOrderTimeout(String orderId) {
        Order order = orderRepository.findById(orderId)...;

        // Release reserved stock
        for (OrderItem item : order.getItems()) {
            inventoryService.releaseReservation(
                item.getVariantId(),
                item.getQuantity()
            );
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
```

### Ví dụ 4: Seller điều chỉnh stock

```java
@Service
public class ProductManagementService {

    @Autowired
    private InventoryService inventoryService;

    @PreAuthorize("hasRole('SELLER')")
    @Transactional
    public void adjustInventory(String variantId, Integer newQuantity) {
        // Validate quyền seller
        checkSellerAccess(variantId);

        // Adjust stock
        inventoryService.adjustStock(variantId, newQuantity);
    }
}
```

---

## Testing Recommendations

### Unit Tests

```java
@Test
public void testReserveStock_Success() {
    // Given
    InventoryStock stock = InventoryStock.builder()
        .quantityOnHand(100)
        .quantityReserved(20)
        .build();

    // When
    inventoryService.reserveStock(variantId, 30);

    // Then
    assertEquals(100, stock.getQuantityOnHand());
    assertEquals(50, stock.getQuantityReserved());
}

@Test
public void testReserveStock_InsufficientStock() {
    // Given: available = 100 - 90 = 10
    InventoryStock stock = InventoryStock.builder()
        .quantityOnHand(100)
        .quantityReserved(90)
        .build();

    // When & Then
    assertThrows(AppException.class, () -> {
        inventoryService.reserveStock(variantId, 20);
    });
}
```

### Integration Tests

```java
@Test
@Transactional
public void testConcurrentReserve() throws Exception {
    // Test pessimistic locking
    ExecutorService executor = Executors.newFixedThreadPool(10);

    for (int i = 0; i < 10; i++) {
        executor.submit(() -> {
            inventoryService.reserveStock(variantId, 10);
        });
    }

    executor.shutdown();
    executor.awaitTermination(10, TimeUnit.SECONDS);

    // Verify final state
    InventoryStock stock = inventoryStockRepository
        .findByProductVariantId(variantId).get();

    assertTrue(stock.isValid());
}
```

---

## Performance Considerations

### 1. Index Usage

- Tất cả queries trên `product_variant_id` sẽ sử dụng index
- Composite index cho available stock checks

### 2. N+1 Query Prevention

- Sử dụng `@EntityGraph` hoặc JOIN FETCH khi cần load inventory cùng variant
- Lazy loading cho relationships không cần thiết

### 3. Batch Operations

- Nếu cần update nhiều variants, consider batch processing
- Use `saveAll()` cho bulk updates

### 4. Caching Strategy

- **KHÔNG** cache inventory data (realtime critical)
- Cache product catalog data
- Cache category/brand data

---

## Monitoring & Alerts

### Metrics to Track

1. **Inventory Operations**

   - Reserve success rate
   - Reserve failures (out of stock)
   - Average response time

2. **Lock Contention**

   - Pessimistic lock wait time
   - Optimistic lock failures (version conflicts)

3. **Stock Levels**

   - Low stock alerts (available < threshold)
   - Items with high reserved ratio

4. **Audit Trail**
   - Transaction volume by type
   - Top products by transaction count

---

## Future Enhancements

### 1. Inventory Alerts

```java
@Service
public class InventoryAlertService {

    @Scheduled(fixedDelay = 300000) // 5 phút
    public void checkLowStock() {
        List<InventoryStock> lowStock =
            inventoryStockRepository.findLowStockItems(threshold);

        for (InventoryStock stock : lowStock) {
            sendLowStockAlert(stock);
        }
    }
}
```

### 2. Inventory Forecasting

- Dự đoán nhu cầu dựa trên lịch sử
- Suggest reorder points
- Seasonal trend analysis

### 3. Multi-warehouse Support

- Extend InventoryStock với warehouse_id
- Stock transfer between warehouses
- Warehouse-specific availability checks

### 4. Safety Stock

- Thêm safety_stock field
- Modify available calculation: (onHand - reserved - safetyStock)

---

## Kết luận

Hệ thống inventory management đã được cập nhật theo các best practices:

✅ **Concurrency-safe**: Pessimistic + Optimistic locking  
✅ **Data integrity**: Validation + Business rules  
✅ **Auditable**: Complete transaction history  
✅ **Performant**: Indexed queries + Optimized transactions  
✅ **Maintainable**: Clean architecture + SOLID principles  
✅ **Testable**: Clear interfaces + Dependency injection

Code hiện tại sẵn sàng cho production environment và có thể scale theo nhu cầu business.
