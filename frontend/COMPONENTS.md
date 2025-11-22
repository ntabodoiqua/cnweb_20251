# Frontend Components & Pages Documentation

## 📋 Tổng quan

Dự án sử dụng React 18.3.1 + Vite 5.3.1 với Ant Design 5.19.0 để xây dựng giao diện người dùng cho hệ thống thương mại điện tử đa vai trò (Multi-role E-commerce Platform).

---

## 🏗️ Cấu trúc thư mục

```
frontend/src/
├── pages/              # Các trang chính của ứng dụng
│   ├── admin/         # Trang quản trị hệ thống
│   ├── seller/        # Trang quản lý người bán
│   ├── user/          # Trang người dùng
│   ├── guest/         # Trang khách (About Us, Support)
│   └── profile/       # Trang thông tin cá nhân
├── components/        # Components tái sử dụng
│   ├── home/         # Components trang chủ
│   ├── layout/       # Header, Footer
│   ├── profile/      # Components profile
│   └── context/      # Context providers
├── routes/           # Cấu hình routing
├── hooks/            # Custom hooks
├── constants/        # Hằng số, roles, routes
└── util/             # Utilities functions
```

---

## 📄 Pages - Các trang chính

### 🔐 Authentication Pages

#### `login.jsx`
- **Mô tả**: Trang đăng nhập hệ thống
- **Features**: 
  - Form đăng nhập với email/password
  - Đăng nhập Google OAuth
  - Remember me checkbox
  - Link quên mật khẩu
- **Route**: `/login`
- **CSS**: `login.css`

#### `register.jsx`
- **Mô tả**: Trang đăng ký tài khoản mới
- **Features**:
  - Form đăng ký với validation
  - Email verification flow
  - Checkbox đăng ký làm người bán
- **Route**: `/register`
- **CSS**: `register.css`

#### `forgot-password.jsx`
- **Mô tả**: Trang yêu cầu reset mật khẩu
- **Features**: Gửi email reset password
- **Route**: `/forgot-password`
- **CSS**: `forgot-password.css`

#### `reset-password.jsx`
- **Mô tả**: Trang đặt lại mật khẩu mới
- **Features**: Form đặt mật khẩu mới với token
- **Route**: `/reset-password`
- **CSS**: `reset-password.css`

#### `verify-email.jsx`
- **Mô tả**: Trang xác thực email
- **Features**: Xác thực email qua token
- **Route**: `/verify-email`
- **CSS**: `verify-email.css`

---

### 🏠 General Pages

#### `home.jsx`
- **Mô tả**: Trang chủ hệ thống
- **Features**:
  - Hero banner với slideshow
  - Flash sale section
  - Categories section
  - Products showcase
  - Testimonials
  - Trust badges
- **Route**: `/`
- **Components sử dụng**: Tất cả components trong `components/home/`

#### `not-found.jsx`
- **Mô tả**: Trang 404 Not Found
- **Features**: Thông báo lỗi + link về trang chủ
- **Route**: `*` (fallback route)
- **CSS**: `not-found.css`

---

### 👤 Profile Pages

#### `ProfileLayout.jsx`
- **Mô tả**: Layout wrapper cho các trang profile
- **Features**:
  - Sidebar navigation
  - Avatar & user info
  - Nested routing cho sub-pages
- **CSS**: `profile.css`
- **Sub-routes**:
  - `/profile/general` - Thông tin chung
  - `/profile/addresses` - Địa chỉ giao hàng
  - `/profile/orders` - Đơn hàng
  - `/profile/security` - Bảo mật
  - `/profile/seller-info` - Thông tin người bán

---

### 👨‍💼 Admin Pages (Role: ADMIN)

**Layout**: `AdminDashboardLayout.jsx`

#### `AdminOverviewPage.jsx`
- **Mô tả**: Trang tổng quan quản trị
- **Features**:
  - Dashboard với statistics cards
  - Biểu đồ doanh thu
  - Thống kê đơn hàng, người dùng
- **Route**: `/admin/overview`

#### `AdminUsersPage.jsx`
- **Mô tả**: Quản lý người dùng
- **Features**:
  - Bảng danh sách users
  - Tìm kiếm, filter theo role
  - Thống kê users (Total, Active, Banned, New)
  - Block/Unblock user
  - Xem chi tiết user
- **Route**: `/admin/users`

#### `AdminSellerPage.jsx`
- **Mô tả**: Quản lý người bán (Seller Management)
- **Features**:
  - Danh sách đăng ký làm seller
  - Thống kê (Tổng đăng ký, Chờ duyệt, Đã duyệt, Từ chối)
  - Phê duyệt/Từ chối hồ sơ seller
  - Xem chi tiết hồ sơ (business info, documents)
  - Mở cửa hàng cho seller đã duyệt
