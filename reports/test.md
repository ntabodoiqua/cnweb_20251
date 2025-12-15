# Test Case Documentation - HUSTBuy Platform

## I. Authentication & Authorization Testing

### 1.1 Login Page (trang /login)

#### TC-LOGIN-001: Đăng nhập thành công với thông tin hợp lệ
- **Precondition**: Tài khoản đã tồn tại trong hệ thống, email đã được xác minh
- **Steps**:
  1. Truy cập trang `/login`
  2. Nhập tên đăng nhập hợp lệ
  3. Nhập mật khẩu đúng
  4. Click nút "Đăng nhập"
- **Expected Result**: 
  - Đăng nhập thành công
  - Được chuyển hướng đến `/profile`
  - Notification "Đăng nhập thành công!" xuất hiện
  - Token lưu vào localStorage

#### TC-LOGIN-002: Đăng nhập thất bại - sai mật khẩu
- **Steps**:
  1. Nhập tên đăng nhập hợp lệ
  2. Nhập mật khẩu sai
  3. Click "Đăng nhập"
- **Expected Result**: 
  - Hiển thị lỗi "Tên đăng nhập hoặc mật khẩu không chính xác"
  - Không được chuyển hướng

#### TC-LOGIN-003: Đăng nhập thất bại - tài khoản không tồn tại
- **Steps**:
  1. Nhập tên đăng nhập không tồn tại
  2. Nhập mật khẩu
  3. Click "Đăng nhập"
- **Expected Result**: 
  - Hiển thị lỗi "Không tìm thấy người dùng"

#### TC-LOGIN-004: Email chưa được xác thực
- **Precondition**: Tài khoản tồn tại nhưng email chưa xác minh
- **Expected Result**:
  - Hiển thị cảnh báo "Email chưa được xác thực"
  - Tự động gửi OTP
  - Chuyển hướng đến `/verify-email`

#### TC-LOGIN-005: Form validation - trường bắt buộc
- **Steps**:
  1. Để trống tên đăng nhập, click "Đăng nhập"
  2. Để trống mật khẩu, click "Đăng nhập"
- **Expected Result**: 
  - Hiển thị thông báo "Vui lòng nhập tên đăng nhập!"
  - Hiển thị thông báo "Vui lòng nhập mật khẩu!"

#### TC-LOGIN-006: Đăng nhập bằng Google
- **Steps**:
  1. Click nút "Đăng nhập bằng Google"
  2. Chọn tài khoản Google
- **Expected Result**:
  - Được đăng nhập
  - Tài khoản được tạo tự động nếu lần đầu

#### TC-LOGIN-007: Click "Quên mật khẩu?"
- **Expected Result**: Chuyển hướng đến `/forgot-password`

#### TC-LOGIN-008: Click "Chưa có tài khoản? Đăng ký ngay"
- **Expected Result**: Chuyển hướng đến `/register`

### 1.2 Register Page (trang /register)

#### TC-REGISTER-001: Đăng ký thành công
- **Steps**:
  1. Truy cập `/register`
  2. Nhập tên đăng nhập hợp lệ (3+ ký tự, chỉ chứa chữ, số, gạch dưới)
  3. Nhập họ và tên
  4. Nhập email hợp lệ
  5. Nhập số điện thoại 10 chữ số
  6. Chọn ngày sinh (≥ 16 tuổi)
  7. Nhập mật khẩu (≥8 ký tự, chứa: chữ hoa, chữ thường, số, ký tự đặc biệt)
  8. Xác nhận mật khẩu
  9. Đồng ý điều khoản
  10. Click "Đăng ký"
- **Expected Result**:
  - Đăng ký thành công
  - Notification "Đăng ký thành công!"
  - Chuyển hướng đến `/verify-email`
  - Email xác minh được gửi

#### TC-REGISTER-002: Mật khẩu yếu
- **Steps**: Nhập mật khẩu không đủ điều kiện
- **Expected Result**: Hiển thị thông báo lỗi chi tiết

#### TC-REGISTER-003: Tên đăng nhập trùng lặp
- **Steps**: Nhập tên đăng nhập đã tồn tại
- **Expected Result**: Hiển thị lỗi "Tên đăng nhập đã tồn tại"

#### TC-REGISTER-004: Email trùng lặp
- **Expected Result**: Hiển thị lỗi "Email đã được sử dụng"

