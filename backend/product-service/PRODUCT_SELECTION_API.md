# Product Selection API Documentation

## Tổng quan

Hệ thống **Product Selection** cho phép Seller tự định nghĩa các nhóm lựa chọn (Selection Groups) và các options cho sản phẩm của họ. Khi người dùng chọn đủ các options từ mỗi group bắt buộc, hệ thống sẽ trả về variant tương ứng.

### Use Case điển hình

Sản phẩm: **Ốp điện thoại cao cấp**

```
┌─────────────────────────────────────────────────────────────┐
│  Selection Group 1: "Mẫu điện thoại" (Bắt buộc chọn)       │
│  ├── iPhone 15 Pro Max                                      │
│  ├── iPhone 15 Pro                                          │
│  └── Samsung Galaxy S24 Ultra                               │
│                                                             │
│  Selection Group 2: "Kiểu vỏ" (Bắt buộc chọn)              │
│  ├── Trong suốt                                              │
│  ├── Carbon đen                                              │
│  └── Holographic                                             │
└─────────────────────────────────────────────────────────────┘

User chọn: iPhone 15 Pro Max + Carbon đen → Variant tương ứng
```

---

## Base URL

```
{{base_url}}/api/products/{productId}/selections
```

## Authentication

Tất cả các API **tạo/sửa/xóa** yêu cầu:

- **Authorization**: `Bearer {token}`
- **Role**: `SELLER` hoặc `ADMIN`
- **Quyền sở hữu**: Seller chỉ có thể thao tác với product thuộc store của mình

Các API **đọc** (GET) không yêu cầu authentication.

---

## API Endpoints

### 1. Selection Groups

#### 1.1. Tạo Selection Group

Tạo nhóm lựa chọn mới cho sản phẩm (có thể kèm options).

```http
POST /api/products/{productId}/selections/groups
```

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {token} | ✅ |
| Content-Type | application/json | ✅ |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID của sản phẩm |

**Request Body:**

```json
{
  "name": "Mẫu điện thoại",
  "description": "Chọn mẫu điện thoại của bạn",
  "displayOrder": 1,
  "isRequired": true,
  "allowMultiple": false,
  "affectsVariant": true,
  "options": [
    {
      "value": "iPhone 15 Pro Max",
      "label": "iPhone 15 Pro Max",
      "description": "Phiên bản mới nhất",
      "displayOrder": 1,
      "colorCode": null
    },
    {
      "value": "iPhone 15 Pro",
      "label": "iPhone 15 Pro",
      "displayOrder": 2
    }
  ]
}
```

**Request Body Fields:**

| Field          | Type    | Required | Default | Description                       |
| -------------- | ------- | -------- | ------- | --------------------------------- |
| name           | string  | ✅       | -       | Tên nhóm lựa chọn (max 100 ký tự) |
| description    | string  | ❌       | null    | Mô tả ngắn (max 255 ký tự)        |
| displayOrder   | integer | ❌       | auto    | Thứ tự hiển thị                   |
| isRequired     | boolean | ❌       | true    | Bắt buộc user phải chọn           |
| allowMultiple  | boolean | ❌       | false   | Cho phép chọn nhiều options       |
| affectsVariant | boolean | ❌       | true    | Ảnh hưởng đến việc chọn variant   |
| options        | array   | ❌       | []      | Danh sách options ban đầu         |

**Option Fields:**

