# ProfileSellerInfo - Update & Re-register Features

## Các tính năng mới được thêm vào

### 1. **Chỉnh sửa hồ sơ (Edit Profile)**

#### Điều kiện

- Chỉ khả dụng khi trạng thái hồ sơ là `CREATED`

#### Chức năng

- Nút "Chỉnh sửa hồ sơ" xuất hiện bên dưới thông tin seller profile
- Khi click, form edit được hiển thị với dữ liệu hiện tại
- Người dùng có thể sửa đổi:
  - Tên cửa hàng
  - Mô tả cửa hàng
  - Email liên hệ
  - Số điện thoại
  - Địa chỉ (Tỉnh/Phường/Địa chỉ cụ thể)

#### API

```
PUT /api/user/seller-profiles/{profileId}
```

**Request Body:**

```json
{
  "storeName": "Cửa hàng thời trang Mặt Trời",
  "storeDescription": "Chuyên cung cấp quần áo...",
  "contactEmail": "matranganhshop@gmail.com",
  "contactPhone": "0987654321",
  "shopAddress": "123 Đường Nguyễn Trãi",
  "wardId": 14107,
  "provinceId": 27
}
```

### 2. **Đăng ký lại (Re-register)**

#### Điều kiện

- Chỉ khả dụng khi trạng thái hồ sơ là `REJECTED`

#### Chức năng

- Nút "Đăng ký lại" xuất hiện bên dưới thông tin seller profile
- Khi click, form đăng ký mới được mở (form trống)
- Người dùng tạo hồ sơ mới từ đầu
- Sử dụng API create (POST) để tạo hồ sơ mới

#### Logic

```javascript
if (sellerData.verificationStatus === "REJECTED") {
  // Cho phép tạo hồ sơ mới
  handleRegisterNew();
}
```

## Luồng xử lý

### State Management

```javascript
const [isEditing, setIsEditing] = useState(false);
const [isRegistering, setIsRegistering] = useState(false);
```

### Điều kiện hiển thị

| Trạng thái | Nút hiển thị      | Action                       |
| ---------- | ----------------- | ---------------------------- |
| `CREATED`  | "Chỉnh sửa hồ sơ" | Edit form với dữ liệu có sẵn |
| `PENDING`  | Không có nút      | Chờ admin duyệt              |
| `VERIFIED` | Không có nút      | Hồ sơ đã được xác thực       |
| `REJECTED` | "Đăng ký lại"     | Form đăng ký mới (trống)     |

### Form Submit Logic

```javascript
const handleSubmit = async () => {
  if (isEditing && sellerData) {
    // Update existing profile
    await updateSellerProfileApi(sellerData.id, formData);
  } else {
    // Create new profile
    await createSellerProfileApi(formData);
  }
};
```

## Component Structure

```
ProfileSellerInfo/
├── Loading State
│   └── Spinner + Message
│
├── Has Profile (sellerData exists)
│   ├── Profile View
│   │   ├── Shop Info
│   │   ├── Address
│   │   ├── Rejection Reason (if rejected)
│   │   ├── Timestamps
│   │   └── Action Buttons
│   │       ├── Edit (if CREATED)
│   │       └── Re-register (if REJECTED)
│   │
│   └── Edit Form (isEditing = true)
│       ├── Pre-filled fields
│       ├── Province/Ward selects
│       └── Update button
│
└── No Profile (!sellerData && !isEditing && !isRegistering)
    └── Empty State
        └── "Đăng ký làm người bán" button
```

## API Functions

### 1. Create Seller Profile

```javascript
createSellerProfileApi(profileData);
// POST /api/user/seller-profiles
```

### 2. Get My Seller Profile

```javascript
getMySellerProfileApi();
// GET /api/user/seller-profiles/me
```

### 3. Update Seller Profile ⭐ NEW

```javascript
updateSellerProfileApi(profileId, profileData);
// PUT /api/user/seller-profiles/{profileId}
```

## UX Flow

### Scenario 1: Chỉnh sửa hồ sơ (Status: CREATED)

1. User thấy thông tin hồ sơ + nút "Chỉnh sửa hồ sơ"
2. Click "Chỉnh sửa hồ sơ"
3. Form hiển thị với dữ liệu hiện tại
4. User sửa đổi thông tin
5. Click "Cập nhật"
6. API PUT được gọi
7. Success → Refresh data → Hiển thị profile mới
8. Notification: "Cập nhật thành công"

### Scenario 2: Đăng ký lại (Status: REJECTED)

1. User thấy thông tin hồ sơ bị từ chối + lý do từ chối
2. Nút "Đăng ký lại" xuất hiện
3. Click "Đăng ký lại"
4. Form mới (trống) hiển thị
5. User điền thông tin
6. Click "Đăng ký"
7. API POST được gọi (tạo hồ sơ mới)
8. Success → Refresh data → Hiển thị profile mới
9. Notification: "Đăng ký thành công"

## Validation

Cả Edit và Re-register đều sử dụng cùng validation:

- ✅ Email format
- ✅ Phone number (10 digits)
- ✅ Required fields
- ✅ Province/Ward selection

## Error Handling

```javascript
try {
  if (isEditing) {
    await updateSellerProfileApi(...);
    notification.success("Cập nhật thành công");
  } else {
    await createSellerProfileApi(...);
    notification.success("Đăng ký thành công");
  }
} catch (error) {
  notification.error(
    isEditing ? "Cập nhật thất bại" : "Đăng ký thất bại"
  );
}
```

## UI/UX Improvements

1. **Action Buttons Styling**

   - Center aligned
   - Min width 180px
   - Border top separator
   - Smooth animations

2. **Form Title**

   - Edit: "Chỉnh sửa hồ sơ người bán"
   - Create: "Thông tin cửa hàng"

3. **Button Labels**

   - Edit mode: "Cập nhật" (Update)
   - Create mode: "Đăng ký" (Register)

4. **Icons**
   - Edit: `<EditOutlined />`
   - Re-register: `<SyncOutlined />`
   - Update: `<SaveOutlined />`

## Testing Checklist

- [ ] Edit profile khi status = CREATED
- [ ] Re-register khi status = REJECTED
- [ ] Validate form fields
- [ ] Handle API errors
- [ ] Refresh data sau khi submit
- [ ] Loading state khi submit
- [ ] Cancel button reset form
- [ ] Province/Ward cascading select

---

**Last Updated:** November 13, 2025
**Author:** GitHub Copilot