#### TC-REGISTER-005: Số điện thoại không hợp lệ
- **Steps**: Nhập số điện thoại không phải 10 chữ số
- **Expected Result**: Hiển thị lỗi "Số điện thoại phải có 10 chữ số"

#### TC-REGISTER-006: Tuổi không đủ
- **Steps**: Chọn ngày sinh cho người < 16 tuổi
- **Expected Result**: Hiển thị lỗi "Bạn phải từ 16 tuổi trở lên"

#### TC-REGISTER-007: Không đồng ý điều khoản
- **Steps**: Để trống checkbox điều khoản, click "Đăng ký"
- **Expected Result**: Hiển thị lỗi bắt buộc phải đồng ý

---

## II. Product Listing & Search Testing

### 2.1 Homepage (trang /)

#### TC-HOME-001: Tải danh sách sản phẩm
- **Expected Result**:
  - Sản phẩm hiển thị đúng format
  - Hình ảnh tải được
  - Giá cả hiển thị chính xác
  - Badge giảm giá sâu nhất hiển thị ở góc trên bên phải

#### TC-HOME-002: Hiển thị mức giảm giá sâu nhất
- **Expected Result**:
  - Nếu sản phẩm có nhiều variant với discount khác nhau → hiển thị discount cao nhất
  - Badge "-%"

#### TC-HOME-003: Click vào sản phẩm
- **Steps**: Click vào ProductCard
- **Expected Result**: Chuyển hướng đến `/product/{productId}`

#### TC-HOME-004: Scroll tải thêm sản phẩm
- **Expected Result**: Tự động tải sản phẩm tiếp theo (pagination)

#### TC-HOME-005: Sản phẩm ngừng kinh doanh
- **Expected Result**: Hiển thị badge "Ngừng kinh doanh"

### 2.2 Search Page (trang /search)

#### TC-SEARCH-001: Tìm kiếm sản phẩm
- **Steps**:
  1. Nhập keyword vào search bar
  2. Press Enter hoặc click search
- **Expected Result**: Hiển thị kết quả tìm kiếm đúng

#### TC-SEARCH-002: Tìm kiếm không có kết quả
- **Steps**: Tìm kiếm với keyword không tồn tại
- **Expected Result**: Hiển thị "Không tìm thấy sản phẩm"

#### TC-SEARCH-003: Filter theo danh mục
- **Expected Result**: Kết quả được lọc theo danh mục chọn

#### TC-SEARCH-004: Sort sản phẩm
- **Steps**: Chọn sort "Giá tăng dần", "Giá giảm dần", "Mới nhất"
- **Expected Result**: Danh sách sắp xếp đúng

#### TC-SEARCH-005: Pagination
- **Expected Result**: Có thể chuyển trang hoặc load more

---

## III. Cart Testing

### 3.1 Shopping Cart (trang /cart)

#### TC-CART-001: Thêm sản phẩm vào giỏ
- **Steps**:
  1. Trên trang sản phẩm, chọn variant (nếu có)
  2. Chọn số lượng
  3. Click "Thêm vào giỏ hàng"
- **Expected Result**:
  - Sản phẩm thêm vào giỏ
  - Notification thành công
  - Số lượng giỏ hàng cập nhật

#### TC-CART-002: Xem chi tiết giỏ hàng
- **Expected Result**:
  - Hiển thị tất cả sản phẩm
  - Tên sản phẩm có thể click chuyển đến trang sản phẩm
  - Hiển thị hình ảnh, giá, số lượng

#### TC-CART-003: Click vào tên sản phẩm trong giỏ
- **Expected Result**: Chuyển hướng đến `/product/{productId}`

#### TC-CART-004: Click vào hình ảnh sản phẩm trong giỏ
- **Expected Result**: Chuyển hướng đến `/product/{productId}`

#### TC-CART-005: Cập nhật số lượng
- **Steps**:
  1. Click nút + để tăng số lượng
  2. Click nút - để giảm số lượng
- **Expected Result**:
  - Số lượng cập nhật
  - Tổng tiền recalculate
  - API update cart

#### TC-CART-006: Xóa sản phẩm khỏi giỏ
- **Steps**: Click nút delete
- **Expected Result**:
  - Sản phẩm bị xóa
  - Notification xác nhận
  - Tổng tiền cập nhật

#### TC-CART-007: Chọn/bỏ chọn sản phẩm
- **Expected Result**: Checkbox thay đổi trạng thái

