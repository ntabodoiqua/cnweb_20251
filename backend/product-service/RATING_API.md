# Product Rating API Documentation

## Tổng quan

Tính năng Rating cho phép khách hàng đánh giá sản phẩm sau khi đã mua và nhận hàng thành công. Mỗi khách hàng chỉ được đánh giá **1 lần** cho mỗi sản phẩm, có thể chỉnh sửa hoặc xóa đánh giá đó.

### Quy tắc nghiệp vụ

- Khách hàng **phải mua sản phẩm** và đơn hàng phải ở trạng thái **DELIVERED** mới được đánh giá
- Mỗi khách hàng chỉ được **1 đánh giá** cho mỗi sản phẩm (unique constraint: userId + productId)
- Đánh giá bao gồm: số sao (1-5), comment (optional), ảnh (optional, tối đa 5 ảnh)
- Khách hàng có thể **chỉnh sửa** hoặc **xóa** đánh giá của mình

---

## Base URL

```
/api/product
```

---

## 1. APIs cho Khách hàng (Yêu cầu Authentication)

### 1.1. Tạo đánh giá mới

**Endpoint:** `POST /ratings`

**Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "string (required)",
  "variantId": "string (optional)",
  "rating": 5,
  "comment": "string (optional)",
  "imageNames": ["image1.jpg", "image2.jpg"]
}
```

| Field      | Type    | Required | Description                                                  |
| ---------- | ------- | -------- | ------------------------------------------------------------ |
| productId  | string  | ✅       | ID sản phẩm cần đánh giá                                     |
| variantId  | string  | ❌       | ID biến thể (nếu muốn đánh giá cụ thể variant)               |
| rating     | integer | ✅       | Số sao từ 1-5                                                |
| comment    | string  | ❌       | Nội dung đánh giá                                            |
| imageNames | array   | ❌       | Danh sách tên file ảnh đã upload qua file-service (tối đa 5) |

**Response Success (201):**

```json
{
  "code": 201,
  "message": "Rating created successfully",
  "result": {
    "id": "rating-uuid",
    "userId": "username",
    "productId": "product-uuid",
    "productName": "iPhone 15 Pro Max",
    "variantId": "variant-uuid",
    "variantName": "256GB - Titan Black",
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời!",
    "isVerifiedPurchase": true,
    "helpfulCount": 0,
    "images": [
      {
        "id": "image-uuid",
        "imageName": "image1.jpg",
        "imageUrl": null,
        "displayOrder": 0
      }
    ],
    "createdAt": "2025-11-28T10:00:00",
    "updatedAt": "2025-11-28T10:00:00"
  }
}
```

**Error Responses:**

| Code | Error                         | Description                                           |
| ---- | ----------------------------- | ----------------------------------------------------- |
| 1601 | PRODUCT_NOT_FOUND             | Sản phẩm không tồn tại                                |
| 2002 | RATING_ALREADY_EXISTS         | Bạn đã đánh giá sản phẩm này rồi                      |
| 2005 | PURCHASE_NOT_VERIFIED         | Bạn phải mua và nhận được sản phẩm trước khi đánh giá |
| 2006 | RATING_IMAGE_LIMIT_EXCEEDED   | Tối đa 5 ảnh cho mỗi đánh giá                         |
| 1618 | VARIANT_NOT_FOUND             | Biến thể không tồn tại                                |
| 1634 | VARIANT_NOT_BELONG_TO_PRODUCT | Biến thể không thuộc về sản phẩm này                  |

---

### 1.2. Cập nhật đánh giá

**Endpoint:** `PUT /ratings/{ratingId}`

**Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| ratingId | string | ID của đánh giá cần cập nhật |

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Đã cập nhật đánh giá",
  "imageNames": ["new-image1.jpg", "new-image2.jpg"]
}
```

| Field      | Type    | Required | Description                                   |
| ---------- | ------- | -------- | --------------------------------------------- |
| rating     | integer | ❌       | Số sao mới (1-5)                              |
| comment    | string  | ❌       | Nội dung đánh giá mới                         |
| imageNames | array   | ❌       | Danh sách ảnh mới (thay thế hoàn toàn ảnh cũ) |

