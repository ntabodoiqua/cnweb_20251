# Tích Hợp Order-Service ↔ Product-Service

## Tổng Quan

Đã triển khai đầy đủ tích hợp giữa order-service và product-service sử dụng Feign Client để đảm bảo giỏ hàng luôn có dữ liệu chính xác và hợp lệ.

---

## 📋 Các Component Đã Tạo

### 🔷 Order-Service (Consumer)

#### 1. Feign Client

**File:** `ProductClient.java`

```java
@FeignClient(name = "product-service", path = "/internal/products")
```

**Các API được gọi:**

- `GET /{productId}` - Lấy thông tin sản phẩm
- `GET /variants/{variantId}` - Lấy thông tin variant
- `GET /validate` - Validate nhiều sản phẩm/variants
- `POST /update-stock` - Cập nhật tồn kho
- `POST /batch-update-stock` - Cập nhật tồn kho hàng loạt

#### 2. DTOs (Data Transfer Objects)

- **ProductInfoDTO** - Thông tin cơ bản của sản phẩm
- **VariantInfoDTO** - Thông tin variant
- **ProductValidationDTO** - Kết quả validation

#### 3. Enhanced CartService

**Tính năng mới:**

- ✅ **Validate sản phẩm** khi thêm vào giỏ hàng
- ✅ **Kiểm tra tồn kho** realtime từ product-service
- ✅ **Đồng bộ giá** từ product-service (không tin frontend)
- ✅ **Validate toàn bộ giỏ** trước khi checkout
- ✅ **Cập nhật giá tự động** nếu có thay đổi

### 🔷 Product-Service (Provider)

#### 1. Internal Controller

**File:** `InternalController.java`

```java
@RestController
@RequestMapping("/internal/products")
```

**Endpoints:**

- `GET /{productId}` - Get product for internal use
- `GET /variants/{variantId}` - Get variant for internal use
- `GET /validate` - Validate products and variants
- `POST /update-stock` - Update stock quantity
- `POST /batch-update-stock` - Batch update stock

#### 2. DTOs

- **ProductInternalDTO** - Lightweight product info
- **VariantInternalDTO** - Lightweight variant info
- **ProductValidationDTO** - Validation result

#### 3. Enhanced ProductService

**Methods mới:**

```java
ProductInternalDTO getProductForInternal(String productId);
VariantInternalDTO getVariantForInternal(String variantId);
List<ProductValidationDTO> validateProductsAndVariants(...);
void updateStock(String productId, String variantId, Integer quantity);
void batchUpdateStock(List<StockUpdateRequest> updates);
```

---

## 🔄 Luồng Hoạt Động

### 1. Thêm Sản Phẩm Vào Giỏ

```
User → Order-Service → Product-Service
  1. POST /api/v1/cart/items
     {
       "productId": "prod-123",
       "variantId": "var-456",
       "quantity": 2
     }

  2. Order-Service gọi Product-Service:
     GET /internal/products/variants/var-456

  3. Product-Service trả về:
     {
       "id": "var-456",
       "price": 299000,
       "stockQuantity": 50,
       "isActive": true
     }

  4. Order-Service validate:
     - Sản phẩm còn active?
     - Đủ tồn kho? (50 >= 2) ✅
     - Giá từ product-service: 299000

  5. Lưu vào Redis với giá chính xác
  6. Async persist vào DB
```

### 2. Cập Nhật Số Lượng

```
User → Order-Service → Product-Service
  1. PUT /api/v1/cart/items
     {
       "productId": "prod-123",
       "variantId": "var-456",
       "quantity": 5
     }

  2. Order-Service validate stock:
     GET /internal/products/variants/var-456

  3. Kiểm tra tồn kho: 50 >= 5? ✅

  4. Cập nhật trong Redis
  5. Async persist vào DB
```

### 3. Validate Giỏ Hàng (Trước Checkout)

```
User → Order-Service → Product-Service
  1. GET /api/v1/cart/validate

  2. Order-Service lấy giỏ hàng từ Redis

  3. Với mỗi item, gọi Product-Service:
     GET /internal/products/variants/{variantId}

  4. Validate:
     - Sản phẩm còn active? ✅
     - Đủ tồn kho? ✅
     - Giá có thay đổi?
       * Cũ: 299000
       * Mới: 279000 (giảm giá!)
       → Cập nhật giá mới trong giỏ

  5. Trả về kết quả:
     - true: Tất cả OK
     - false: Có thay đổi (giá, tồn kho, availability)
```

### 4. Đặt Hàng (Order Creation)

```
User → Order-Service → Product-Service
  1. POST /api/v1/orders

  2. Validate toàn bộ giỏ hàng

  3. Tạo order

  4. Giảm tồn kho:
     POST /internal/products/batch-update-stock
     [
       { "productId": "prod-123", "variantId": "var-456", "quantity": -2 },
       { "productId": "prod-789", "variantId": "var-012", "quantity": -1 }
     ]

  5. Xóa giỏ hàng
```

### 5. Hủy Đơn Hàng

```
User → Order-Service → Product-Service
  1. POST /api/v1/orders/{orderId}/cancel

  2. Hoàn tồn kho:
     POST /internal/products/batch-update-stock
     [
       { "productId": "prod-123", "variantId": "var-456", "quantity": +2 },
       { "productId": "prod-789", "variantId": "var-012", "quantity": +1 }
     ]

  3. Cập nhật trạng thái order
```

---

## 🛡️ Validation & Security

### 1. Validation Khi Thêm Vào Giỏ

```java
// CartService.addToCart()
- Kiểm tra sản phẩm còn active
- Kiểm tra tồn kho đủ không
- Lấy giá từ product-service (không tin frontend)
- Validate variant tồn tại
```