#### TC-CART-008: Tính toán tổng tiền
- **Expected Result**: Tổng tiền = sum(price × quantity) của items chọn

#### TC-CART-009: Giỏ hàng trống
- **Expected Result**: Hiển thị thông báo "Giỏ hàng trống"

#### TC-CART-010: Hết hàng badge
- **Expected Result**: Nếu sản phẩm hết → hiển thị "Hết hàng"

#### TC-CART-011: Áp dụng voucher sàn
- **Steps**:
  1. Nhập code voucher
  2. Click "Áp dụng"
- **Expected Result**:
  - Kiểm tra điều kiện (minimum order, expiry)
  - Discount được tính
  - Tổng tiền cập nhật

#### TC-CART-012: Áp dụng voucher shop
- **Expected Result**: Voucher áp dụng cho từng shop riêng

---

## IV. Product Detail Testing

### 4.1 Product Detail Page (trang /product/{id})

#### TC-PRODUCT-001: Tải trang sản phẩm
- **Expected Result**:
  - Hình ảnh sản phẩm tải được
  - Thông tin sản phẩm hiển thị đầy đủ
  - Giá cả hiển thị đúng

#### TC-PRODUCT-002: Chọn variant sản phẩm
- **Steps**: Click chọn variant (size, color, etc.)
- **Expected Result**:
  - Giá cập nhật
  - Hình ảnh cập nhật
  - Stock status cập nhật

#### TC-PRODUCT-003: Chọn số lượng
- **Steps**: Nhập/click tăng giảm số lượng
- **Expected Result**:
  - Không vượt quá stock
  - Minimum 1, maximum = stock available

#### TC-PRODUCT-004: Thêm vào giỏ hàng
- **Steps**: Click "Thêm vào giỏ hàng"
- **Expected Result**:
  - Sản phẩm thêm vào cart
  - Notification thành công

#### TC-PRODUCT-005: Mua ngay
- **Steps**: Click "Mua ngay"
- **Expected Result**: Chuyển đến checkout

#### TC-PRODUCT-006: Đánh giá sản phẩm
- **Steps**: Click vào rating, nhập comment
- **Expected Result**:
  - Xác minh người dùng đã mua sản phẩm
  - Lưu review
  - Cập nhật average rating

#### TC-PRODUCT-007: Xem bình luận khác
- **Expected Result**: Hiển thị danh sách reviews

#### TC-PRODUCT-008: Thông tin shop
- **Expected Result**: Hiển thị thông tin store, logo, tên

#### TC-PRODUCT-009: Sản phẩm liên quan
- **Expected Result**: Hiển thị 4-8 sản phẩm cùng danh mục

#### TC-PRODUCT-010: Hết hàng
- **Expected Result**: Nút "Thêm vào giỏ" bị disable, hiển thị "Hết hàng"

---

## V. Checkout & Payment Testing

### 5.1 Checkout Page

#### TC-CHECKOUT-001: Hiển thị thông tin đơn hàng
- **Expected Result**:
  - Danh sách sản phẩm
  - Chi phí vận chuyển
  - Tổng tiền
  - Discount

#### TC-CHECKOUT-002: Chọn địa chỉ giao hàng
- **Steps**: Chọn từ danh sách địa chỉ hoặc thêm mới
- **Expected Result**: Địa chỉ được lưu

#### TC-CHECKOUT-003: Chọn phương thức vận chuyển
- **Expected Result**: Cập nhật phí ship

#### TC-CHECKOUT-004: Chọn phương thức thanh toán
- **Expected Result**: Hiển thị các option (COD, Zalopay, etc.)

#### TC-CHECKOUT-005: Tính toán phí vận chuyển
- **Expected Result**: Phí = base fee + (weight × rate) hoặc theo quy tắc

#### TC-CHECKOUT-006: Tạo đơn hàng
- **Steps**: Click "Xác nhận đơn hàng"
- **Expected Result**:
  - Đơn hàng được tạo
  - Trạng thái = "Chờ thanh toán"
  - Chuyển đến payment page

#### TC-CHECKOUT-007: Validate form checkout
- **Expected Result**: Kiểm tra required fields

---

## VI. User Profile Testing

### 6.1 Profile Page (trang /profile)

#### TC-PROFILE-001: Xem thông tin cá nhân
- **Expected Result**: Hiển thị tên, email, số điện thoại, avatar