**Response Success (200):**

```json
{
  "code": 200,
  "message": "Rating updated successfully",
  "result": {
    "id": "rating-uuid",
    "userId": "username",
    "productId": "product-uuid",
    "productName": "iPhone 15 Pro Max",
    "rating": 4,
    "comment": "Đã cập nhật đánh giá",
    "isVerifiedPurchase": true,
    "helpfulCount": 0,
    "images": [...],
    "createdAt": "2025-11-28T10:00:00",
    "updatedAt": "2025-11-28T11:00:00"
  }
}
```

**Error Responses:**

| Code | Error                       | Description                               |
| ---- | --------------------------- | ----------------------------------------- |
| 2001 | RATING_NOT_FOUND            | Đánh giá không tồn tại                    |
| 2003 | RATING_UNAUTHORIZED         | Bạn không có quyền chỉnh sửa đánh giá này |
| 2006 | RATING_IMAGE_LIMIT_EXCEEDED | Tối đa 5 ảnh cho mỗi đánh giá             |

---

### 1.3. Xóa đánh giá

**Endpoint:** `DELETE /ratings/{ratingId}`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| ratingId | string | ID của đánh giá cần xóa |

**Response Success (200):**

```json
{
  "code": 200,
  "message": "Rating deleted successfully",
  "result": null
}
```

**Error Responses:**

| Code | Error               | Description                         |
| ---- | ------------------- | ----------------------------------- |
| 2001 | RATING_NOT_FOUND    | Đánh giá không tồn tại              |
| 2003 | RATING_UNAUTHORIZED | Bạn không có quyền xóa đánh giá này |

---

### 1.4. Lấy đánh giá của tôi cho sản phẩm

**Endpoint:** `GET /ratings/my-rating`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | ✅ | ID sản phẩm |

**Response Success (200):**

```json
{
  "code": 200,
  "message": "Rating found",
  "result": {
    "id": "rating-uuid",
    "userId": "username",
    "productId": "product-uuid",
    "productName": "iPhone 15 Pro Max",
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời!",
    "isVerifiedPurchase": true,
    "helpfulCount": 10,
    "images": [...],
    "createdAt": "2025-11-28T10:00:00",
    "updatedAt": "2025-11-28T10:00:00"
  }
}
```

**Nếu chưa có đánh giá:**

```json
{
  "code": 200,
  "message": "No rating found",
  "result": null
}
```

---

### 1.5. Lấy tất cả đánh giá của tôi

**Endpoint:** `GET /ratings/my-ratings`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Trang hiện tại |
| size | integer | 10 | Số lượng mỗi trang |
| sort | string | createdAt,desc | Sắp xếp |

**Response Success (200):**

```json
{
  "code": 200,
  "result": {
    "content": [
      {
        "id": "rating-uuid",
        "userId": "username",
        "productId": "product-uuid",
        "productName": "iPhone 15 Pro Max",
        "rating": 5,
        "comment": "Sản phẩm tuyệt vời!",
        "isVerifiedPurchase": true,
        "helpfulCount": 10,
        "images": [...],
        "createdAt": "2025-11-28T10:00:00",
        "updatedAt": "2025-11-28T10:00:00"
      }
    ],
    "pageable": {...},
    "totalElements": 5,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

### 1.6. Kiểm tra có thể đánh giá không

**Endpoint:** `GET /ratings/can-rate`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | ✅ | ID sản phẩm |

**Response Success (200):**

```json
{
  "code": 200,
  "message": "User can rate this product",
  "result": true
}
```

**Nếu không thể đánh giá:**

```json
{
  "code": 200,
  "message": "User cannot rate this product",
  "result": false
}
```

> **Lưu ý:** `result: false` khi:
>
> - User đã đánh giá sản phẩm này rồi
> - User chưa mua sản phẩm hoặc đơn hàng chưa DELIVERED

---

### 1.7. Đánh dấu đánh giá là hữu ích

**Endpoint:** `POST /ratings/{ratingId}/helpful`

**Headers:**

```
Authorization: Bearer {access_token}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| ratingId | string | ID của đánh giá |