- **Route**: `/admin/sellers`
- **CSS**: `AdminSellerPage.module.css` (CSS Modules)

#### `AdminProductsPage.jsx`
- **Mô tả**: Quản lý sản phẩm toàn hệ thống
- **Features**:
  - Danh sách tất cả products
  - Tìm kiếm, filter theo category, seller
  - Ẩn/Hiện sản phẩm vi phạm
- **Route**: `/admin/products`

#### `AdminOrdersPage.jsx`
- **Mô tả**: Quản lý đơn hàng toàn hệ thống
- **Features**:
  - Danh sách orders
  - Filter theo status
  - Xem chi tiết order
- **Route**: `/admin/orders`

#### `AdminPaymentsPage.jsx`
- **Mô tả**: Quản lý thanh toán
- **Features**:
  - Lịch sử giao dịch
  - Filter theo payment method, status
  - Export báo cáo
- **Route**: `/admin/payments`

#### `AdminReportsPage.jsx`
- **Mô tả**: Báo cáo thống kê
- **Features**:
  - Biểu đồ doanh thu theo thời gian
  - Báo cáo sản phẩm bán chạy
  - Báo cáo seller performance
- **Route**: `/admin/reports`

#### `AdminSettingsPage.jsx`
- **Mô tả**: Cài đặt hệ thống
- **Features**:
  - Cấu hình chung
  - Quản lý categories
  - Email templates
- **Route**: `/admin/settings`

**Common CSS**: `admin-dashboard.css` (Global admin styles)

---

### 🏪 Seller Pages (Role: SELLER)

**Layout**: `SellerDashboardLayout.jsx`

#### `SellerOverviewPage.jsx`
- **Mô tả**: Tổng quan cửa hàng
- **Features**:
  - Thống kê doanh thu, đơn hàng
  - Biểu đồ xu hướng
  - Sản phẩm bán chạy
- **Route**: `/seller/overview`

#### `SellerProductsPage.jsx`
- **Mô tả**: Quản lý sản phẩm của seller
- **Features**:
  - CRUD sản phẩm
  - Upload ảnh sản phẩm
  - Quản lý kho (inventory)
  - Bulk actions
- **Route**: `/seller/products`

#### `SellerOrdersPage.jsx`
- **Mô tả**: Quản lý đơn hàng
- **Features**:
  - Danh sách orders của shop
  - Cập nhật trạng thái đơn
  - In đơn hàng
- **Route**: `/seller/orders`

#### `SellerCategoriesPage.jsx`
- **Mô tả**: Quản lý danh mục sản phẩm
- **Features**:
  - Thêm/sửa/xóa categories
  - Tree view categories
- **Route**: `/seller/categories`
- **CSS**: `SellerCategoriesPage.css`

#### `SellerCustomersPage.jsx`
- **Mô tả**: Quản lý khách hàng
- **Features**:
  - Danh sách khách hàng
  - Lịch sử mua hàng
  - Ghi chú khách hàng
- **Route**: `/seller/customers`

#### `SellerStatisticsPage.jsx`
- **Mô tả**: Thống kê chi tiết
- **Features**:
  - Báo cáo doanh thu
  - Phân tích sản phẩm
  - Export Excel/PDF
- **Route**: `/seller/statistics`

#### `SellerSettingsPage.jsx`
- **Mô tả**: Cài đặt cửa hàng
- **Features**:
  - Thông tin shop
  - Logo, banner
  - Chính sách đổi trả
- **Route**: `/seller/settings`
- **CSS**: `SellerSettingsPage.css`

**Common CSS**: `seller-dashboard.css`

---

### 🌐 Guest Pages

#### `About_Us/` folder
- **Mô tả**: Các trang giới thiệu về công ty
- **Routes**: `/about-us/*`

#### `Customer support/` folder
- **Mô tả**: Trang hỗ trợ khách hàng
- **Routes**: `/customer-support/*`

---

## 🧩 Components - Components tái sử dụng

### 🏠 Home Components (`components/home/`)

#### `HeroBanner.jsx`
- **Mô tả**: Banner chính trang chủ
- **Features**: Slideshow tự động, navigation dots

#### `FlashSaleSection.jsx`
- **Mô tả**: Section flash sale
- **Features**: 
  - Countdown timer
  - Sản phẩm giảm giá
  - Progress bar sold out

#### `CategoriesSection.jsx`
- **Mô tả**: Hiển thị danh mục sản phẩm
- **Features**: Grid layout categories với icons

