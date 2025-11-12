# Hướng dẫn Test Profile Components với Mock Data

## Cách thay đổi mock data để test các trường hợp khác nhau

### 1. Test Seller Profile

#### Hiển thị form đăng ký (chưa có seller profile):

```jsx
// Trong profile.jsx, dòng 76
return <ProfileSellerInfo sellerData={null} />;
```

#### Hiển thị thông tin seller đã đăng ký:

```jsx
// Trong profile.jsx, dòng 76
return <ProfileSellerInfo sellerData={mockSellerData} />;
```

---

### 2. Test Orders với Empty State

#### Hiển thị empty state (không có đơn hàng):

```jsx
// Trong profile.jsx, dòng 78
return <ProfileOrders orders={[]} />;
```

#### Hiển thị danh sách đơn hàng đầy đủ:

```jsx
// Trong profile.jsx, dòng 78
return <ProfileOrders orders={mockOrders} />;
```

#### Test với 1 trạng thái cụ thể:

```jsx
// Trong mockData.js, filter orders
export const mockOrdersPending = mockOrders.filter(
  (o) => o.status === "pending"
);

// Trong profile.jsx
return <ProfileOrders orders={mockOrdersPending} />;
```

---

### 3. Test Addresses

#### Hiển thị empty state (không có địa chỉ):

```jsx
// Trong profile.jsx, dòng 80
return <ProfileAddresses addresses={[]} />;
```

#### Hiển thị 1 địa chỉ:

```jsx
return <ProfileAddresses addresses={[mockAddresses[0]]} />;
```

#### Hiển thị nhiều địa chỉ:

```jsx
return <ProfileAddresses addresses={mockAddresses} />;
```

---

### 4. Test Transaction History

#### Hiển thị empty state:

```jsx
// Trong profile.jsx, dòng 82
return <ProfileHistory transactions={[]} />;
```

#### Chỉ hiển thị payment transactions:

```jsx
// Trong mockData.js
export const mockPaymentTransactions = mockTransactions.filter(
  (t) => t.type === "payment"
);

// Trong profile.jsx
return <ProfileHistory transactions={mockPaymentTransactions} />;
```

#### Chỉ hiển thị refund transactions:

```jsx
export const mockRefundTransactions = mockTransactions.filter(
  (t) => t.type === "refund"
);
return <ProfileHistory transactions={mockRefundTransactions} />;
```

---

### 5. Customize Mock Data

#### Thêm đơn hàng mới trong mockData.js:

```js
export const mockOrders = [
  ...mockOrders,
  {
    id: "ORD-2025-NEW",
    orderDate: "2025-11-12T10:00:00",
    status: "shipping",
    totalAmount: 20000000,
    products: [
      {
        name: "Dell XPS 15",
        image: "https://via.placeholder.com/80",
        quantity: 1,
        price: 20000000,
      },
    ],
  },
];
```

#### Thêm địa chỉ mới:

```js
export const mockAddresses = [
  ...mockAddresses,
  {
    id: "ADDR-NEW",
    recipientName: "Người Nhận Mới",
    phone: "0999888777",
    province: "Cần Thơ",
    district: "Quận Ninh Kiều",
    ward: "Phường An Hòa",
    detailAddress: "999 Đường Mới",
    isDefault: false,
  },
];
```

---

## Test Cases cần kiểm tra

### ProfileGeneralInfo

- [x] Hiển thị avatar URL
- [x] Hiển thị avatar placeholder với initials
- [x] Edit mode ON/OFF
- [x] Validation khi save (TODO: implement)
- [x] Upload avatar (TODO: implement)

### ProfileSellerInfo

- [x] Empty state với form đăng ký
- [x] Hiển thị thông tin seller
- [x] Stats cards
- [x] Form validation (TODO: implement)

### ProfileOrders

- [x] Empty state
- [x] Stats cards
- [x] Filter by status
- [x] Search functionality
- [x] All 5 statuses displayed correctly
- [x] Multiple products in one order

### ProfileAddresses

- [x] Empty state
- [x] Add new address
- [x] Edit address
- [x] Delete address (non-default only)
- [x] Set default address
- [x] Default badge display

### ProfileHistory

- [x] Empty state
- [x] Stats cards
- [x] Filter by type
- [x] Search functionality
- [x] Payment vs Refund display
- [x] Currency formatting

---

## Quick Test Commands

### Test tất cả empty states:

```jsx
// Trong profile.jsx, thay đổi renderContent():
case "orders":
  return <ProfileOrders orders={[]} />;
case "addresses":
  return <ProfileAddresses addresses={[]} />;
case "history":
  return <ProfileHistory transactions={[]} />;
case "seller":
  return <ProfileSellerInfo sellerData={null} />;
```

### Test với data đầy đủ:

```jsx
case "orders":
  return <ProfileOrders orders={mockOrders} />;
case "addresses":
  return <ProfileAddresses addresses={mockAddresses} />;
case "history":
  return <ProfileHistory transactions={mockTransactions} />;
case "seller":
  return <ProfileSellerInfo sellerData={mockSellerData} />;
```

---

## Browser Testing Checklist

### Desktop (1920x1080)

- [ ] Sidebar sticky hoạt động
- [ ] Layout 2 columns đẹp
- [ ] Hover effects mượt
- [ ] Navigation active state rõ ràng

### Tablet (768px)

- [ ] Sidebar thu nhỏ
- [ ] Content vẫn đọc được
- [ ] Forms vẫn dễ điền

### Mobile (375px)

- [ ] Sidebar chuyển lên trên
- [ ] Content full-width
- [ ] Forms stack vertically
- [ ] Buttons full-width
- [ ] Stats cards stack

---

## Performance Testing

### Kiểm tra với data lớn:

```js
// Tạo 100 đơn hàng
export const largeOrders = Array.from({ length: 100 }, (_, i) => ({
  id: `ORD-${i}`,
  orderDate: new Date().toISOString(),
  status: ["pending", "confirmed", "shipping", "completed", "cancelled"][i % 5],
  totalAmount: Math.random() * 10000000,
  products: [
    {
      name: `Product ${i}`,
      image: "https://via.placeholder.com/80",
      quantity: 1,
      price: Math.random() * 10000000,
    },
  ],
}));
```

Sau đó test:

- Scroll performance
- Search performance
- Filter performance
