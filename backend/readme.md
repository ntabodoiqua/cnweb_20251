# Backend Microservices - E-Commerce Platform

## 📋 Tổng quan

Backend được xây dựng theo kiến trúc **Microservices** với Spring Boot, bao gồm 10 services chính để xử lý các chức năng của hệ thống e-commerce.

## 📁 Cấu trúc thư mục

```
backend/
├── api-gateway/          # API Gateway - Cổng giao tiếp chính
├── discovery-service/    # Service Registry (Eureka)
├── common-dto/           # Shared DTOs
├── user-service/         # Quản lý người dùng
├── product-service/      # Quản lý sản phẩm
├── order-service/        # Quản lý đơn hàng & giỏ hàng
├── payment-service/      # Xử lý thanh toán
├── notification-service/ # Gửi thông báo
├── file-service/         # Quản lý file/media
├── message-service/      # Chat real-time
├── docker-compose.prod.yaml
└── qodana.yaml
```

---

## 🔧 Mô tả từng Service

### 1️⃣ API Gateway

- Đóng vai trò là **"cửa ngõ"** cho toàn hệ thống
- Tất cả request từ client đều đi qua gateway trước khi điều hướng đến service phù hợp
- Áp dụng các cơ chế:
  - Routing
  - Load balancing
  - Authentication / Authorization (JWT)
  - Rate limiting

### 2️⃣ Discovery Service

- Sử dụng **Eureka Server** để:
  - Quản lý danh sách các service
  - Cho phép service tự đăng ký (service registry)
  - Giúp các service tìm nhau (service discovery)
  - Hỗ trợ load balancing và fault tolerance

### 3️⃣ Common DTO

- Chứa các **Data Transfer Object** dùng chung giữa nhiều service
- Giúp tránh trùng lặp cấu trúc dữ liệu
- Đảm bảo consistency về model khi truyền dữ liệu

### 4️⃣ User Service

- Quản lý tài khoản và thông tin người dùng
- **Chức năng chính:**
  - Đăng ký, đăng nhập
  - Xác thực email
  - JWT Token authentication
  - Phân quyền (Role + Permission)
  - Quản lý hồ sơ người dùng

### 5️⃣ Product Service

- Quản lý sản phẩm và cửa hàng
- **Chức năng chính:**
  - CRUD sản phẩm
  - Quản lý Category
  - Thuộc tính sản phẩm (variants, specs)
  - **Elasticsearch Integration** cho tìm kiếm:
    - Full-text search với hỗ trợ tiếng Việt
    - Autocomplete/Suggestion
    - Global Search (sản phẩm + cửa hàng)
    - Fuzzy search
  - Đánh giá sản phẩm (Rating)

### 6️⃣ Order Service

- Xử lý đơn hàng và giỏ hàng
- **Chức năng chính:**
  - Tạo và quản lý đơn hàng
  - Quản lý trạng thái đơn hàng
  - **Giỏ hàng với Redis:**
    - Hỗ trợ Guest cart (30 ngày) và User cart (90 ngày)
    - Merge cart khi đăng nhập
    - Async persistence to PostgreSQL
  - Tính toán tổng tiền

### 7️⃣ Payment Service

- Xử lý thanh toán
- **Tích hợp:**
  - ZaloPay
  - VNPay (có thể mở rộng)
- Xác nhận thanh toán và cập nhật Order Service

### 8️⃣ Notification Service

- Gửi thông báo qua các kênh:
  - Email (SMTP)
- **Các loại thông báo:**
  - Xác nhận đơn hàng
  - Xác thực tài khoản
  - Thông báo hệ thống
  - Cập nhật trạng thái đơn hàng

### 9️⃣ File Service

- Lưu trữ và quản lý file
- **Hỗ trợ:**
  - Upload ảnh sản phẩm
  - Upload avatar người dùng
  - Quản lý media files
  - Local storage (có thể mở rộng S3/Cloud Storage)

### 🔟 Message Service

- Xử lý **chat real-time** trong hệ thống e-commerce
- **Chức năng chính:**
  - Chat giữa Buyer và Seller (Shop)
  - Tin nhắn đa dạng: Text, Image, Product, Order, File, Sticker
  - Real-time messaging qua WebSocket/STOMP
  - Typing indicator (thông báo đang gõ)
  - Read receipts (thông báo đã đọc)
  - Reply to message
- **Tech Stack:**
  - Spring Boot 3.x
  - MongoDB
  - WebSocket + STOMP protocol
  - JWT Authentication

---

## 🐳 Docker Compose

### docker-compose.prod.yaml

- Dùng cho môi trường **production**
- Cấu hình tối ưu:
  - Không hot reload
  - Tối ưu RAM/CPU
  - Log driver, restart policy
  - Ánh xạ cổng tối thiểu

---

## 🔗 Luồng hoạt động tổng quát

```
┌─────────┐     ┌─────────────┐     ┌───────────────────┐
│  Client │ ──► │ API Gateway │ ──► │ Discovery Service │
└─────────┘     └─────────────┘     └───────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │     Target Microservice     │
        │  (User/Product/Order/...)   │
        └─────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Response    │
              │  via Gateway  │
              └───────────────┘
```

1. **Client** gửi request → **API Gateway**
2. **Gateway** xác thực và định tuyến request đến service tương ứng
3. Service giao tiếp qua **Discovery Service**
4. Mỗi service xử lý nghiệp vụ của riêng mình
5. Một số service gọi sang service khác (inter-service communication)
6. **Response** trả về client qua Gateway

---

## 📚 Tài liệu chi tiết

- [Message Service API](./message-service/MESSAGE_SERVICE_API.md)
- [Cart Implementation](./order-service/CART_IMPLEMENTATION.md)
- [Order Status API](./order-service/ORDER_STATUS_API.md)
- [Product Integration](./order-service/PRODUCT_INTEGRATION.md)
- [Elasticsearch Integration](./product-service/ELASTICSEARCH_INTEGRATION.md)
- [Product Selection API](./product-service/PRODUCT_SELECTION_API.md)
- [Rating API](./product-service/RATING_API.md)
