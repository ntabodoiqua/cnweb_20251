# 📊 Báo Cáo Phân Tích Giao Diện Hệ Thống HUSTBuy

> **Ngày tạo:** 2024  
> **Dự án:** HUSTBuy - E-Commerce Platform  
> **Phiên bản:** 1.0.0

---

## 📑 Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Công Nghệ Sử Dụng](#2-công-nghệ-sử-dụng)
3. [Cấu Trúc Dự Án](#3-cấu-trúc-dự-án)
4. [Phân Tích Các Module](#4-phân-tích-các-module)
5. [Routing & Navigation](#5-routing--navigation)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Styling & UI Components](#7-styling--ui-components)
8. [API Integration](#8-api-integration)
9. [Đánh Giá & Đề Xuất](#9-đánh-giá--đề-xuất)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Giới Thiệu
**HUSTBuy** là một nền tảng thương mại điện tử (E-Commerce) được phát triển với kiến trúc microservices. Frontend được xây dựng bằng React với mục tiêu cung cấp trải nghiệm người dùng mượt mà và hiệu quả.

### 1.2 Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │  Guest  │  │  User   │  │ Seller  │  │      Admin      │ │
│  │  Pages  │  │  Pages  │  │  Pages  │  │      Pages      │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Components & Context                      │
│        (Header, Footer, Auth, ErrorBoundary, etc.)          │
├─────────────────────────────────────────────────────────────┤
│                       API Layer (Axios)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   User     │  │  Product   │  │      Discovery         │ │
│  │  Service   │  │  Service   │  │       Service          │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Order    │  │  Payment   │  │     Notification       │ │
│  │  Service   │  │  Service   │  │       Service          │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Công Nghệ Sử Dụng

### 2.1 Frontend Stack

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **React** | 18.3.1 | UI Library chính |
| **React DOM** | 18.3.1 | DOM rendering |
| **React Router DOM** | 6.24.0 | Client-side routing |
| **Ant Design** | 5.19.0 | UI Component Library |
| **Ant Design Icons** | 5.3.7 | Icon library |
| **Axios** | 1.7.2 | HTTP Client |
| **@react-oauth/google** | 0.12.2 | Google OAuth |

### 2.2 Development Tools

| Tool | Phiên bản | Mô tả |
|------|-----------|-------|
| **Vite** | 5.3.1 | Build tool & dev server |
| **ESLint** | 8.57.0 | Code linting |
| **@vitejs/plugin-react-swc** | 3.5.0 | Fast React refresh |

### 2.3 Scripts

```json
{
  "dev": "vite",           // Development server
  "start": "vite",         // Alias for dev
  "build": "vite build",   // Production build
  "lint": "eslint ...",    // Code linting
  "preview": "vite preview" // Preview production build
}
```

---

## 3. Cấu Trúc Dự Án

### 3.1 Cây Thư Mục Frontend

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── App.jsx                 # Main App component
│   ├── main.jsx                # Entry point
│   ├── assets/                 # Images, fonts, etc.
│   │   └── teams/              # Team member photos
│   ├── components/             # Reusable components
│   │   ├── context/            # React Context providers
│   │   │   └── auth.context.jsx
│   │   ├── layout/             # Layout components
│   │   │   ├── header.jsx
│   │   │   ├── header.css
│   │   │   ├── footer.jsx
│   │   │   └── footer.css
│   │   ├── ErrorBoundary.jsx   # Error handling
│   │   ├── ErrorFallback.jsx   # Error UI
│   │   ├── LoadingSpinner.jsx  # Loading states
│   │   ├── ProtectedRoute.jsx  # Route guard
│   │   └── PublicRoute.jsx     # Public route guard
│   ├── constants/              # App constants
│   │   ├── roles.js            # User roles
│   │   └── routes.js           # Route paths
│   ├── hooks/                  # Custom hooks
│   │   └── useScrollToTop.js
│   ├── pages/                  # Page components
│   │   ├── admin/              # Admin pages
│   │   ├── seller/             # Seller pages
│   │   ├── user/               # User pages
│   │   ├── guest/              # Guest/Public pages
│   │   │   ├── About_Us/       # About pages
│   │   │   └── Customer support/ # Support pages
│   │   ├── home.jsx
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   ├── profile.jsx
│   │   ├── verify-email.jsx
│   │   ├── forgot-password.jsx
│   │   ├── reset-password.jsx
│   │   └── not-found.jsx
│   ├── routes/                 # Routing configuration
│   │   ├── index.jsx           # Main router
│   │   ├── exports.js
│   │   ├── guards/             # Route guards
│   │   └── hooks/
│   ├── styles/                 # Global & shared styles
│   │   ├── global.css
│   │   ├── antd-custom.css
│   │   └── [page-specific].css
│   └── util/                   # Utility functions
│       ├── api.js              # API calls
│       ├── axios.customize.js  # Axios instance
│       └── jwt.js              # JWT utilities
├── index.html
├── package.json
├── vite.config.js
└── nginx.conf                  # Production server config
```

---

## 4. Phân Tích Các Module

### 4.1 Public Pages (Guest)

#### 4.1.1 Trang Chủ (HomePage)
- **File:** `pages/home.jsx`
- **Chức năng:** Hiển thị trang chủ với demo dropdown sản phẩm
- **Components:** Result, Button, Dropdown từ Ant Design

#### 4.1.2 Xác Thực (Authentication)

| Trang | File | Chức năng |
|-------|------|-----------|
| Đăng nhập | `login.jsx` | Form đăng nhập với username/password + Google OAuth |
| Đăng ký | `register.jsx` | Form đăng ký tài khoản mới |
| Xác thực email | `verify-email.jsx` | Nhập mã OTP xác thực |
| Quên mật khẩu | `forgot-password.jsx` | Gửi yêu cầu reset password |
| Đặt lại mật khẩu | `reset-password.jsx` | Form nhập mật khẩu mới |

#### 4.1.3 Trang Thông Tin (About Us)

| Trang | File | Nội dung |
|-------|------|----------|
| Về chúng tôi | `about-us.jsx` | Giới thiệu công ty |
| Tuyển dụng | `careers.jsx` | Thông tin tuyển dụng |
| Điều khoản | `terms.jsx` | Điều khoản sử dụng |
| Bảo mật | `privacy.jsx` | Chính sách bảo mật |
| Bán hàng | `sellers.jsx` | Hướng dẫn bán hàng |
| Liên hệ | `contact.jsx` | Thông tin liên hệ |

#### 4.1.4 Hỗ Trợ Khách Hàng

| Trang | File | Nội dung |
|-------|------|----------|
| Trung tâm trợ giúp | `HelpPage.jsx` | FAQ và hướng dẫn |
| Tra cứu đơn hàng | `OrdersPage.jsx` | Kiểm tra trạng thái đơn |
| Thanh toán | `PaymentPage.jsx` | Hướng dẫn thanh toán |
| Đổi trả | `ReturnsPage.jsx` | Chính sách đổi trả |
| Giao hàng | `ShippingPage.jsx` | Chính sách vận chuyển |
| Bảo hành | `WarrantyPage.jsx` | Chính sách bảo hành |

### 4.2 Protected Pages

#### 4.2.1 User Pages
- **Thư mục:** `pages/user/`
- **Yêu cầu quyền:** `ROLE_USER` hoặc `ROLE_ADMIN`
- **Các trang:**
  - Profile Page (`profile.jsx`)
  - User Page (`user.jsx`)

#### 4.2.2 Admin Pages
- **Thư mục:** `pages/admin/`
- **Yêu cầu quyền:** `ROLE_ADMIN`
- **Các trang:**
  - Admin Dashboard (`admin-dashboard.jsx`)

#### 4.2.3 Seller Pages
- **Thư mục:** `pages/seller/`
- **Yêu cầu quyền:** `ROLE_SELLER`
- **Trạng thái:** Đang phát triển (chỉ có `readme.md`)

---

## 5. Routing & Navigation

### 5.1 Cấu Trúc Routes

```javascript
// Public Routes
PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ABOUT_US: "/about-us",
  CAREERS: "/careers",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  SELLERS: "/sellers",
  CONTACT: "/contact",
  HELP: "/help",
  ORDERS: "/orders",
  PAYMENT: "/payment",
  RETURNS: "/returns",
  SHIPPING: "/shipping",
  WARRANTY: "/warranty"
}

// Protected Routes
PROTECTED_ROUTES = {
  PROFILE: "/profile",
  USER: "/user",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_PRODUCTS: "/admin/products",
  SELLER_DASHBOARD: "/seller",
  SELLER_PRODUCTS: "/seller/products",
  SELLER_ORDERS: "/seller/orders"
}

// Error Routes
ERROR_ROUTES = {
  NOT_FOUND: "*",
  UNAUTHORIZED: "/unauthorized",
  SERVER_ERROR: "/500"
}
```

### 5.2 Lazy Loading

Tất cả các page components được lazy load để tối ưu performance:

```javascript
const HomePage = lazy(() => import("../pages/home"));
const LoginPage = lazy(() => import("../pages/login"));
// ...
```

### 5.3 Route Guards

#### ProtectedRoute
- Kiểm tra authentication status
- Kiểm tra user role (ADMIN, USER, SELLER)
- Redirect về login nếu chưa đăng nhập

#### PublicRoute
- Dành cho các trang không yêu cầu đăng nhập
- Redirect về home nếu đã đăng nhập (đối với login/register)

---

## 6. Authentication & Authorization

### 6.1 Auth Context

```javascript
// Auth State Structure
{
  isAuthenticated: boolean,
  user: {
    username: string,
    email: string,
    name: string,
    role: string  // ROLE_USER | ROLE_ADMIN | ROLE_SELLER
  }
}
```

### 6.2 Roles & Permissions

| Role | Giá trị | Quyền hạn |
|------|---------|-----------|
| **User** | `ROLE_USER` | Xem, mua hàng, profile |
| **Admin** | `ROLE_ADMIN` | Full access + Admin dashboard |
| **Seller** | `ROLE_SELLER` | Quản lý sản phẩm, đơn hàng |
| **Moderator** | `ROLE_MODERATOR` | Kiểm duyệt nội dung |

### 6.3 JWT Token Flow

```
┌──────────┐     Login Request     ┌──────────┐
│  Client  │ ────────────────────► │  Server  │
│          │                       │          │
│          │ ◄──────────────────── │          │
│          │   JWT Token Response  │          │
└────┬─────┘                       └──────────┘
     │
     │ Store in localStorage
     │
     ▼
┌──────────────────────────────────────────────┐
│  localStorage.setItem("access_token", token) │
└──────────────────────────────────────────────┘
     │
     │ Auto-attach to requests
     │
     ▼
┌──────────────────────────────────────────────┐
│  Authorization: Bearer <token>               │
└──────────────────────────────────────────────┘
```

### 6.4 Google OAuth Integration

- Sử dụng `@react-oauth/google`
- Endpoint: `/api/user/auth/google`
- Flow: Client → Google → Server validation → JWT token

---

## 7. Styling & UI Components

### 7.1 CSS Architecture

| Loại | Thư mục/File | Mô tả |
|------|--------------|-------|
| **Global CSS** | `styles/global.css` | Reset, typography |
| **Ant Design Custom** | `styles/antd-custom.css` | Override Ant Design |
| **Component CSS** | `components/**/*.css` | Component-specific |
| **Page CSS** | `pages/**/*.css` | Page-specific |
| **CSS Modules** | `*.module.css` | Scoped styles |

### 7.2 Design System

#### Typography
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
```

#### Color Palette (Ant Design)
| Màu | Hex | Sử dụng |
|-----|-----|---------|
| Primary | `#1890ff` | Buttons, links |
| Success | `#52c41a` | Success states |
| Warning | `#faad14` | Warning states |
| Error | `#f5222d` | Error states |

### 7.3 UI Components (Ant Design)

#### Sử dụng phổ biến

| Component | Trang sử dụng |
|-----------|--------------|
| `Form`, `Input`, `Button` | Login, Register |
| `Table`, `Tag` | Admin Dashboard |
| `Card`, `Statistic` | Dashboard |
| `Dropdown`, `Menu` | Header navigation |
| `notification` | Thông báo toàn ứng dụng |
| `Result` | Success/Error pages |
| `Drawer` | Mobile menu |

### 7.4 Layout Components

#### Header
- **File:** `components/layout/header.jsx`
- **Chức năng:**
  - Logo và brand
  - Navigation menu
  - Search bar
  - User dropdown (đăng nhập/đăng ký/profile)
  - Category dropdown
  - Responsive mobile menu (Drawer)

#### Footer
- **File:** `components/layout/footer.jsx`
- **Chức năng:**
  - Company info
  - Customer support links
  - About us links
  - Social media links
  - Contact information
  - Payment methods
  - Copyright

---

## 8. API Integration

### 8.1 Axios Configuration

```javascript
// axios.customize.js
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
});

// Request Interceptor - Auto attach token
instance.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
  return config;
});

// Response Interceptor - Unwrap data
instance.interceptors.response.use(response => {
  if (response?.data) return response.data;
  return response;
});
```

### 8.2 API Endpoints

#### Authentication
| API | Method | Endpoint |
|-----|--------|----------|
| Login | POST | `/api/user/auth/token` |
| Google Login | POST | `/api/user/auth/google` |
| Register | POST | `/api/user/users` |
| Verify Email | POST | `/api/user/users/verify-email` |
| Resend OTP | POST | `/api/user/users/resend-otp` |
| Forgot Password | POST | `/api/user/users/forgot-password` |
| Reset Password | POST | `/api/user/users/reset-password` |

### 8.3 Response Format

```javascript
// Standard API Response
{
  code: number,       // Status code (1000 = success)
  message: string,    // Status message
  result: any         // Response data
}

// Common Status Codes
1000: Success
1102: Wrong password
1201: User not found
1214: Email not verified
```

---

## 9. Đánh Giá & Đề Xuất

### 9.1 Điểm Mạnh ✅

| Tiêu chí | Đánh giá |
|----------|----------|
| **Cấu trúc dự án** | Tổ chức rõ ràng, phân chia module hợp lý |
| **Lazy Loading** | Tối ưu performance với code splitting |
| **Error Handling** | ErrorBoundary và ErrorFallback hoàn chỉnh |
| **Authentication** | JWT + Google OAuth + Route Guards |
| **UI Library** | Ant Design mạnh mẽ, consistent |
| **Responsive** | Mobile menu với Drawer |
| **Code Quality** | ESLint configuration đầy đủ |
| **API Layer** | Axios interceptors clean |

### 9.2 Điểm Cần Cải Thiện 🔧

| Vấn đề | Mức độ | Đề xuất |
|--------|--------|---------|
| **Seller Pages** | Cao | Hoàn thiện module seller |
| **CSS Consistency** | Trung bình | Chuẩn hóa với CSS Modules |
| **State Management** | Trung bình | Xem xét Redux/Zustand cho global state |
| **Testing** | Cao | Thêm unit tests và integration tests |
| **i18n** | Thấp | Hỗ trợ đa ngôn ngữ |
| **Accessibility** | Trung bình | Cải thiện a11y (aria labels) |
| **SEO** | Trung bình | Thêm meta tags, SSR (Next.js) |

### 9.3 Đề Xuất Phát Triển

#### Ngắn hạn (1-2 tuần)
1. Hoàn thiện Admin Dashboard với các trang:
   - Admin Users Page
   - Admin Products Page
   - Admin Orders Page
   - Admin Payments Page
2. Thêm unit tests cho utils và hooks

#### Trung hạn (1-2 tháng)
1. Phát triển Seller Module:
   - Seller Dashboard
   - Product Management
   - Order Management
2. Implement real-time notifications (WebSocket)
3. Shopping cart và checkout flow

#### Dài hạn (3-6 tháng)
1. Migrate to TypeScript
2. Implement SSR với Next.js
3. PWA support
4. Performance monitoring (Sentry, LogRocket)

---

## 📈 Thống Kê

| Metric | Giá trị |
|--------|---------|
| **Tổng số pages** | ~25 |
| **Tổng số components** | ~10 |
| **Dependencies** | 7 |
| **Dev Dependencies** | 8 |
| **User Roles** | 4 |
| **Public Routes** | 18 |
| **Protected Routes** | 9 |

---

## 📝 Ghi Chú

- Report này được tạo dựa trên phân tích source code tại thời điểm hiện tại
- Một số trang/tính năng đang trong quá trình phát triển
- Backend sử dụng kiến trúc microservices (Spring Boot)

---

**© 2024 HUSTBuy Team - CNWEB Project**
