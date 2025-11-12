# Profile Routing Structure

## 📁 Cấu trúc mới với Nested Routes

```
pages/
├── ProfileLayout.jsx          # Layout component với sidebar và <Outlet>
└── profile/
    ├── ProfileGeneralPage.jsx     # /profile (index route)
    ├── ProfileSellerPage.jsx      # /profile/seller
    ├── ProfileOrdersPage.jsx      # /profile/orders
    ├── ProfileAddressesPage.jsx   # /profile/addresses
    └── ProfileHistoryPage.jsx     # /profile/history
```

## 🛣️ Routes Configuration

### Route Paths (constants/routes.js)

```javascript
PROTECTED_ROUTES = {
  PROFILE: "/profile", // Base route
  PROFILE_GENERAL: "/profile/general", // Not used (index route)
  PROFILE_SELLER: "/profile/seller",
  PROFILE_ORDERS: "/profile/orders",
  PROFILE_ADDRESSES: "/profile/addresses",
  PROFILE_HISTORY: "/profile/history",
};
```

### Nested Routes Structure (routes/index.jsx)

```javascript
{
  path: PROTECTED_ROUTES.PROFILE,
  element: <ProfileLayout />,              // Parent layout
  children: [
    {
      index: true,                         // Default: /profile
      element: <ProfileGeneralPage />
    },
    {
      path: PROTECTED_ROUTES.PROFILE_SELLER,
      element: <ProfileSellerPage />
    },
    // ... other routes
  ]
}
```

## 🔄 Navigation Flow

### 1. User clicks sidebar menu item

```jsx
<Link to={PROTECTED_ROUTES.PROFILE_ORDERS}>Đơn hàng</Link>
```

### 2. React Router navigates to `/profile/orders`

### 3. ProfileLayout renders with updated URL

### 4. `<Outlet>` in ProfileLayout renders ProfileOrdersPage

## 📝 Key Components

### ProfileLayout.jsx

- **Purpose**: Layout wrapper với sidebar navigation
- **Features**:
  - Sidebar với menu items
  - Active state dựa trên `location.pathname`
  - `<Outlet>` để render nested routes
  - Dynamic header title dựa trên route hiện tại

### Profile Page Components

- **ProfileGeneralPage**: Hiển thị `<ProfileGeneralInfo>` component
- **ProfileSellerPage**: Hiển thị `<ProfileSellerInfo>` component
- **ProfileOrdersPage**: Hiển thị `<ProfileOrders>` component
- **ProfileAddressesPage**: Hiển thị `<ProfileAddresses>` component
- **ProfileHistoryPage**: Hiển thị `<ProfileHistory>` component

## ✅ Advantages of This Approach

1. **SEO Friendly**: Mỗi trang có URL riêng
2. **Bookmarkable**: Users có thể bookmark từng trang
3. **Browser History**: Back/Forward buttons hoạt động đúng
4. **Deep Linking**: Có thể share link trực tiếp đến trang con
5. **Code Splitting**: Lazy loading từng page component
6. **Consistent with System**: Tuân thủ routing pattern của hệ thống

## 🎯 URL Examples

- `/profile` → Profile General (Thông tin chung)
- `/profile/seller` → Profile Seller (Hồ sơ người bán)
- `/profile/orders` → Profile Orders (Đơn hàng)
- `/profile/addresses` → Profile Addresses (Sổ địa chỉ)
- `/profile/history` → Profile History (Lịch sử giao dịch)

## 🔐 Protected Routes

Tất cả profile routes đều được bảo vệ bởi `<ProtectedRoute>`:

```javascript
<ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN]}>
  <ProfileLayout />
</ProtectedRoute>
```

- Chỉ authenticated users mới truy cập được
- Support cả USER và ADMIN roles

## 🚀 How to Add New Profile Sub-page

### 1. Create component trong `components/profile/`

```jsx
// components/profile/ProfileNewFeature.jsx
export const ProfileNewFeature = ({ data }) => {
  return <div>New Feature</div>;
};
```

### 2. Export trong `components/profile/index.js`

```javascript
export { default as ProfileNewFeature } from "./ProfileNewFeature";
```

### 3. Create page component

```jsx
// pages/profile/ProfileNewFeaturePage.jsx
import { ProfileNewFeature } from "../../components/profile";

const ProfileNewFeaturePage = () => {
  return <ProfileNewFeature data={mockData} />;
};

export default ProfileNewFeaturePage;
```

### 4. Add route constant

```javascript
// constants/routes.js
PROTECTED_ROUTES = {
  // ...
  PROFILE_NEW_FEATURE: "/profile/new-feature",
};
```

### 5. Add to router config

```javascript
// routes/index.jsx
const ProfileNewFeaturePage = lazy(() => import("../pages/profile/ProfileNewFeaturePage"));

// In children array:
{
  path: PROTECTED_ROUTES.PROFILE_NEW_FEATURE,
  element: (
    <SuspenseWrapper>
      <ProfileNewFeaturePage />
    </SuspenseWrapper>
  ),
}
```

### 6. Add menu item to ProfileLayout

```jsx
// pages/ProfileLayout.jsx
const menuItems = [
  // ...
  {
    key: "new-feature",
    icon: <NewFeatureIcon />,
    label: "New Feature",
    path: PROTECTED_ROUTES.PROFILE_NEW_FEATURE,
  },
];
```

## 🎨 Styling

CSS được share giữa tất cả components:

- `pages/profile.css` - Main styles cho ProfileLayout và các components

## 📦 Data Flow

```
Route → Page Component → Profile Component → Mock Data
                ↓
        Outlet renders here
```

Example:

```
/profile/orders → ProfileOrdersPage → ProfileOrders → mockOrders
```

## 🔧 Troubleshooting

### Issue: 404 when refresh page

- **Cause**: Server không config để serve SPA
- **Solution**: Config server để redirect tất cả routes về index.html

### Issue: Active state không đúng

- **Cause**: So sánh path không chính xác
- **Solution**: Use exact match `location.pathname === item.path`

### Issue: Component không re-render

- **Cause**: Missing dependency trong useEffect
- **Solution**: Add location to dependency array
