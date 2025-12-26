# Order Status Management API Documentation

## Tổng quan

API quản lý trạng thái đơn hàng cho phép seller và buyer thực hiện các thao tác chuyển trạng thái đơn hàng.

## Luồng trạng thái đơn hàng

```
PENDING → PAID → CONFIRMED → SHIPPING → DELIVERED
                    ↓           ↓
                CANCELLED   CANCELLED
```

- **PENDING**: Đơn hàng mới tạo, chờ thanh toán
- **PAID**: Đã thanh toán thành công
- **CONFIRMED**: Seller đã xác nhận đơn hàng
- **SHIPPING**: Đang vận chuyển
- **DELIVERED**: Đã giao hàng thành công
- **CANCELLED**: Đã hủy

## Base URL

```
/api/orders
```

---

## 1. Lấy chi tiết đơn hàng

### Endpoint

```
GET /api/orders/{orderId}
```

### Authorization

- Buyer: Chỉ xem được đơn hàng của mình
- Seller: Xem được đơn hàng có sản phẩm của mình
- Admin: Xem được tất cả đơn hàng

### Path Parameters

| Parameter | Type | Required | Description     |
| --------- | ---- | -------- | --------------- |
| orderId   | UUID | Yes      | ID của đơn hàng |

### Response

```json
{
  "code": 0,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-20240115-001",
    "status": "CONFIRMED",
    "totalAmount": 500000,
    "shippingFee": 30000,
    "discount": 50000,
    "finalAmount": 480000,
    "recipientName": "Nguyen Van A",
    "recipientPhone": "0901234567",
    "recipientAddress": "123 Nguyen Hue, Q1, TP.HCM",
    "paymentMethod": "VNPAY",
    "note": "Giao giờ hành chính",
    "createdAt": "2024-01-15T10:30:00",
    "paidAt": "2024-01-15T10:35:00",
    "confirmedAt": "2024-01-15T11:00:00",
    "shippedAt": null,
    "deliveredAt": null,
    "items": [...]
  }
}
```

### Error Responses

| Code | Message                           |
| ---- | --------------------------------- |
| 2001 | Order not found                   |
| 2006 | Unauthorized to access this order |

---

## 2. Seller xác nhận đơn hàng

### Endpoint

```
PUT /api/orders/{orderId}/confirm
```

### Authorization

- Seller/Admin only
- Seller phải là chủ của sản phẩm trong đơn hàng

### Path Parameters

| Parameter | Type | Required | Description     |
| --------- | ---- | -------- | --------------- |
| orderId   | UUID | Yes      | ID của đơn hàng |

### Điều kiện

- Đơn hàng phải ở trạng thái **PAID**

### Response

```json
{
  "code": 0,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED",
    "confirmedAt": "2024-01-15T11:00:00",
    ...
  }
}
```

### Error Responses

| Code | Message                                        |
| ---- | ---------------------------------------------- |
| 2001 | Order not found                                |
| 2002 | Order cannot be confirmed (not in PAID status) |
| 2006 | Unauthorized - not the seller of products      |

---

## 3. Seller chuyển đơn sang vận chuyển

### Endpoint

```
PUT /api/orders/{orderId}/ship
```

### Authorization

- Seller/Admin only
- Seller phải là chủ của sản phẩm trong đơn hàng

### Path Parameters

| Parameter | Type | Required | Description     |
| --------- | ---- | -------- | --------------- |
| orderId   | UUID | Yes      | ID của đơn hàng |

### Điều kiện

- Đơn hàng phải ở trạng thái **CONFIRMED**

### Response

```json
{
  "code": 0,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SHIPPING",
    "shippedAt": "2024-01-16T08:00:00",
    ...
  }
}
```

### Error Responses

| Code | Message                                           |
| ---- | ------------------------------------------------- |
| 2001 | Order not found                                   |
| 2003 | Order cannot be shipped (not in CONFIRMED status) |
| 2006 | Unauthorized - not the seller of products         |

---

## 4. Buyer xác nhận đã nhận hàng

### Endpoint

```
PUT /api/orders/{orderId}/delivered
```

### Authorization

- Buyer (chủ đơn hàng) hoặc Admin

### Path Parameters

| Parameter | Type | Required | Description     |
| --------- | ---- | -------- | --------------- |
| orderId   | UUID | Yes      | ID của đơn hàng |