| Field        | Type    | Required | Default | Description                    |
| ------------ | ------- | -------- | ------- | ------------------------------ |
| value        | string  | ✅       | -       | Giá trị option (max 100 ký tự) |
| label        | string  | ❌       | value   | Nhãn hiển thị                  |
| description  | string  | ❌       | null    | Mô tả chi tiết (max 500 ký tự) |
| displayOrder | integer | ❌       | auto    | Thứ tự hiển thị                |
| colorCode    | string  | ❌       | null    | Mã màu HEX (#FF0000)           |

**Response (201 Created):**

```json
{
  "code": 0,
  "result": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Mẫu điện thoại",
    "description": "Chọn mẫu điện thoại của bạn",
    "displayOrder": 1,
    "isRequired": true,
    "allowMultiple": false,
    "affectsVariant": true,
    "isActive": true,
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "options": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "value": "iPhone 15 Pro Max",
        "label": "iPhone 15 Pro Max",
        "displayOrder": 1,
        "isAvailable": true,
        "isActive": true,
        "linkedVariantIds": [],
        "linkedVariantCount": 0
      }
    ],
    "totalOptions": 2,
    "createdAt": "2025-11-28T10:30:00",
    "updatedAt": "2025-11-28T10:30:00"
  }
}
```

**Error Responses:**

| Code | Error                       | Description                        |
| ---- | --------------------------- | ---------------------------------- |
| 1601 | PRODUCT_NOT_FOUND           | Product không tồn tại              |
| 1852 | SELECTION_GROUP_NAME_EXISTS | Tên group đã tồn tại trong product |
| 1101 | UNAUTHORIZED                | Không có quyền truy cập            |

---

#### 1.2. Lấy tất cả Selection Groups

```http
GET /api/products/{productId}/selections/groups
```

**Response (200 OK):**

```json
{
  "code": 0,
  "result": [
    {
      "id": "group-1-uuid",
      "name": "Mẫu điện thoại",
      "displayOrder": 1,
      "isRequired": true,
      "options": [...],
      "totalOptions": 3
    },
    {
      "id": "group-2-uuid",
      "name": "Kiểu vỏ",
      "displayOrder": 2,
      "isRequired": true,
      "options": [...],
      "totalOptions": 4
    }
  ]
}
```

---

#### 1.3. Lấy chi tiết Selection Group

```http
GET /api/products/{productId}/selections/groups/{groupId}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | ID của sản phẩm |
| groupId | string | ID của selection group |

**Response (200 OK):**

```json
{
  "code": 0,
  "result": {
    "id": "group-uuid",
    "name": "Mẫu điện thoại",
    "description": "Chọn mẫu điện thoại của bạn",
    "displayOrder": 1,
    "isRequired": true,
    "allowMultiple": false,
    "affectsVariant": true,
    "isActive": true,
    "productId": "product-uuid",
    "options": [
      {
        "id": "opt-1",
        "value": "iPhone 15 Pro Max",
        "label": "iPhone 15 Pro Max",
        "imageUrl": "https://...",
        "isAvailable": true,
        "linkedVariantIds": ["var-1", "var-3"],
        "linkedVariantCount": 2
      }
    ],
    "totalOptions": 3
  }
}
```

---

#### 1.4. Cập nhật Selection Group

```http
PUT /api/products/{productId}/selections/groups/{groupId}
```

**Request Body:**

```json
{
  "name": "Mẫu điện thoại (Updated)",
  "description": "Mô tả mới",
  "displayOrder": 2,
  "isRequired": false,
  "isActive": true
}
```

> ⚠️ Chỉ gửi các field cần cập nhật. Các field không gửi sẽ giữ nguyên.

**Response (200 OK):** Tương tự response của GET chi tiết.

---

#### 1.5. Xóa Selection Group

```http
DELETE /api/products/{productId}/selections/groups/{groupId}
```

**Response (200 OK):**

```json
{
  "code": 0,
  "message": "Selection group deleted successfully"
}
```

> ⚠️ **Lưu ý**: Xóa group sẽ xóa luôn tất cả options bên trong và hủy liên kết với variants.

---

### 2. Selection Options

#### 2.1. Thêm Option vào Group

```http
POST /api/products/{productId}/selections/groups/{groupId}/options
```

**Request Body:**

```json
{
  "value": "Samsung Galaxy S24 Ultra",
  "label": "Samsung S24 Ultra",
  "description": "Flagship Samsung 2024",
  "displayOrder": 4,
  "colorCode": null
}
```

**Response (201 Created):**

```json
{
  "code": 0,
  "result": {
    "id": "new-option-uuid",
    "value": "Samsung Galaxy S24 Ultra",
    "label": "Samsung S24 Ultra",
    "description": "Flagship Samsung 2024",
    "displayOrder": 4,
    "imageName": null,
    "imageUrl": null,
    "colorCode": null,
    "isAvailable": true,
    "isActive": true,
    "linkedVariantIds": [],
    "linkedVariantCount": 0
  }
}
```

---

#### 2.2. Lấy tất cả Options của Group

```http
GET /api/products/{productId}/selections/groups/{groupId}/options
```

**Response (200 OK):**

```json
{
  "code": 0,
  "result": [
    {
      "id": "opt-1",
      "value": "iPhone 15 Pro Max",
      "displayOrder": 1,
      "isAvailable": true,
      "linkedVariantCount": 2
    },
    {
      "id": "opt-2",
      "value": "iPhone 15 Pro",
      "displayOrder": 2,
      "isAvailable": true,
      "linkedVariantCount": 2
    }
  ]
}
```

---

#### 2.3. Cập nhật Option

```http
PUT /api/products/{productId}/selections/groups/{groupId}/options/{optionId}
```

**Request Body:**

```json
{
  "value": "iPhone 15 Pro Max (256GB)",
  "label": "iPhone 15 Pro Max",
  "colorCode": "#1a1a1a",
  "isAvailable": true,
  "isActive": true
}
```

---

#### 2.4. Upload hình ảnh cho Option

```http
POST /api/products/{productId}/selections/groups/{groupId}/options/{optionId}/image
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| file | File | Hình ảnh (JPEG, PNG, GIF, WebP) |

**Response (200 OK):**

```json
{
  "code": 0,
  "result": {
    "id": "option-uuid",
    "imageName": "option-image-123.jpg",
    "imageUrl": "https://storage.example.com/option-image-123.jpg",
    ...
  }
}
```

---

#### 2.5. Xóa hình ảnh Option

```http
DELETE /api/products/{productId}/selections/groups/{groupId}/options/{optionId}/image
```

---

#### 2.6. Xóa Option

```http
DELETE /api/products/{productId}/selections/groups/{groupId}/options/{optionId}
```

---

### 3. Option-Variant Linking

#### 3.1. Liên kết Option với Variants

Liên kết một option với một hoặc nhiều variants. Khi user chọn option này, các variants được liên kết sẽ là candidates.

```http
POST /api/products/{productId}/selections/groups/{groupId}/options/{optionId}/link-variants
```

**Request Body:**

```json
{
  "variantIds": ["variant-uuid-1", "variant-uuid-2", "variant-uuid-3"]
}
```

**Response (200 OK):**

```json
{
  "code": 0,
  "result": {
    "id": "option-uuid",
    "value": "iPhone 15 Pro Max",
    "linkedVariantIds": ["variant-uuid-1", "variant-uuid-2", "variant-uuid-3"],
    "linkedVariantCount": 3
  }
}
```

**Error Responses:**

| Code | Error             | Description                                                   |
| ---- | ----------------- | ------------------------------------------------------------- |
| 1618 | VARIANT_NOT_FOUND | Một hoặc nhiều variant không tồn tại hoặc không thuộc product |

---

#### 3.2. Hủy liên kết Option với Variants

```http
POST /api/products/{productId}/selections/groups/{groupId}/options/{optionId}/unlink-variants
```

**Request Body:**

```json
{
  "variantIds": ["variant-uuid-3"]
}
```

---

### 4. User-facing APIs (cho Frontend)

#### 4.1. Lấy Selection Config

API chính cho frontend để render UI chọn variant. Response được tối ưu hóa để frontend có thể:

- Render danh sách groups và options
- Quick lookup variant bằng selectionMatrix
- Biết option nào còn available

```http
GET /api/products/{productId}/selections/config
```

**Response (200 OK):**

```json
{
  "code": 0,
  "result": {
    "productId": "prod-123",
    "productName": "Ốp điện thoại cao cấp",
    "selectionGroups": [
      {
        "groupId": "grp-1",
        "groupName": "Mẫu điện thoại",
        "description": "Chọn mẫu điện thoại của bạn",
        "displayOrder": 1,
        "required": true,
        "allowMultiple": false,
        "options": [
          {
            "optionId": "opt-1",
            "value": "iPhone 15 Pro Max",
            "label": "iPhone 15 Pro Max",
            "imageUrl": "https://...",
            "colorCode": null,
            "available": true
          },
          {
            "optionId": "opt-2",
            "value": "iPhone 15 Pro",
            "label": "iPhone 15 Pro",
            "imageUrl": null,
            "available": true
          },
          {
            "optionId": "opt-3",
            "value": "iPhone 14 Pro",
            "label": "iPhone 14 Pro",
            "available": false
          }
        ]
      },
      {
        "groupId": "grp-2",
        "groupName": "Kiểu vỏ",
        "displayOrder": 2,
        "required": true,
        "options": [
          {
            "optionId": "opt-4",
            "value": "Trong suốt",
            "available": true
          },
          {
            "optionId": "opt-5",
            "value": "Carbon đen",
            "colorCode": "#1a1a1a",
            "available": true
          },
          {
            "optionId": "opt-6",
            "value": "Holographic",
            "available": true
          }
        ]
      }
    ],
    "selectionMatrix": {
      "opt-1,opt-4": "variant-1-uuid",
      "opt-1,opt-5": "variant-2-uuid",
      "opt-1,opt-6": "variant-3-uuid",
      "opt-2,opt-4": "variant-4-uuid",
      "opt-2,opt-5": "variant-5-uuid",
      "opt-2,opt-6": "variant-6-uuid"
    },
    "outOfStockCombinations": [
      {
        "combinationKey": "opt-2,opt-6",
        "optionIds": ["opt-2", "opt-6"],
        "variantId": "variant-6-uuid",
        "reservedStock": 5
      }
    ],
    "basePrice": 199000,
    "totalVariants": 6
  }
}
```

**Response Fields:**

| Field                  | Type   | Description                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| selectionMatrix        | object | Map từ option combination → variant ID               |
| outOfStockCombinations | array  | Danh sách các tổ hợp options đã hết hàng (stock = 0) |

**OutOfStockInfo Fields:**

| Field          | Type   | Description                                      |
| -------------- | ------ | ------------------------------------------------ |
| combinationKey | string | Key của tổ hợp options ("optionId1,optionId2")   |
| optionIds      | array  | Danh sách option IDs trong tổ hợp                |
| variantId      | string | Variant ID tương ứng                             |
| reservedStock  | int    | Số lượng đã đặt trước (reserved) - có thể khác 0 |

**Frontend Usage:**

```javascript
// 1. Quick lookup variant từ matrix (không cần gọi API)
const selectedOptions = ["opt-1", "opt-5"]; // iPhone 15 Pro Max + Carbon đen
const matrixKey = selectedOptions.sort().join(",");
const variantId = response.selectionMatrix[matrixKey]; // "variant-2-uuid"

// 2. Check xem tổ hợp có hết hàng không
const outOfStockKeys = new Set(
  response.outOfStockCombinations.map((item) => item.combinationKey)
);
const isOutOfStock = outOfStockKeys.has(matrixKey);

// 3. Làm mờ/disable options khi user đang chọn
function isOptionDisabled(currentSelection, optionToCheck) {
  // Tạo tổ hợp thử nghiệm
  const testCombination = [...currentSelection, optionToCheck].sort().join(",");
  return outOfStockKeys.has(testCombination);
}

// 4. Lấy giá từ variant response (sau khi chọn đủ options)
const variantPrice = variantResponse.price;
// Giá được lấy trực tiếp từ variant, không cần tính từ priceAdjustment

// 5. Check required groups
const canAddToCart =
  selectionGroups
    .filter((g) => g.required)
    .every((g) =>
      selectedOptions.some((opt) => g.options.find((o) => o.optionId === opt))
    ) && !isOutOfStock;
```

---

#### 4.2. Tìm Variant theo Options đã chọn

Khi user đã chọn đủ options, gọi API này để lấy thông tin chi tiết variant.

```http
POST /api/products/{productId}/selections/find-variant
```

**Request Body:**

```json
{
  "optionIds": ["opt-1", "opt-5"]
}
```

**Response (200 OK):**

```json
{
  "code": 0,
  "result": {
    "id": "variant-2-uuid",
    "sku": "OPL-IP15PM-CARBON",
    "variantName": "Ốp Carbon - iPhone 15 Pro Max",
    "price": 249000,
    "originalPrice": 299000,
    "soldQuantity": 150,
    "imageName": "variant-carbon-ip15.jpg",
    "imageUrl": "https://storage.example.com/variant-carbon-ip15.jpg",
    "isActive": true,
    "createdAt": "2025-11-01T10:00:00",
    "updatedAt": "2025-11-28T10:30:00",
    "attributeValues": []
  }
}
```

**Error Responses:**

| Code | Error                         | Description                                        |
| ---- | ----------------------------- | -------------------------------------------------- |
| 1618 | VARIANT_NOT_FOUND             | Không tìm thấy variant với combination options này |
| 1601 | PRODUCT_NOT_FOUND             | Product không tồn tại                              |
| 1856 | SELECTION_OPTION_IDS_REQUIRED | Danh sách optionIds không được rỗng                |

---

#### 4.3. Lấy Available Options (Dynamic Filtering)

Khi user đã chọn một số options, API này trả về config với availability được cập nhật. Options không có variant tương thích sẽ được đánh dấu `available: false`.

```http
GET /api/products/{productId}/selections/available-options?selectedOptionIds=opt-1&selectedOptionIds=opt-5
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| selectedOptionIds | string[] | Danh sách option IDs đã chọn |

**Response (200 OK):**

Tương tự response của `/config`, nhưng field `available` của các options được cập nhật dựa trên selections hiện tại.

**Use Case:**

- User chọn "iPhone 15 Pro Max" → Một số kiểu vỏ có thể không available
- Frontend dùng để disable các options không thể chọn

---

## Error Codes

| Code | Constant                              | HTTP Status | Message (VI)                                    |
| ---- | ------------------------------------- | ----------- | ----------------------------------------------- |
| 1850 | SELECTION_GROUP_NOT_FOUND             | 404         | Không tìm thấy nhóm lựa chọn                    |
| 1851 | SELECTION_GROUP_NAME_REQUIRED         | 400         | Tên nhóm lựa chọn không được để trống           |
| 1852 | SELECTION_GROUP_NAME_EXISTS           | 409         | Tên nhóm lựa chọn đã tồn tại trong sản phẩm này |
| 1853 | SELECTION_OPTION_NOT_FOUND            | 404         | Không tìm thấy lựa chọn                         |
| 1854 | SELECTION_OPTION_VALUE_REQUIRED       | 400         | Giá trị lựa chọn không được để trống            |
| 1855 | SELECTION_OPTION_VALUE_EXISTS         | 409         | Giá trị lựa chọn đã tồn tại trong nhóm này      |
| 1856 | SELECTION_OPTION_IDS_REQUIRED         | 400         | Danh sách ID lựa chọn không được để trống       |
| 1857 | VARIANT_ALREADY_LINKED_TO_OPTION      | 409         | Biến thể đã được liên kết với lựa chọn này      |
| 1858 | VARIANT_NOT_LINKED_TO_OPTION          | 400         | Biến thể chưa được liên kết với lựa chọn này    |
| 1859 | SELECTION_GROUP_NOT_BELONG_TO_PRODUCT | 400         | Nhóm lựa chọn không thuộc về sản phẩm này       |

---

## Workflow Example

### Seller Setup Flow

```
1. Tạo Product với các Variants
   POST /api/products
   → productId, variantIds

2. Tạo Selection Group "Mẫu điện thoại"
   POST /api/products/{productId}/selections/groups
   → groupId1, optionIds

3. Tạo Selection Group "Kiểu vỏ"
   POST /api/products/{productId}/selections/groups
   → groupId2, optionIds

4. Liên kết Options với Variants
   POST .../options/{optionId}/link-variants
   (Lặp lại cho mỗi option)

5. Test bằng API /config
   GET /api/products/{productId}/selections/config
```

### User Purchase Flow

```
1. Vào trang sản phẩm
   GET /api/products/{productId}/selections/config
   → Render UI chọn options

2. User chọn từng option
   (Frontend cập nhật UI, có thể gọi /available-options)

3. Khi chọn đủ → Hiển thị variant
   Option A: Lookup từ selectionMatrix (nhanh)
   Option B: POST /find-variant (chi tiết hơn)

4. Add to Cart
   POST /api/cart/add
   Body: { variantId, quantity }
```

---

## Caching

Các API sau được cache để tối ưu performance:

| API         | Cache Key                             | TTL           |
| ----------- | ------------------------------------- | ------------- |
| GET /config | `productSelectionConfig::{productId}` | Until evicted |

Cache sẽ tự động bị xóa khi:

- Tạo/sửa/xóa Selection Group
- Tạo/sửa/xóa Selection Option
- Liên kết/hủy liên kết Option với Variant

---

## Best Practices

### Cho Seller

1. **Đặt tên rõ ràng**: Tên group và option nên dễ hiểu với người dùng
2. **Sử dụng displayOrder**: Đảm bảo thứ tự hiển thị hợp lý
3. **Liên kết đầy đủ**: Mỗi option nên được liên kết với ít nhất 1 variant
4. **Thiết lập giá variant**: Giá của mỗi variant được lấy trực tiếp từ variant, không cần điều chỉnh theo option

### Cho Frontend Developer

1. **Cache selectionMatrix**: Không cần gọi /find-variant mỗi lần user chọn
2. **Validate required groups**: Kiểm tra user đã chọn đủ options trước khi Add to Cart
3. **Handle available=false**: Disable hoặc ẩn options không khả dụng
4. **Lấy giá từ variant**: Giá sản phẩm được lấy trực tiếp từ variant response

---

## Version History

| Version | Date       | Changes         |
| ------- | ---------- | --------------- |
| 1.0.0   | 2025-11-28 | Initial release |
