# Profile Components

Thư mục này chứa các components cho trang Profile của người dùng.

## Cấu trúc Components

### 1. ProfileGeneralInfo.jsx

Component hiển thị và chỉnh sửa thông tin cá nhân của người dùng.

**Props:**

- `userData` (object, required): Thông tin người dùng
  - `id`, `username`, `firstName`, `lastName`, `email`, `phone`, `dob`, `gender`
  - `avatarUrl`, `avatarName`, `isVerified`, `createdAt`, `roles`

**Features:**

- Hiển thị avatar (hoặc placeholder với initials)
- Upload avatar (placeholder)
- Chỉnh sửa thông tin: họ tên, số điện thoại, ngày sinh, giới tính
- Email không cho phép chỉnh sửa
- Role badge hiển thị vai trò người dùng

---

### 2. ProfileSellerInfo.jsx

Component quản lý thông tin người bán và đăng ký làm người bán.

**Props:**

- `sellerData` (object, optional): Thông tin người bán
  - `shopName`, `shopLogo`, `businessName`, `businessAddress`, `taxCode`
  - `description`, `contactPhone`, `contactEmail`
  - `totalProducts`, `totalOrders`, `rating`, `totalRevenue`

**Features:**

- Hiển thị form đăng ký nếu chưa có seller profile
- Hiển thị thông tin cửa hàng nếu đã đăng ký
- Stats cards: Sản phẩm, Đơn hàng, Đánh giá, Doanh thu
- Form đầy đủ: Thông tin cửa hàng, Doanh nghiệp, Thanh toán

---

### 3. ProfileOrders.jsx

Component hiển thị danh sách đơn hàng và thống kê.

**Props:**

- `orders` (array, required): Danh sách đơn hàng
  - Mỗi order: `id`, `orderDate`, `status`, `totalAmount`, `products[]`

**Features:**

- Stats cards theo trạng thái đơn hàng
- Filter theo trạng thái: all, pending, confirmed, shipping, completed, cancelled
- Search theo mã đơn hàng hoặc tên sản phẩm
- Hiển thị danh sách đơn hàng với chi tiết sản phẩm
- Status badges với màu sắc khác nhau

**Trạng thái đơn hàng:**

- `pending`: Chờ xác nhận (vàng)
- `confirmed`: Đã xác nhận (xanh dương)
- `shipping`: Đang giao (xanh lơ)
- `completed`: Hoàn thành (xanh lá)
- `cancelled`: Đã hủy (đỏ)

---

### 4. ProfileAddresses.jsx

Component quản lý sổ địa chỉ giao hàng.

**Props:**

- `addresses` (array, required): Danh sách địa chỉ
  - Mỗi address: `id`, `recipientName`, `phone`, `province`, `district`, `ward`, `detailAddress`, `isDefault`

**Features:**

- Thêm địa chỉ mới
- Chỉnh sửa địa chỉ
- Xóa địa chỉ (không cho xóa địa chỉ mặc định)
- Đặt địa chỉ mặc định
- Form đầy đủ: Họ tên, SĐT, Tỉnh/TP, Quận/Huyện, Phường/Xã, Địa chỉ cụ thể

---

### 5. ProfileHistory.jsx

Component hiển thị lịch sử giao dịch.

**Props:**

- `transactions` (array, required): Danh sách giao dịch
  - Mỗi transaction: `id`, `date`, `type`, `amount`, `description`

**Features:**

- Stats cards: Tổng chi tiêu, Tổng hoàn tiền, Số giao dịch, Ví của tôi
- Filter theo loại: all, payment, refund
- Search theo mã giao dịch hoặc mô tả
- Hiển thị icon và màu sắc khác nhau cho payment/refund
- Format currency theo VNĐ

**Loại giao dịch:**

- `payment`: Thanh toán (đỏ, arrow down)
- `refund`: Hoàn tiền (xanh lá, arrow up)

---

## Mock Data (mockData.js)

File chứa dữ liệu mẫu cho tất cả components:

- `mockUserData`: Thông tin user mẫu
- `mockSellerData`: Thông tin seller mẫu (có thể pass `null` để hiển thị form đăng ký)
- `mockOrders`: 5 đơn hàng với các trạng thái khác nhau
- `mockAddresses`: 3 địa chỉ mẫu (1 mặc định, 2 phụ)
- `mockTransactions`: 8 giao dịch mẫu (mix payment và refund)

## Cách sử dụng

```jsx
import ProfileGeneralInfo from "../components/profile/ProfileGeneralInfo";
import { mockUserData } from "../components/profile/mockData";

// Trong component
<ProfileGeneralInfo userData={mockUserData} />;
```

## Styling

Tất cả components sử dụng CSS classes từ `profile.css`:

- `.profile-general-info`
- `.profile-avatar-section`
- `.profile-form-*`
- `.profile-stats-grid`
- `.profile-stat-card`
- `.profile-btn`, `.profile-btn-primary`, `.profile-btn-secondary`
- `.profile-empty-state`

## Best Practices Applied

1. **Component Separation**: Mỗi trang có component riêng
2. **PropTypes Validation**: Tất cả props đều được validate
3. **Reusable CSS**: Sử dụng chung CSS classes
4. **Mock Data Centralized**: Mock data tập trung ở 1 file
5. **Consistent Naming**: Đặt tên theo convention `Profile[Feature]`
6. **Responsive Design**: Tất cả components đều responsive
7. **Empty States**: Xử lý trường hợp không có data
8. **User Feedback**: Animations, hover effects, status badges

## API Integration (TODO)

Khi ghép API, cần thay thế mock data bằng API calls:

```jsx
// Example
const [userData, setUserData] = useState(null);

useEffect(() => {
  fetchUserProfile().then((data) => setUserData(data));
}, []);

return userData ? <ProfileGeneralInfo userData={userData} /> : <Loading />;
```