### Điều kiện

- Đơn hàng phải ở trạng thái **SHIPPING**
- Chỉ chủ đơn hàng mới được xác nhận

### Response

```json
{
  "code": 0,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "DELIVERED",
    "deliveredAt": "2024-01-18T15:30:00",
    ...
  }
}
```

### Error Responses

| Code | Message                                            |
| ---- | -------------------------------------------------- |
| 2001 | Order not found                                    |
| 2004 | Order cannot be delivered (not in SHIPPING status) |
| 2006 | Unauthorized - not the order owner                 |

---

## 5. Hủy đơn hàng

### Endpoint

```
PUT /api/orders/{orderId}/cancel
```

### Authorization

- Buyer: Hủy đơn hàng của mình (trước khi vận chuyển)
- Seller: Hủy đơn hàng có sản phẩm của mình (trước khi vận chuyển)
- Admin: Hủy bất kỳ đơn hàng nào

### Path Parameters

| Parameter | Type | Required | Description     |
| --------- | ---- | -------- | --------------- |
| orderId   | UUID | Yes      | ID của đơn hàng |

### Request Body

```json
{
  "cancelReason": "Đổi ý không muốn mua nữa"
}
```

| Field        | Type   | Required | Constraints   | Description   |
| ------------ | ------ | -------- | ------------- | ------------- |
| cancelReason | String | Yes      | Max 500 chars | Lý do hủy đơn |

### Điều kiện

- Đơn hàng phải ở trạng thái **PENDING**, **PAID** hoặc **CONFIRMED**
- Không thể hủy đơn đang vận chuyển hoặc đã giao

### Response

```json
{
  "code": 0,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "CANCELLED",
    "cancelReason": "Đổi ý không muốn mua nữa",
    "cancelledAt": "2024-01-15T12:00:00",
    ...
  }
}
```

### Error Responses

| Code | Message                                                |
| ---- | ------------------------------------------------------ |
| 2001 | Order not found                                        |
| 2005 | Order cannot be cancelled (already shipping/delivered) |
| 2006 | Unauthorized to cancel this order                      |
| 2007 | Cancel reason is required                              |

---

## Mã lỗi

| Code | Message (EN)              | Message (VI)                        |
| ---- | ------------------------- | ----------------------------------- |
| 2001 | Order not found           | Không tìm thấy đơn hàng             |
| 2002 | Order cannot be confirmed | Đơn hàng không thể xác nhận         |
| 2003 | Order cannot be shipped   | Đơn hàng không thể vận chuyển       |
| 2004 | Order cannot be delivered | Đơn hàng không thể xác nhận đã giao |
| 2005 | Order cannot be cancelled | Đơn hàng không thể hủy              |
| 2006 | Unauthorized              | Không có quyền thực hiện thao tác   |
| 2007 | Cancel reason required    | Lý do hủy không được để trống       |

---

## Ví dụ luồng đơn hàng

### 1. Đơn hàng thành công

```
1. User đặt hàng → status = PENDING
2. User thanh toán → status = PAID
3. Seller xác nhận → PUT /orders/{id}/confirm → status = CONFIRMED
4. Seller giao vận chuyển → PUT /orders/{id}/ship → status = SHIPPING
5. User nhận hàng → PUT /orders/{id}/delivered → status = DELIVERED
6. User có thể rating sản phẩm
```

### 2. Hủy đơn hàng

```
1. User đặt hàng → status = PENDING/PAID/CONFIRMED
2. User/Seller hủy → PUT /orders/{id}/cancel → status = CANCELLED
```

---

## Lưu ý tích hợp Frontend

1. **Kiểm tra role**:

    - Seller endpoints (`confirm`, `ship`) cần role SELLER
    - Buyer endpoints (`delivered`, `cancel`) kiểm tra ownership

2. **Hiển thị nút theo trạng thái**:

    - PAID: Seller thấy nút "Xác nhận đơn hàng"
    - CONFIRMED: Seller thấy nút "Giao cho vận chuyển"
    - SHIPPING: Buyer thấy nút "Đã nhận hàng"
    - PENDING/PAID/CONFIRMED: Buyer/Seller thấy nút "Hủy đơn"

3. **Rating**: User chỉ có thể rating sau khi đơn hàng ở trạng thái DELIVERED