#### TC-PROFILE-002: Chỉnh sửa thông tin
- **Steps**:
  1. Click "Chỉnh sửa"
  2. Cập nhật thông tin
  3. Click "Lưu"
- **Expected Result**: Thông tin được cập nhật

#### TC-PROFILE-003: Xem danh sách đơn hàng
- **Expected Result**: Hiển thị tất cả đơn hàng của user

#### TC-PROFILE-004: Filter đơn hàng theo trạng thái
- **Expected Result**: Lọc đúng theo status

#### TC-PROFILE-005: Xem chi tiết đơn hàng
- **Steps**: Click vào đơn hàng
- **Expected Result**: Hiển thị full details

#### TC-PROFILE-006: Theo dõi đơn hàng
- **Expected Result**: Hiển thị shipping status, tracking number

#### TC-PROFILE-007: Hủy đơn hàng
- **Precondition**: Đơn hàng chưa được xác nhận hoặc chưa giao
- **Expected Result**: Đơn hàng bị hủy, status = "Đã hủy"

#### TC-PROFILE-008: Quản lý địa chỉ
- **Expected Result**:
  - Xem danh sách địa chỉ
  - Thêm/sửa/xóa địa chỉ
  - Đặt địa chỉ mặc định

#### TC-PROFILE-009: Đổi mật khẩu
- **Steps**:
  1. Nhập mật khẩu cũ
  2. Nhập mật khẩu mới
  3. Xác nhận mật khẩu mới
- **Expected Result**: Mật khẩu được thay đổi

#### TC-PROFILE-010: Đăng xuất
- **Steps**: Click "Đăng xuất"
- **Expected Result**:
  - Token xóa khỏi localStorage
  - Chuyển hướng đến trang chủ
  - Không còn đăng nhập

---

## VII. UI/UX Testing

#### TC-UI-001: Responsive design
- **Expected Result**: Trang hiển thị đúng trên mobile, tablet, desktop

#### TC-UI-002: Animation & Transitions
- **Expected Result**: 
  - Banner slide từ trái sang phải (login → register)
  - Hiệu ứng hover smooth
  - Loading animation

#### TC-UI-003: Login/Register button at header
- **Expected Result**: Hiển thị nổi bật, có hiệu ứng hover

#### TC-UI-004: Discount badge positioning
- **Expected Result**: Hiển thị ở góc trên bên phải sản phẩm

#### TC-UI-005: Product card hover effect
- **Expected Result**:
  - Hình ảnh phóng to
  - Viền highlight
  - Nổi bật

---

## VIII. Performance Testing

#### TC-PERF-001: Page load time
- **Expected Result**: < 3 seconds trên 3G

#### TC-PERF-002: Image optimization
- **Expected Result**: Hình ảnh được nén, lazy load

#### TC-PERF-003: API response time
- **Expected Result**: < 1 second cho mỗi API call

---

## IX. Security Testing

#### TC-SEC-001: XSS prevention
- **Steps**: Nhập script vào form
- **Expected Result**: Script không execute, được sanitize

#### TC-SEC-002: SQL Injection
- **Expected Result**: Queries được parameterized

#### TC-SEC-003: CSRF protection
- **Expected Result**: Token CSRF có trong form

#### TC-SEC-004: Password encryption
- **Expected Result**: Mật khẩu hash không lưu plaintext

---

## X. Error Handling Testing

#### TC-ERROR-001: Network error
- **Expected Result**: Hiển thị "Không thể kết nối. Vui lòng thử lại"

#### TC-ERROR-002: Server error (500)
- **Expected Result**: Hiển thị "Lỗi server"

#### TC-ERROR-003: Not found (404)
- **Expected Result**: Hiển thị error page hoặc redirect home

#### TC-ERROR-004: Timeout
- **Expected Result**: Retry hoặc hiển thị thông báo

---

## Test Execution Summary

| Module | Total TC | Passed | Failed | Pass Rate |
|--------|----------|--------|--------|-----------|
| Authentication | 8 | - | - | - |
| Product | 20 | - | - | - |
| Cart | 11 | - | - | - |
| Checkout | 7 | - | - | - |
| Profile | 10 | - | - | - |
| UI/UX | 5 | - | - | - |
| Performance | 3 | - | - | - |
| Security | 4 | - | - | - |
| Error | 4 | - | - | - |
| **TOTAL** | **72** | - | - | - |