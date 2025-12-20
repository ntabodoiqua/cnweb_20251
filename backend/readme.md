Mô tả từng service
1️⃣ API Gateway
- Đóng vai trò là "cửa ngõ" cho toàn hệ thống.
- Tất cả request từ client đều đi qua gateway trước khi điều hướng đến từng service phù hợp.
- Áp dụng các cơ chế:
  + Routing
  + Load balancing
  + Authentication / Authorization
  + Rate limiting (tùy phiên bản)

2️⃣ Discovery Service
- Thường sử dụng Eureka (hoặc Consul), dùng để:
- Quản lý danh sách các service.
- Cho phép service tự đăng ký (service registry).
- Giúp các service tìm nhau (service discovery).
- Hỗ trợ load balancing và fault tolerance.

3️⃣ Common DTO
- Chứa các Data Transfer Object dùng chung giữa nhiều service.
- Giúp tránh trùng lặp cấu trúc dữ liệu.
- Đảm bảo consistency về model khi truyền dữ liệu.

4️⃣ User Service
- Quản lý tài khoản và thông tin người dùng.
- Các chức năng chính:
- Đăng ký, đăng nhập
- Xác thực email
- JWT Token
- Phân quyền (Role + Permission)
- Quản lý hồ sơ người dùng

5️⃣ Product Service
- Quản lý sản phẩm.
- Chức năng chính:
- CRUD sản phẩm
- Category
- Thuộc tính sản phẩm
- Tìm kiếm

6️⃣ Order Service
- Xử lý đơn hàng.
- Chức năng chính:
- Tạo đơn hàng
- Quản lý trạng thái
- Xử lý giỏ hàng (tuỳ dự án)
- Tính toán tổng tiền

7️⃣ Payment Service
- Xử lý thanh toán.
- Có thể tích hợp:
- zalo pay
- Xác nhận thanh toán và cập nhật Order Service.

8️⃣ Notification Service
- Gửi thông báo qua:
  + Email
- Ví dụ:
  + Xác nhận đơn hàng
  + Xác thực tài khoản
  + Thông báo hệ thống

9️⃣ File Service
- Lưu trữ và quản lý file.
- Hỗ trợ:
- Upload ảnh sản phẩm
- Upload avatar người dùng
- Có thể tích hợp S3 / Cloud Storage

🐳 Docker Compose
- docker-compose.yaml
- Dùng cho môi trường development.
- Hỗ trợ:
- Hot reload
- Logging đơn giản
- Container volume để dev nhanh
- docker-compose.prod.yaml
- Dùng cho production.
- Cấu hình tối ưu:
- Không hot reload
- Tối ưu RAM/CPU
- Thêm log driver, restart policy
- Ánh xạ cổng tối thiểu

🔗 Luồng hoạt động tổng quát
Client gửi request → API Gateway
Gateway định tuyến request đến service tương ứng
Service giao tiếp qua Discovery Service
Mỗi service xử lý nghiệp vụ của riêng mình
Một số service gọi sang service khác (inter-service communication)
Response trả về client qua Gateway

-------------------------------------------

Mô tả từng service
1️⃣ API Gateway
- Đóng vai trò là "cửa ngõ" cho toàn hệ thống.
- Tất cả request từ client đều đi qua gateway trước khi điều hướng đến từng service phù hợp.
- Áp dụng các cơ chế:
    + Routing
    + Load balancing
    + Authentication / Authorization
    + Rate limiting (tùy phiên bản)

2️⃣ Discovery Service
- Thường sử dụng Eureka (hoặc Consul), dùng để:
- Quản lý danh sách các service.
- Cho phép service tự đăng ký (service registry).
- Giúp các service tìm nhau (service discovery).
- Hỗ trợ load balancing và fault tolerance.

3️⃣ Common DTO
- Chứa các Data Transfer Object dùng chung giữa nhiều service.
- Giúp tránh trùng lặp cấu trúc dữ liệu.
- Đảm bảo consistency về model khi truyền dữ liệu.

4️⃣ User Service
- Quản lý tài khoản và thông tin người dùng.
- Các chức năng chính:
- Đăng ký, đăng nhập
- Xác thực email
- JWT Token
- Phân quyền (Role + Permission)
- Quản lý hồ sơ người dùng

5️⃣ Product Service
- Quản lý sản phẩm.
- Chức năng chính:
- CRUD sản phẩm
- Category
- Thuộc tính sản phẩm
- Tìm kiếm

