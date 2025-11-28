# HUSTBuy Admin Dashboard

## Tổng quan

Admin Dashboard là giao diện quản trị hệ thống HUSTBuy, được thiết kế với sidebar có thể thu nhỏ/mở rộng, tương tự trang profile nhưng với nhiều tính năng nâng cao hơn.

## Cấu trúc thư mục

```
frontend/src/pages/admin/
├── AdminDashboardLayout.jsx    # Layout chính với collapsible sidebar
├── AdminOverviewPage.jsx        # Trang tổng quan (Dashboard chính)
├── AdminUsersPage.jsx           # Quản lý người dùng
├── AdminProductsPage.jsx        # Quản lý sản phẩm
├── AdminOrdersPage.jsx          # Quản lý đơn hàng
├── AdminPaymentsPage.jsx        # Quản lý thanh toán
├── AdminReportsPage.jsx         # Báo cáo & Thống kê
├── AdminSettingsPage.jsx        # Cài đặt hệ thống
└── admin-dashboard.css          # Styles cho admin dashboard
```

## Tính năng chính

### 1. Collapsible Sidebar

- Sidebar có thể thu nhỏ/mở rộng bằng nút toggle
- Tự động responsive trên mobile
- Sticky position khi scroll
- Smooth animations

### 2. Các trang quản lý

#### Overview (Tổng quan)

- Thống kê tổng quan: người dùng, đơn hàng, doanh thu, sản phẩm
- Bảng đơn hàng gần đây
- Quick actions

#### Users Management

- Danh sách người dùng với search & filter
- Phân quyền: ADMIN, SELLER, USER
- Trạng thái: Active/Inactive
- Actions: Edit, Lock/Unlock, Delete

#### Products Management

- Danh sách sản phẩm với filter theo category
- Trạng thái: Đang bán, Hết hàng, Ngừng bán
- Thống kê tồn kho và đã bán
- Actions: View, Edit, Delete

#### Orders Management

- Danh sách đơn hàng với filter theo status
- Trạng thái: Chờ xử lý, Đã xác nhận, Đang giao, Hoàn thành, Đã hủy
- Trạng thái thanh toán: Đã thanh toán, Chưa thanh toán, Đã hoàn tiền
- Actions: View, Confirm, Cancel

#### Payments Management

- Danh sách giao dịch thanh toán
- Phương thức: VNPay, MoMo, COD, Bank Transfer
- Thống kê doanh thu

#### Reports & Statistics

- Báo cáo doanh thu theo thời gian
- Top sản phẩm bán chạy
- Các chỉ số KPI
- Placeholder cho biểu đồ (sẽ tích hợp sau)

#### Settings

- Cài đặt chung: tên website, email, múi giờ, ngôn ngữ
- Tính năng: bảo trì, đăng ký, thông báo
- Toggle switches cho các options

## Routes

```javascript
/admin                  → Overview (Dashboard)
/admin/users           → Users Management
/admin/products        → Products Management
/admin/orders          → Orders Management
/admin/payments        → Payments Management
/admin/reports         → Reports & Statistics
/admin/settings        → System Settings
```

## Mock Data

Tất cả các trang đều sử dụng mock data tạm thời. Khi API sẵn sàng, chỉ cần:

1. Import API functions từ `util/api.js`
2. Thay thế mock data bằng API calls trong `useEffect`
3. Xử lý loading và error states

### Ví dụ:

```javascript
// Before (Mock data)
const [users, setUsers] = useState([...mockData]);

// After (API integration)
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersApi();
      if (response?.code === 1000) {
        setUsers(response.result);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);
```

## Styling

Dashboard sử dụng CSS module tương tự Profile với các điểm khác biệt:

### Màu sắc chủ đạo

- Primary: `#ee4d2d` (HUSTBuy Orange)
- Success: `#52c41a`
- Warning: `#faad14`
- Error: `#ff4d4f`
- Info: `#1890ff`

### Animations

- `fadeIn`: Fade in effect
- `fadeInUp`: Slide up with fade
- `slideInFromLeft`: Slide from left
- `slideInFromTop`: Slide from top
- `scaleIn`: Scale up effect

### Responsive breakpoints

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px
- Small mobile: < 480px

## Quyền truy cập

Chỉ user có role `ADMIN` mới được truy cập dashboard:

```javascript
<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
  <AdminDashboardLayout />
</ProtectedRoute>
```

## Components tái sử dụng

### Stats Card

```jsx
<div className="admin-stat-card">
  <div className="admin-stat-header">
    <span className="admin-stat-title">Title</span>
    <div className="admin-stat-icon">{icon}</div>
  </div>
  <h2 className="admin-stat-value">{value}</h2>
  <div className="admin-stat-label">...</div>
</div>
```

### Table

```jsx
<div className="admin-table-container">
  <table className="admin-table">
    <thead>...</thead>
    <tbody>...</tbody>
  </table>
</div>
```

### Action Buttons

```jsx
<div className="admin-action-buttons">
  <button className="admin-action-btn view">...</button>
  <button className="admin-action-btn edit">...</button>
  <button className="admin-action-btn delete">...</button>
</div>
```

## TODO - Tích hợp API

### Phase 1: Basic CRUD

- [ ] Get users list (GET /api/admin/users)
- [ ] Get products list (GET /api/admin/products)
- [ ] Get orders list (GET /api/admin/orders)
- [ ] Get payments list (GET /api/admin/payments)

### Phase 2: Actions

- [ ] Create/Update/Delete users
- [ ] Create/Update/Delete products
- [ ] Update order status
- [ ] Process payments

### Phase 3: Analytics

- [ ] Get dashboard statistics
- [ ] Get revenue reports
- [ ] Get top products
- [ ] Export reports

### Phase 4: Settings

- [ ] Save system settings
- [ ] Update configurations

## Best Practices

1. **Luôn validate dữ liệu** trước khi gọi API
2. **Xử lý loading states** để UX tốt hơn
3. **Hiển thị error messages** rõ ràng cho user
4. **Confirm actions** nguy hiểm (delete, block user...)
5. **Debounce search inputs** để tránh gọi API quá nhiều
6. **Pagination** cho danh sách dài
7. **Cache data** khi có thể để giảm API calls

## Testing

Để test dashboard:

1. Đăng nhập với tài khoản ADMIN
2. Navigate đến `/admin`
3. Test các tính năng:
   - Thu nhỏ/mở rộng sidebar
   - Navigate giữa các trang
   - Search & filter
   - Responsive trên mobile

## Troubleshooting

### Sidebar không thu nhỏ

- Check state `collapsed` trong `AdminDashboardLayout`
- Verify CSS transitions

### Routes không hoạt động

- Check `PROTECTED_ROUTES` trong `constants/routes.js`
- Verify route configuration trong `routes/index.jsx`

### Styles bị conflict

- Import `admin-dashboard.css` đúng thứ tự
- Check CSS specificity

## Support

Nếu có vấn đề, liên hệ team dev hoặc tạo issue trong repository.
