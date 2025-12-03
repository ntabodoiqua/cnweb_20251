# Phân tích các Pattern Microservices trong Hệ thống Backend

Báo cáo này trình bày các pattern microservices đã được áp dụng và các pattern chưa được áp dụng (hoặc chưa thấy rõ) trong hệ thống backend hiện tại.

## 1. Các Pattern Đã Áp Dụng

Hệ thống đã áp dụng khá đầy đủ các pattern cốt lõi của kiến trúc Microservices hiện đại.

### 1.1. Core Patterns

- **Microservices Architecture**: Hệ thống được chia nhỏ thành các dịch vụ độc lập theo nghiệp vụ:
  - `user-service`: Quản lý người dùng.
  - `product-service`: Quản lý sản phẩm.
  - `order-service`: Quản lý đơn hàng.
  - `payment-service`: Quản lý thanh toán.
  - `file-service`: Quản lý file/upload.
  - `notification-service`: Quản lý thông báo.
  - `message-service`: Quản lý tin nhắn/chat.
- **Database per Service**: Mỗi dịch vụ (ví dụ: `product-service`) có cấu hình kết nối cơ sở dữ liệu riêng (PostgreSQL), đảm bảo tính lỏng lẻo (loose coupling).

### 1.2. Routing & Discovery

- **API Gateway**: Sử dụng **Spring Cloud Gateway** (`api-gateway`) làm điểm vào duy nhất cho hệ thống.
  - Định tuyến (Routing) đến các dịch vụ backend.
  - Tích hợp Service Discovery.
- **Service Discovery**: Sử dụng **Netflix Eureka** (`discovery-service`) để các dịch vụ tự động đăng ký và phát hiện lẫn nhau.
  - Client-side discovery được sử dụng trong `api-gateway` và các dịch vụ khác (`spring-cloud-starter-netflix-eureka-client`).

### 1.3. Communication & Data Management

- **Inter-service Communication**:
  - **Synchronous (Đồng bộ)**: Sử dụng **OpenFeign** (`spring-cloud-starter-openfeign`) để gọi REST API giữa các dịch vụ (ví dụ: `product-service` gọi `file-service`).
  - **Asynchronous (Bất đồng bộ)**: Sử dụng **RabbitMQ** (`spring-boot-starter-amqp`) cho giao tiếp dựa trên sự kiện.
- **Event-Driven Architecture**: Sử dụng RabbitMQ để phát các sự kiện (domain events) khi dữ liệu thay đổi.
  - Ví dụ: `ProductServiceImpl` phát sự kiện `ProductCreated`, `ProductUpdated` để đồng bộ dữ liệu.
- **CQRS (Command Query Responsibility Segregation)**:
  - Áp dụng trong `product-service`.
  - **Write Model**: Sử dụng PostgreSQL cho các thao tác thêm/sửa/xóa.
  - **Read Model**: Sử dụng **Elasticsearch** (`spring-boot-starter-data-elasticsearch`) cho các thao tác tìm kiếm phức tạp. Dữ liệu được đồng bộ từ PostgreSQL sang Elasticsearch thông qua RabbitMQ.
- **Shared Library**: Sử dụng module `common-dto` để chia sẻ các DTO (Data Transfer Objects) và Feign Client interfaces giữa các dịch vụ, giảm lặp code.
- **Distributed Caching**: Sử dụng **Redis** (`spring-boot-starter-data-redis`) để cache dữ liệu (ví dụ: cache thông tin sản phẩm, kết quả tìm kiếm) nhằm tăng hiệu năng.

### 1.4. Observability & Monitoring

- **Log Aggregation**: Sử dụng stack **Loki + Promtail** để thu thập và tập trung log từ các container.
- **Metrics & Monitoring**: Sử dụng **Prometheus** để thu thập metrics và **Grafana** (thường đi kèm) để hiển thị.
  - Các dịch vụ tích hợp `spring-boot-starter-actuator` và `micrometer-registry-prometheus`.
- **Health Check API**: Sử dụng Spring Boot Actuator để cung cấp các endpoint kiểm tra sức khỏe (`/actuator/health`).

## 2. Các Pattern Chưa Áp Dụng (Hoặc Cần Bổ Sung)

Một số pattern quan trọng giúp tăng tính ổn định và khả năng phục hồi của hệ thống chưa được tìm thấy hoặc chưa được cấu hình rõ ràng.

### 2.1. Resilience & Fault Tolerance

- **Circuit Breaker**: Chưa thấy cấu hình rõ ràng của **Resilience4j** hoặc **Hystrix**.
  - _Rủi ro_: Khi một dịch vụ (ví dụ: `file-service`) bị lỗi hoặc chậm, nó có thể kéo theo các dịch vụ gọi nó (ví dụ: `product-service`) bị treo, gây ra lỗi dây chuyền (cascading failures).
- **Bulkhead**: Chưa thấy áp dụng để cô lập tài nguyên (thread pool) cho các tác vụ khác nhau.
- **Rate Limiting**: Chưa thấy cấu hình giới hạn tốc độ request trong API Gateway để bảo vệ hệ thống khỏi quá tải hoặc tấn công DDoS.

### 2.2. Configuration Management

- **Centralized Configuration**: Chưa sử dụng **Spring Cloud Config Server**.
  - Hiện tại cấu hình (`application.yaml`) nằm rải rác trong từng source code của dịch vụ.
  - _Hạn chế_: Khó quản lý cấu hình tập trung, khó thay đổi cấu hình runtime mà không cần redeploy.

### 2.3. Tracing & Transaction

- **Distributed Tracing**: Chưa thấy tích hợp **Zipkin** hoặc **Micrometer Tracing (Sleuth)**.
  - _Hạn chế_: Khó theo dõi luồng đi của một request qua nhiều microservices để debug lỗi hoặc tối ưu hiệu năng.
- **Saga Pattern**: Chưa thấy implement rõ ràng (Orchestration hoặc Choreography framework) để quản lý Distributed Transactions.
  - Mặc dù có Event-Driven, nhưng việc đảm bảo tính nhất quán dữ liệu (data consistency) qua nhiều dịch vụ khi có lỗi xảy ra (rollback/compensation) chưa được chuẩn hóa.

## 3. Tổng Kết

Hệ thống đã có nền tảng Microservices vững chắc với đầy đủ các thành phần cơ bản (Gateway, Discovery, Event Bus, Caching, Monitoring). Để nâng cao độ tin cậy (Reliability) và khả năng vận hành (Operability), nên cân nhắc bổ sung:

1.  **Circuit Breaker (Resilience4j)** cho các giao tiếp Feign Client.
2.  **Distributed Tracing (Zipkin/Jaeger)** để theo dõi request.
3.  **Centralized Config (Spring Cloud Config)** để quản lý cấu hình tốt hơn.