**Response Success (200):**

```json
{
  "code": 200,
  "message": "Rating marked as helpful",
  "result": null
}
```

---

## 2. APIs Public (Không cần Authentication)

### 2.1. Lấy danh sách đánh giá của sản phẩm

**Endpoint:** `GET /public/ratings/product/{productId}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID sản phẩm |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Trang hiện tại |
| size | integer | 10 | Số lượng mỗi trang |
| sort | string | createdAt,desc | Sắp xếp |

**Response Success (200):**

```json
{
  "code": 200,
  "result": {
    "content": [
      {
        "id": "rating-uuid",
        "userId": "username",
        "productId": "product-uuid",
        "productName": "iPhone 15 Pro Max",
        "variantId": "variant-uuid",
        "variantName": "256GB - Titan Black",
        "rating": 5,
        "comment": "Sản phẩm tuyệt vời!",
        "isVerifiedPurchase": true,
        "helpfulCount": 10,
        "images": [
          {
            "id": "image-uuid",
            "imageName": "image1.jpg",
            "imageUrl": null,
            "displayOrder": 0
          }
        ],
        "createdAt": "2025-11-28T10:00:00",
        "updatedAt": "2025-11-28T10:00:00"
      }
    ],
    "pageable": {...},
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0
  }
}
```

---

### 2.2. Lấy đánh giá theo số sao

**Endpoint:** `GET /public/ratings/product/{productId}/stars/{starLevel}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID sản phẩm |
| starLevel | integer | Số sao (1-5) |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Trang hiện tại |
| size | integer | 10 | Số lượng mỗi trang |

**Response:** Tương tự API 2.1

---

### 2.3. Lấy đánh giá có ảnh

**Endpoint:** `GET /public/ratings/product/{productId}/with-images`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID sản phẩm |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Trang hiện tại |
| size | integer | 10 | Số lượng mỗi trang |

**Response:** Tương tự API 2.1 (chỉ trả về ratings có ảnh)

---

### 2.4. Lấy đánh giá đã xác thực mua hàng

**Endpoint:** `GET /public/ratings/product/{productId}/verified`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID sản phẩm |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Trang hiện tại |
| size | integer | 10 | Số lượng mỗi trang |

**Response:** Tương tự API 2.1 (chỉ trả về ratings có `isVerifiedPurchase: true`)

---

### 2.5. Lấy thống kê đánh giá

**Endpoint:** `GET /public/ratings/product/{productId}/summary`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID sản phẩm |

**Response Success (200):**

```json
{
  "code": 200,
  "result": {
    "productId": "product-uuid",
    "averageRating": 4.5,
    "totalRatings": 100,
    "ratingDistribution": {
      "1": 5,
      "2": 10,
      "3": 15,
      "4": 30,
      "5": 40
    }
  }
}
```

| Field              | Type   | Description                  |
| ------------------ | ------ | ---------------------------- |
| productId          | string | ID sản phẩm                  |
| averageRating      | double | Điểm đánh giá trung bình     |
| totalRatings       | long   | Tổng số đánh giá             |
| ratingDistribution | object | Phân bố đánh giá theo số sao |

---

## 3. Upload Ảnh Đánh Giá

Sử dụng **file-service** để upload ảnh trước khi tạo/cập nhật đánh giá.

**Endpoint:** `POST /api/file/upload`

**Headers:**

