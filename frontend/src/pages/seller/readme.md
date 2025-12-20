# Seller Dashboard - Kênh Người Bán

Hệ thống quản trị dành cho người bán hàng trên nền tảng HUSTBuy.

## 📁 Cấu trúc

```
frontend/src/pages/seller/
├── SellerDashboardLayout.jsx      # Layout chính với sidebar
├── SellerOverviewPage.jsx         # Trang tổng quan
├── SellerProductsPage.jsx         # Quản lý sản phẩm
├── SellerOrdersPage.jsx           # Quản lý đơn hàng
├── SellerCategoriesPage.jsx       # Quản lý danh mục
├── SellerCustomersPage.jsx        # Quản lý khách hàng
├── SellerStatisticsPage.jsx       # Thống kê & báo cáo
├── SellerSettingsPage.jsx         # Cài đặt cửa hàng
├── seller-dashboard.css           # Styles chung
└── readme.md                      # Tài liệu này
```

## 🎨 Thiết kế

Giao diện seller dashboard được thiết kế tương tự admin dashboard với:

- **Sidebar có thể thu gọn**: Tối ưu không gian làm việc
- **Responsive design**: Hoạt động tốt trên mọi thiết bị
- **Gradient themes**: Màu sắc chủ đạo #ee4d2d (cam đỏ)
- **Smooth animations**: Chuyển động mượt mà, hiện đại

## 📊 Các trang chức năng

### 1. SellerOverviewPage (Tổng quan)

- Thống kê nhanh: Đơn hàng, doanh thu, sản phẩm, lượt xem
- Bảng đơn hàng gần đây
- Danh sách sản phẩm bán chạy
- Thao tác nhanh

### 2. SellerProductsPage (Quản lý sản phẩm)

- Tìm kiếm và lọc sản phẩm
- Hiển thị danh sách với ảnh, giá, tồn kho
- Thêm/Sửa/Xóa sản phẩm
- Trạng thái sản phẩm (Đang bán, Sắp hết, Hết hàng)

### 3. SellerOrdersPage (Quản lý đơn hàng)

- Thẻ tổng quan trạng thái đơn hàng
- Tìm kiếm theo mã đơn, khách hàng, SĐT
- Lọc theo trạng thái
- Bảng đơn hàng với thông tin đầy đủ

### 4. SellerStatisticsPage (Thống kê & Báo cáo)

- Biểu đồ doanh thu theo tháng
- Top sản phẩm bán chạy
- Các chỉ số quan trọng (Tổng doanh thu, đơn hàng, giá trị TB)

### 5. SellerSettingsPage (Cài đặt)

- Thông tin cửa hàng
- Thông tin thanh toán
- Cập nhật thông tin liên hệ

### 6. SellerCategoriesPage & SellerCustomersPage

- Trang placeholder cho tính năng tương lai

## 🛣️ Routes

```javascript
/seller                    // Tổng quan (index)
/seller/products          // Quản lý sản phẩm
/seller/orders            // Quản lý đơn hàng
/seller/categories        // Danh mục sản phẩm
/seller/customers         // Khách hàng
/seller/statistics        // Thống kê & Báo cáo
/seller/settings          // Cài đặt cửa hàng
```

## 🔐 Quyền truy cập

Chỉ người dùng có `ROLE_SELLER` mới có quyền truy cập các trang này.

```jsx
<ProtectedRoute allowedRoles={[ROLES.SELLER]}>
  <SellerDashboardLayout />
</ProtectedRoute>
```

## 🎯 Tính năng chính

### Layout Features

- ✅ Sidebar thu gọn/mở rộng
- ✅ Sticky sidebar khi scroll
- ✅ Navigation với icons rõ ràng
- ✅ Breadcrumb hiển thị vị trí hiện tại
- ✅ Responsive mobile menu

### Data Display

- ✅ Stat cards với animations
- ✅ Bảng dữ liệu responsive
- ✅ Search và filter
- ✅ Status badges có màu sắc
- ✅ Charts và visualizations

### User Experience

- ✅ Loading states
- ✅ Empty states
- ✅ Hover effects
- ✅ Smooth transitions
- ✅ Clear CTAs (Call-to-Actions)

## 💅 Styling

### Colors

- Primary: `#ee4d2d` (Cam đỏ)
- Secondary: `#ff6b35` (Cam nhạt)
- Success: `#52c41a`
- Warning: `#faad14`
- Error: `#ff4d4f`
- Info: `#1890ff`

### Shadows

```css
box-shadow: 0 4px 20px rgba(238, 77, 45, 0.08); /* Subtle */
box-shadow: 0 12px 32px rgba(238, 77, 45, 0.25); /* Hover */
```

### Animations

```css
@keyframes fadeInUp {
  ...;
}
@keyframes slideInFromLeft {
  ...;
}
@keyframes slideInFromTop {
  ...;
}
```

## 🚀 Sử dụng

### Import và sử dụng

```jsx
import SellerDashboardLayout from "../pages/seller/SellerDashboardLayout";
import SellerOverviewPage from "../pages/seller/SellerOverviewPage";
```

### Lazy loading trong routes

```jsx
const SellerDashboardLayout = lazy(() =>
  import("../pages/seller/SellerDashboardLayout")
);
```

## 📱 Responsive Breakpoints

- Desktop: `> 1024px`
- Tablet: `768px - 1024px`
- Mobile: `< 768px`
- Small mobile: `< 480px`

## 🔄 Tương lai

### Tính năng cần phát triển:

- [ ] Tích hợp API backend
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Export dữ liệu
- [ ] Bulk actions
- [ ] Image upload cho sản phẩm
- [ ] Rich text editor cho mô tả
- [ ] Inventory management
- [ ] Promotion campaigns
- [ ] Customer reviews management

## 📝 Notes

- Mock data đang được sử dụng, cần thay thế bằng API calls
- Form validation chưa được implement đầy đủ
- Image upload functionality cần được thêm vào
- Pagination chưa được implement

## 🤝 Related Files

- `frontend/src/constants/routes.js` - Route definitions
- `frontend/src/routes/index.jsx` - Route configuration
- `frontend/src/components/layout/header.jsx` - Header với seller menu
- `frontend/src/pages/admin/` - Admin pages (tham khảo pattern)

---

**Tạo bởi**: Copilot
**Ngày**: 14/11/2024
**Version**: 1.0.0