#### `ProductsSection.jsx`
- **Mô tả**: Section hiển thị danh sách sản phẩm
- **Features**: Grid products, pagination

#### `ProductCard.jsx`
- **Mô tả**: Card hiển thị thông tin sản phẩm
- **Props**:
  - `product` - Thông tin sản phẩm
  - `onQuickView` - Handler xem nhanh
  - `onAddToCart` - Handler thêm giỏ hàng
- **Features**:
  - Image với lazy loading
  - Discount badge
  - Rating stars
  - Hover effects

#### `QuickViewModal.jsx`
- **Mô tả**: Modal xem nhanh sản phẩm
- **Features**:
  - Image gallery
  - Select variant (size, color)
  - Add to cart button

#### `PromotionBanners.jsx`
- **Mô tả**: Banner khuyến mãi
- **Features**: 2-3 banners ngang

#### `BrandsSection.jsx`
- **Mô tả**: Section thương hiệu
- **Features**: Logo carousel các brands

#### `TestimonialsSection.jsx`
- **Mô tả**: Đánh giá khách hàng
- **Features**: Slider testimonials với avatar

#### `TrustBadges.jsx`
- **Mô tả**: Các badges tin cậy
- **Features**: Icons (Free shipping, Secure payment, etc.)

#### `RecentlyViewed.jsx`
- **Mô tả**: Sản phẩm đã xem gần đây
- **Features**: Lưu localStorage, horizontal scroll

**Export**: `components/home/index.js` - Central export file

---

### 📐 Layout Components (`components/layout/`)

#### `header.jsx`
- **Mô tả**: Header toàn trang
- **Features**:
  - Logo
  - Search bar
  - Cart icon với badge
  - User menu dropdown
  - Navigation menu
- **CSS**: `header.css`

#### `footer.jsx`
- **Mô tả**: Footer toàn trang
- **Features**:
  - Links (About, Contact, Terms)
  - Social media icons
  - Newsletter signup
  - Copyright
- **CSS**: `footer.css`

---

### 👤 Profile Components (`components/profile/`)

#### `ProfileGeneralInfo.jsx`
- **Mô tả**: Form thông tin cá nhân
- **Features**:
  - Edit name, phone, birthday
  - Upload avatar
  - Gender selection

#### `ProfileAddresses.jsx`
- **Mô tả**: Quản lý địa chỉ giao hàng
- **Features**:
  - CRUD addresses
  - Set default address
  - Tích hợp API tỉnh/thành phố

#### `ProfileOrders.jsx`
- **Mô tả**: Lịch sử đơn hàng
- **Features**:
  - List orders với status
  - Filter theo status
  - Xem chi tiết order

#### `ProfileHistory.jsx`
- **Mô tả**: Lịch sử hoạt động
- **Features**: Timeline các activities

#### `ProfileSecurity.jsx`
- **Mô tả**: Bảo mật tài khoản
- **Features**:
  - Đổi mật khẩu
  - Two-factor authentication
  - Login history
- **CSS**: `ProfileSecurity.css`

#### `ProfileSellerInfo.jsx`
- **Mô tả**: Thông tin người bán
- **Features**:
  - Form đăng ký seller
  - Upload business documents
  - Tracking approval status
- **CSS**: `ProfileSellerInfo.css`

**Mock Data**: `mockData.js` - Sample data cho development

**Export**: `components/profile/index.js`

---

### 🛡️ Utility Components

#### `ErrorBoundary.jsx`
- **Mô tả**: Error boundary wrapper
- **Features**:
  - Catch React errors
  - Hiển thị fallback UI
  - Log errors
- **CSS**: `ErrorBoundary.css`

#### `ErrorFallback.jsx`
- **Mô tả**: UI hiển thị khi có lỗi
- **Features**: Error message + reload button
- **CSS**: `ErrorFallback.css`

#### `LoadingSpinner.jsx`
- **Mô tả**: Component loading spinner
- **Props**:
  - `size` - small | medium | large
  - `fullscreen` - boolean
- **CSS**: `LoadingSpinner.css`

#### `ProtectedRoute.jsx`
- **Mô tả**: Route wrapper yêu cầu authentication
- **Features**:
  - Check auth token
  - Redirect to login nếu chưa đăng nhập
  - Role-based access control

#### `PublicRoute.jsx`
- **Mô tả**: Route cho trang public (login, register)
- **Features**: Redirect to home nếu đã đăng nhập

---

## 🔌 Context Providers (`components/context/`)

#### `AuthContext.jsx`
- **Mô tả**: Context quản lý authentication
- **State**:
  - `user` - Thông tin user
  - `token` - JWT token
  - `isAuthenticated` - Boolean