```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| file | File | File ảnh (JPEG, PNG, etc.) |

**Response Success:**

```json
{
  "code": 200,
  "result": {
    "fileName": "abc123-image.jpg",
    "fileUrl": "https://s3.amazonaws.com/bucket/abc123-image.jpg"
  }
}
```

> **Workflow upload ảnh:**
>
> 1. Upload từng ảnh qua file-service
> 2. Lưu danh sách `fileName` trả về
> 3. Gửi danh sách `imageNames` khi tạo/cập nhật rating

---

## 4. Order Status

Để có thể đánh giá, đơn hàng phải ở trạng thái `DELIVERED`:

```java
public enum OrderStatus {
    PENDING,      // Chờ xác nhận
    PAID,         // Đã thanh toán
    CONFIRMED,    // Đã xác nhận
    SHIPPING,     // Đang giao hàng
    DELIVERED,    // Đã giao hàng ✅ (có thể đánh giá)
    CANCELLED,    // Đã hủy
    RETURNED      // Đã trả hàng
}
```

---

## 5. Data Models

### RatingResponse

```typescript
interface RatingResponse {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  rating: number; // 1-5
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  images: RatingImageResponse[];
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}
```

### RatingImageResponse

```typescript
interface RatingImageResponse {
  id: string;
  imageName: string;
  imageUrl?: string;
  displayOrder: number;
}
```

### RatingSummaryResponse

```typescript
interface RatingSummaryResponse {
  productId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number; // 1-5: count
  };
}
```

### CreateRatingRequest

```typescript
interface CreateRatingRequest {
  productId: string;
  variantId?: string;
  rating: number; // 1-5
  comment?: string;
  imageNames?: string[]; // max 5
}
```

### UpdateRatingRequest

```typescript
interface UpdateRatingRequest {
  rating?: number; // 1-5
  comment?: string;
  imageNames?: string[]; // replaces all existing images
}
```

---

## 6. Error Codes

| Code | Key                         | English                                                  | Vietnamese                                            |
| ---- | --------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| 2001 | RATING_NOT_FOUND            | Rating not found                                         | Không tìm thấy đánh giá                               |
| 2002 | RATING_ALREADY_EXISTS       | You have already rated this product                      | Bạn đã đánh giá sản phẩm này rồi                      |
| 2003 | RATING_UNAUTHORIZED         | You are not authorized to modify this rating             | Bạn không có quyền chỉnh sửa đánh giá này             |
| 2004 | RATING_INVALID              | Invalid rating value                                     | Giá trị đánh giá không hợp lệ                         |
| 2005 | PURCHASE_NOT_VERIFIED       | You must purchase and receive this product before rating | Bạn phải mua và nhận được sản phẩm trước khi đánh giá |
| 2006 | RATING_IMAGE_LIMIT_EXCEEDED | Maximum 5 images allowed per rating                      | Tối đa 5 ảnh cho mỗi đánh giá                         |
| 2007 | ORDER_SERVICE_ERROR         | Error connecting to order service                        | Lỗi kết nối đến dịch vụ đơn hàng                      |

---

## 7. Ví dụ Frontend Integration

### Kiểm tra và hiển thị nút đánh giá

```javascript
// Kiểm tra user có thể đánh giá không
const checkCanRate = async (productId) => {
  try {
    const response = await axios.get(
      `/api/product/ratings/can-rate?productId=${productId}`
    );
    return response.data.result;
  } catch (error) {
    return false;
  }
};

// Lấy đánh giá hiện tại của user (nếu có)
const getMyRating = async (productId) => {
  try {
    const response = await axios.get(
      `/api/product/ratings/my-rating?productId=${productId}`
    );
    return response.data.result; // null nếu chưa đánh giá
  } catch (error) {
    return null;
  }
};
```

### Tạo đánh giá mới

```javascript
const createRating = async (productId, rating, comment, imageNames) => {
  const response = await axios.post("/api/product/ratings", {
    productId,
    rating,
    comment,
    imageNames,
  });
  return response.data.result;
};
```

### Cập nhật đánh giá

```javascript
const updateRating = async (ratingId, rating, comment, imageNames) => {
  const response = await axios.put(`/api/product/ratings/${ratingId}`, {
    rating,
    comment,
    imageNames,
  });
  return response.data.result;
};
```

### Xóa đánh giá

```javascript
const deleteRating = async (ratingId) => {
  await axios.delete(`/api/product/ratings/${ratingId}`);
};
```

### Lấy danh sách đánh giá public

```javascript
const getProductRatings = async (productId, page = 0, size = 10) => {
  const response = await axios.get(
    `/api/product/public/ratings/product/${productId}?page=${page}&size=${size}`
  );
  return response.data.result;
};

const getRatingSummary = async (productId) => {
  const response = await axios.get(
    `/api/product/public/ratings/product/${productId}/summary`
  );
  return response.data.result;
};
```