### 2. Giá Luôn Chính Xác

```java
// Frontend GỬI giá → KHÔNG dùng
// Order-service LẤY giá từ product-service → DÙNG

request.setPrice(variant.getPrice());          // ✅ Từ DB
request.setOriginalPrice(variant.getOriginalPrice()); // ✅ Từ DB
```

### 3. Tồn Kho Realtime

```java
// Không lưu stock trong order-service
// Luôn query từ product-service
if (variant.getStockQuantity() < request.getQuantity()) {
    throw new RuntimeException("Insufficient stock");
}
```

### 4. Price Update Detection

```java
// validateCart() tự động phát hiện giá thay đổi
if (!variant.getPrice().equals(item.getPrice())) {
    log.warn("Price changed: old={} new={}", item.getPrice(), variant.getPrice());
    item.setPrice(variant.getPrice()); // Cập nhật giá mới
    return false; // User cần confirm
}
```

---

## 📊 Ưu Điểm Của Thiết Kế

### 1. Single Source of Truth

- **Giá:** Luôn từ product-service
- **Tồn kho:** Realtime từ product-service
- **Trạng thái:** Active/Deleted từ product-service

### 2. Data Consistency

- Giỏ hàng luôn có giá đúng
- Không bán sản phẩm hết hàng
- Không bán sản phẩm đã inactive

### 3. Security

- Frontend không thể gửi giá giả
- Order-service validate mọi thao tác
- Tồn kho được protect từ product-service

### 4. Scalability

- Mỗi service độc lập
- Feign Client handle load balancing
- Eureka Service Discovery

### 5. Maintainability

- Clear separation of concerns
- Internal APIs rõ ràng
- Dễ debug và monitor

---

## 🔧 Configuration

### Order-Service

```yaml
# application.yaml
eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka/

spring:
  cloud:
    openfeign:
      client:
        config:
          product-service:
            connectTimeout: 5000
            readTimeout: 5000
```

### Product-Service

```yaml
# application.yaml
eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka/
```

---

## 🧪 Testing

### Test Add to Cart

```bash
# 1. Thêm sản phẩm vào giỏ
POST http://localhost:8085/api/v1/cart/items
Headers:
  X-Session-Id: guest-123
  Content-Type: application/json
Body:
{
  "productId": "prod-123",
  "variantId": "var-456",
  "quantity": 2
}

# Expected:
# - Gọi product-service để lấy giá
# - Validate tồn kho
# - Lưu vào Redis với giá từ product-service
```

### Test Validate Cart

```bash
# 2. Validate giỏ hàng
GET http://localhost:8085/api/v1/cart/validate
Headers:
  X-Session-Id: guest-123

# Expected:
# - Kiểm tra tất cả items
# - Phát hiện giá thay đổi
# - Trả về false nếu có vấn đề
```

### Test Price Update

```bash
# 3. Product-service giảm giá
PUT http://localhost:8083/api/v1/products/variants/var-456
Body: { "price": 249000 }

# 4. Validate lại giỏ
GET http://localhost:8085/api/v1/cart/validate

# Expected:
# - Phát hiện giá thay đổi: 299000 → 249000
# - Tự động cập nhật giá trong giỏ
# - Trả về false (cần user confirm)
```

---

## 📝 API Endpoints Summary

### Order-Service (Public)

| Method | Endpoint                | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/api/v1/cart`          | Lấy giỏ hàng                          |
| POST   | `/api/v1/cart/items`    | Thêm sản phẩm (có validate)           |
| PUT    | `/api/v1/cart/items`    | Cập nhật số lượng (có validate stock) |
| DELETE | `/api/v1/cart/items`    | Xóa sản phẩm                          |
| DELETE | `/api/v1/cart`          | Xóa giỏ hàng                          |
| POST   | `/api/v1/cart/merge`    | Merge giỏ hàng                        |
| GET    | `/api/v1/cart/count`    | Số lượng items                        |
| GET    | `/api/v1/cart/validate` | Validate giỏ (NEW)                    |

### Product-Service (Internal)

| Method | Endpoint                                | Description                |
| ------ | --------------------------------------- | -------------------------- |
| GET    | `/internal/products/{id}`               | Get product info           |
| GET    | `/internal/products/variants/{id}`      | Get variant info           |
| GET    | `/internal/products/validate`           | Validate products/variants |
| POST   | `/internal/products/update-stock`       | Update stock               |
| POST   | `/internal/products/batch-update-stock` | Batch update stock         |

---

## ✅ Checklist

- [x] Tạo ProductClient trong order-service
- [x] Tạo DTOs cho communication
- [x] Tạo InternalController trong product-service
- [x] Implement validation methods trong ProductService
- [x] Update CartService với product validation
- [x] Thêm validate cart endpoint
- [x] Đồng bộ giá từ product-service
- [x] Kiểm tra tồn kho realtime
- [x] Phát hiện thay đổi giá tự động
- [x] Documentation đầy đủ

---

## 🎯 Tóm Tắt

**Đã đồng bộ hoàn toàn giữa order-service và product-service:**

1. ✅ **Validation đầy đủ** khi thêm/cập nhật giỏ hàng
2. ✅ **Giá chính xác** từ product-service (không tin frontend)
3. ✅ **Tồn kho realtime** để tránh overselling
4. ✅ **Phát hiện thay đổi** giá tự động
5. ✅ **Security** - Frontend không thể manipulate giá
6. ✅ **Consistency** - Single source of truth cho product data

**Hệ thống giờ đã production-ready!** 🚀