- **Methods**:
  - `login(credentials)`
  - `logout()`
  - `updateUser(data)`

#### `CartContext.jsx`
- **Mô tả**: Context quản lý giỏ hàng
- **State**:
  - `items` - Array sản phẩm
  - `total` - Tổng tiền
- **Methods**:
  - `addToCart(product)`
  - `removeFromCart(id)`
  - `updateQuantity(id, qty)`
  - `clearCart()`

---

## 🎨 Styling Convention

### CSS Modules
- Sử dụng cho components cần scoped styles
- Naming: `ComponentName.module.css`
- Import: `import styles from './Component.module.css'`
- Usage: `className={styles.className}`
- Classes phải là camelCase

### Global CSS
- `admin-dashboard.css` - Global admin styles
- `seller-dashboard.css` - Global seller styles
- Classes có prefix: `admin-`, `seller-`

### Ant Design
- Sử dụng components: Button, Table, Modal, Form, Input, Select, etc.
- Customize theme qua CSS override
- Prefix classes: `.ant-*`

---

## 🔄 Routing Structure

```
/                           → home.jsx
/login                      → login.jsx (PublicRoute)
/register                   → register.jsx (PublicRoute)
/forgot-password            → forgot-password.jsx
/reset-password             → reset-password.jsx
/verify-email               → verify-email.jsx

/profile                    → ProfileLayout.jsx (ProtectedRoute)
  /general                  → ProfileGeneralInfo
  /addresses                → ProfileAddresses
  /orders                   → ProfileOrders
  /security                 → ProfileSecurity
  /seller-info              → ProfileSellerInfo

/admin                      → AdminDashboardLayout (Role: ADMIN)
  /overview                 → AdminOverviewPage
  /users                    → AdminUsersPage
  /sellers                  → AdminSellerPage
  /products                 → AdminProductsPage
  /orders                   → AdminOrdersPage
  /payments                 → AdminPaymentsPage
  /reports                  → AdminReportsPage
  /settings                 → AdminSettingsPage

/seller                     → SellerDashboardLayout (Role: SELLER)
  /overview                 → SellerOverviewPage
  /products                 → SellerProductsPage
  /orders                   → SellerOrdersPage
  /categories               → SellerCategoriesPage
  /customers                → SellerCustomersPage
  /statistics               → SellerStatisticsPage
  /settings                 → SellerSettingsPage

*                           → not-found.jsx
```

---

## 🔐 Role-Based Access

### Roles (constants/roles.js)
- `GUEST` - Khách chưa đăng nhập
- `USER` - Người dùng thông thường
- `SELLER` - Người bán hàng
- `ADMIN` - Quản trị viên

### Route Protection
- **PublicRoute**: Login, Register (redirect nếu đã login)
- **ProtectedRoute**: Profile, User pages (yêu cầu login)
- **AdminRoute**: Admin pages (yêu cầu role ADMIN)
- **SellerRoute**: Seller pages (yêu cầu role SELLER)

---

## 📦 Key Dependencies

- **React**: 18.3.1 - UI library
- **React Router DOM**: 6.24.0 - Routing
- **Ant Design**: 5.19.0 - UI components
- **Axios**: 1.7.2 - HTTP client
- **Day.js**: 1.11.19 - Date manipulation
- **@react-oauth/google**: 0.12.2 - Google OAuth
- **react-helmet-async**: 2.0.5 - SEO meta tags

---

## 🚀 Development Commands

```bash
# Start dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📝 Naming Conventions

### Files
- Components: `PascalCase.jsx`
- Styles: `kebab-case.css` hoặc `PascalCase.module.css`
- Utils: `camelCase.js`

### Components
- Functional components với hooks
- Export default cho main component
- Named exports cho sub-components

### CSS Classes
- Global: `kebab-case` (VD: `admin-btn-primary`)
- CSS Modules: `camelCase` (VD: `modalBtnApprove`)
- BEM methodology cho complex components

---

## 🔍 Best Practices

1. **Component Organization**
   - Một component một file
   - Đặt CSS cùng folder với component
   - Export từ index.js cho dễ import

2. **State Management**
   - useState cho local state
   - Context cho global state (Auth, Cart)
   - Props drilling tối đa 2-3 levels

3. **Performance**
   - Lazy load routes với React.lazy()
   - Memoize expensive computations
   - Optimize images (WebP, lazy loading)

4. **Code Quality**
   - ESLint rules
   - Consistent formatting
   - Comments cho complex logic

---

## 📞 Support

For questions or issues, contact the development team.

**Last Updated**: November 2025