6️⃣ Order Service
- Xử lý đơn hàng.
- Chức năng chính:
- Tạo đơn hàng
- Quản lý trạng thái
- Xử lý giỏ hàng (tuỳ dự án)
- Tính toán tổng tiền

7️⃣ Payment Service
- Xử lý thanh toán.
- Có thể tích hợp:
- zalo pay
- Xác nhận thanh toán và cập nhật Order Service.

8️⃣ Notification Service
- Gửi thông báo qua:
    + Email
- Ví dụ:
    + Xác nhận đơn hàng
    + Xác thực tài khoản
    + Thông báo hệ thống

9️⃣ File Service
- Lưu trữ và quản lý file.
- Hỗ trợ:
- Upload ảnh sản phẩm
- Upload avatar người dùng
- Có thể tích hợp S3 / Cloud Storage

🐳 Docker Compose
- docker-compose.yaml
- Dùng cho môi trường development.
- Hỗ trợ:
- Hot reload
- Logging đơn giản
- Container volume để dev nhanh
- docker-compose.prod.yaml
- Dùng cho production.
- Cấu hình tối ưu:
- Không hot reload
- Tối ưu RAM/CPU
- Thêm log driver, restart policy
- Ánh xạ cổng tối thiểu

🔗 Luồng hoạt động tổng quát
Client gửi request → API Gateway
Gateway định tuyến request đến service tương ứng
Service giao tiếp qua Discovery Service
Mỗi service xử lý nghiệp vụ của riêng mình
Một số service gọi sang service khác (inter-service communication)
Response trả về client qua Gateway

-------------------------------------------

Mô tả từng service
1️⃣ API Gateway
- Đóng vai trò là "cửa ngõ" cho toàn hệ thống.
- Tất cả request từ client đều đi qua gateway trước khi điều hướng đến từng service phù hợp.
- Áp dụng các cơ chế:
    + Routing
    + Load balancing
    + Authentication / Authorization
    + Rate limiting (tùy phiên bản)

2️⃣ Discovery Service
- Thường sử dụng Eureka (hoặc Consul), dùng để:
- Quản lý danh sách các service.
- Cho phép service tự đăng ký (service registry).
- Giúp các service tìm nhau (service discovery).
- Hỗ trợ load balancing và fault tolerance.

3️⃣ Common DTO
- Chứa các Data Transfer Object dùng chung giữa nhiều service.
- Giúp tránh trùng lặp cấu trúc dữ liệu.
- Đảm bảo consistency về model khi truyền dữ liệu.

4️⃣ User Service
- Quản lý tài khoản và thông tin người dùng.
- Các chức năng chính:
- Đăng ký, đăng nhập
- Xác thực email
- JWT Token
- Phân quyền (Role + Permission)
- Quản lý hồ sơ người dùng

5️⃣ Product Service
- Quản lý sản phẩm.
- Chức năng chính:
- CRUD sản phẩm
- Category
- Thuộc tính sản phẩm
- Tìm kiếm

6️⃣ Order Service
- Xử lý đơn hàng.
- Chức năng chính:
- Tạo đơn hàng
- Quản lý trạng thái
- Xử lý giỏ hàng (tuỳ dự án)
- Tính toán tổng tiền

7️⃣ Payment Service
- Xử lý thanh toán.
- Có thể tích hợp:
- zalo pay
- Xác nhận thanh toán và cập nhật Order Service.

8️⃣ Notification Service
- Gửi thông báo qua:
    + Email
- Ví dụ:
    + Xác nhận đơn hàng
    + Xác thực tài khoản
    + Thông báo hệ thống

9️⃣ File Service
- Lưu trữ và quản lý file.
- Hỗ trợ:
- Upload ảnh sản phẩm
- Upload avatar người dùng
- Có thể tích hợp S3 / Cloud Storage

🐳 Docker Compose
- docker-compose.yaml
- Dùng cho môi trường development.
- Hỗ trợ:
- Hot reload
- Logging đơn giản
- Container volume để dev nhanh
- docker-compose.prod.yaml
- Dùng cho production.
- Cấu hình tối ưu:
- Không hot reload
- Tối ưu RAM/CPU
- Thêm log driver, restart policy
- Ánh xạ cổng tối thiểu

🔗 Luồng hoạt động tổng quát
Client gửi request → API Gateway
Gateway định tuyến request đến service tương ứng
Service giao tiếp qua Discovery Service
Mỗi service xử lý nghiệp vụ của riêng mình
Một số service gọi sang service khác (inter-service communication)
Response trả về client qua Gateway