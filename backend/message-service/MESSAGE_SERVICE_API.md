# Message Service API Documentation

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cơ chế hoạt động](#3-cơ-chế-hoạt-động)
4. [Authentication](#4-authentication)
5. [REST API Endpoints](#5-rest-api-endpoints)
6. [WebSocket API](#6-websocket-api)
7. [Data Models](#7-data-models)
8. [Enums](#8-enums)
9. [Tích hợp với các Service khác](#9-tích-hợp-với-các-service-khác)
10. [Ví dụ sử dụng](#10-ví-dụ-sử-dụng)

---

## 1. Tổng quan

Message Service là microservice xử lý chức năng chat real-time trong hệ thống e-commerce. Service này hỗ trợ:

- **Chat 1-1** giữa User và User hoặc User và Seller
- **Tin nhắn đa dạng**: Text, Image, Product, Order, File, Sticker
- **Real-time messaging** qua WebSocket/STOMP
- **Typing indicator** (thông báo đang gõ)
- **Read receipts** (thông báo đã đọc)
- **Reply to message** (trả lời tin nhắn)

### Tech Stack

- **Backend**: Spring Boot 3.x
- **Database**: MongoDB
- **Real-time**: WebSocket + STOMP protocol
- **Message Broker**: Simple Broker (có thể mở rộng với RabbitMQ)
- **Authentication**: JWT (OAuth2 Resource Server)

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                          │
├─────────────────────────────────────────────────────────────────────┤
│                  REST API          │        WebSocket               │
│               (HTTP/HTTPS)         │     (WS/WSS + STOMP)           │
└─────────────────────────────────────────────────────────────────────┘
                          │                        │
                          ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Gateway                                  │
│                    (Spring Cloud Gateway)                           │
└─────────────────────────────────────────────────────────────────────┘
                          │                        │
                          ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Message Service                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌───────────────────┐    ┌─────────────────┐  │
│  │ChatController│    │ChatWebSocketCtrl   │    │   ChatService   │  │
│  │  (REST API)  │    │   (WebSocket)      │    │    (Logic)      │  │
│  └──────────────┘    └───────────────────┘    └─────────────────┘  │
│          │                    │                        │            │
│          └────────────────────┼────────────────────────┘            │
│                               ▼                                      │
│                    ┌─────────────────────┐                          │
│                    │  SimpMessaging      │                          │
│                    │    Template         │                          │
│                    │ (WebSocket Broker)  │                          │
│                    └─────────────────────┘                          │
├─────────────────────────────────────────────────────────────────────┤
│                          MongoDB                                     │
│              ┌────────────────┬────────────────┐                    │
│              │ conversations  │   messages     │                    │
│              └────────────────┴────────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ User Service │  │Product Service│  │Order Service │
│  (Internal)  │  │  (Internal)   │  │  (Internal)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. Cơ chế hoạt động

### 3.1. Luồng gửi tin nhắn

```
┌────────┐                ┌─────────────────┐                ┌────────────┐
│ Client │                │ Message Service │                │ Recipient  │
└────┬───┘                └────────┬────────┘                └──────┬─────┘
     │                             │                                │
     │  1. CONNECT (JWT Token)     │                                │
     │─────────────────────────────>                                │
     │                             │                                │
     │  2. CONNECTED               │                                │
     │<─────────────────────────────                                │
     │                             │                                │
     │  3. SUBSCRIBE               │                                │
     │  /user/queue/messages       │                                │
     │─────────────────────────────>                                │
     │                             │                                │
     │  4. SEND /app/chat.send     │                                │
     │  {conversationId, text}     │                                │
     │─────────────────────────────>                                │
     │                             │                                │
     │                             │  5. Process & Save to MongoDB  │
     │                             │──────────────────────────────> │
     │                             │                                │
     │  6. MESSAGE                 │  6. MESSAGE                    │
     │  /user/queue/messages       │  /user/queue/messages          │
     │<─────────────────────────────────────────────────────────────>
     │                             │                                │
```

### 3.2. Luồng đánh dấu đã đọc

```
┌────────┐                ┌─────────────────┐                ┌────────┐
│Recipient│                │ Message Service │                │ Sender │
└────┬───┘                └────────┬────────┘                └────┬───┘
     │                             │                              │
     │  1. SEND /app/chat.read     │                              │
     │  {conversationId, msgIds}   │                              │
     │─────────────────────────────>                              │
     │                             │                              │
     │                             │  2. Update readBy, readAt    │
     │                             │  3. Reset unreadCount        │
     │                             │                              │
     │                             │  4. MESSAGE                  │
     │                             │  /user/queue/read-receipts   │
     │                             │──────────────────────────────>
     │                             │                              │
```

### 3.3. Luồng Typing Indicator

```
┌────────┐                ┌─────────────────┐                ┌────────────┐
│ Client │                │ Message Service │                │ Recipient  │
└────┬───┘                └────────┬────────┘                └──────┬─────┘
     │                             │                                │
     │  1. SEND /app/chat.typing   │                                │
     │  {conversationId, true}     │                                │
     │─────────────────────────────>                                │
     │                             │                                │
     │                             │  2. MESSAGE                    │
     │                             │  /user/queue/typing            │
     │                             │──────────────────────────────> │
     │                             │                                │
```

---

## 4. Authentication

### 4.1. REST API Authentication

Sử dụng JWT Bearer Token trong header:

```http
Authorization: Bearer <jwt_token>
```

### 4.2. WebSocket Authentication

Khi kết nối WebSocket, truyền JWT token trong STOMP CONNECT frame:

```javascript
const socket = new SockJS("/ws/chat");
const stompClient = Stomp.over(socket);

stompClient.connect(
  {
    Authorization: "Bearer " + jwtToken,
  },
  onConnected,
  onError
);
```

---

## 5. REST API Endpoints

Base URL: `/api/chat`

### 5.1. Conversation Endpoints

#### Tạo hoặc lấy Conversation

```http
POST /api/chat/conversations
```

**Request Body:**

```json
{
  "recipientId": "string (required)",
  "recipientType": "USER | SELLER (optional)",
  "shopId": "string (optional, required if recipientType is SELLER)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "result": {
    "id": "conv_123",
    "participantIds": ["user1", "user2"],
    "participants": [
      {
        "userId": "user1",
        "displayName": "John Doe",
        "avatarUrl": "https://...",
        "type": "USER",
        "online": true
      },
      {
        "userId": "user2",
        "displayName": "Shop ABC",
        "avatarUrl": "https://...",
        "type": "SELLER",
        "shopId": "shop_123",
        "shopName": "Shop ABC",
        "online": false
      }
    ],
    "lastMessage": null,
    "unreadCount": { "user1": 0, "user2": 0 },
    "status": "ACTIVE",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

#### Lấy danh sách Conversations

```http
GET /api/chat/conversations?page=0&size=20
```

**Response:**

```json
{
  "code": 200,
  "result": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3,
    "first": true,
    "last": false,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Lấy chi tiết Conversation

```http
GET /api/chat/conversations/{conversationId}
```

### 5.2. Message Endpoints

#### Gửi tin nhắn

```http
POST /api/chat/messages
```

**Request Body (Text Message):**

```json
{
  "conversationId": "conv_123",
  "contentType": "TEXT",
  "text": "Xin chào!",
  "replyToMessageId": "msg_456 (optional)"
}
```

**Request Body (Image Message):**

```json
{
  "conversationId": "conv_123",
  "contentType": "IMAGE",
  "image": {
    "fileId": "file_123",
    "url": "https://...",
    "thumbnailUrl": "https://...",
    "fileName": "image.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "width": 800,
    "height": 600,
    "caption": "Ảnh sản phẩm"
  }
}
```

**Request Body (Product Message):**

```json
{
  "conversationId": "conv_123",
  "contentType": "PRODUCT",
  "product": {
    "productId": "prod_123",
    "note": "Sản phẩm này còn hàng không shop?"
  }
}
```

**Request Body (Order Message):**

```json
{
  "conversationId": "conv_123",
  "contentType": "ORDER",
  "order": {
    "orderId": "order_123",
    "note": "Đơn hàng của tôi đang ở đâu?"
  }
}
```

**Response:**

```json
{
  "code": 200,
  "result": {
    "id": "msg_789",
    "conversationId": "conv_123",
    "senderId": "user1",
    "senderName": "John Doe",
    "senderAvatar": "https://...",
    "type": "TEXT",
    "contents": [
      {
        "contentType": "TEXT",
        "text": "Xin chào!"
      }
    ],
    "replyTo": null,
    "status": "SENT",
    "readBy": ["user1"],
    "sentAt": "2025-12-01T10:05:00Z",
    "readAt": null,
    "editedAt": null,
    "deleted": false
  }
}
```

#### Lấy tin nhắn trong Conversation

```http
GET /api/chat/conversations/{conversationId}/messages?page=0&size=50
```

**Response:**

```json
{
  "code": 200,
  "result": {
    "content": [
      {
        "id": "msg_789",
        "conversationId": "conv_123",
        "senderId": "user1",
        "senderName": "John Doe",
        "type": "TEXT",
        "contents": [...],
        "status": "READ",
        "sentAt": "2025-12-01T10:05:00Z"
      }
    ],
    "page": 0,
    "size": 50,
    "totalElements": 100
  }
}
```

#### Đánh dấu tin nhắn đã đọc

```http
POST /api/chat/messages/read
```

**Request Body:**

```json
{
  "conversationId": "conv_123",
  "messageIds": ["msg_1", "msg_2"] // null hoặc [] để đánh dấu tất cả
}
```

#### Xóa tin nhắn

```http
DELETE /api/chat/messages/{messageId}
```

---

## 6. WebSocket API

### 6.1. Kết nối

**Endpoint WebSocket:**

```
ws://localhost:8085/ws/chat          (Pure WebSocket)
http://localhost:8085/ws/chat        (SockJS fallback)
```

**STOMP CONNECT:**

```javascript
stompClient.connect({ Authorization: "Bearer " + token }, onConnected, onError);
```

### 6.2. Subscribe Channels

| Channel                     | Mô tả                 |
| --------------------------- | --------------------- |
| `/user/queue/messages`      | Nhận tin nhắn mới     |
| `/user/queue/typing`        | Nhận typing indicator |
| `/user/queue/read-receipts` | Nhận thông báo đã đọc |

### 6.3. Send Destinations

| Destination        | Mô tả                | Payload                  |
| ------------------ | -------------------- | ------------------------ |
| `/app/chat.send`   | Gửi tin nhắn         | `SendMessageRequest`     |
| `/app/chat.typing` | Gửi typing indicator | `TypingIndicatorRequest` |
| `/app/chat.read`   | Đánh dấu đã đọc      | `MarkAsReadRequest`      |

### 6.4. Ví dụ WebSocket với JavaScript

```javascript
// Kết nối
const socket = new SockJS("http://localhost:8085/ws/chat");
const stompClient = Stomp.over(socket);

stompClient.connect(
  { Authorization: "Bearer " + token },
  function (frame) {
    console.log("Connected: " + frame);

    // Subscribe để nhận tin nhắn
    stompClient.subscribe("/user/queue/messages", function (message) {
      const msg = JSON.parse(message.body);
      console.log("Received message:", msg);
    });

    // Subscribe để nhận typing indicator
    stompClient.subscribe("/user/queue/typing", function (typing) {
      const data = JSON.parse(typing.body);
      console.log("Typing:", data.userId, data.typing);
    });

    // Subscribe để nhận read receipts
    stompClient.subscribe("/user/queue/read-receipts", function (receipt) {
      const data = JSON.parse(receipt.body);
      console.log("Read receipt:", data);
    });
  },
  function (error) {
    console.error("Error:", error);
  }
);

// Gửi tin nhắn
function sendMessage(conversationId, text) {
  stompClient.send(
    "/app/chat.send",
    {},
    JSON.stringify({
      conversationId: conversationId,
      contentType: "TEXT",
      text: text,
    })
  );
}

// Gửi typing indicator
function sendTyping(conversationId, isTyping) {
  stompClient.send(
    "/app/chat.typing",
    {},
    JSON.stringify({
      conversationId: conversationId,
      typing: isTyping,
    })
  );
}

// Đánh dấu đã đọc
function markAsRead(conversationId, messageIds) {
  stompClient.send(
    "/app/chat.read",
    {},
    JSON.stringify({
      conversationId: conversationId,
      messageIds: messageIds,
    })
  );
}
```

---

## 7. Data Models

### 7.1. Conversation

```json
{
  "id": "string",
  "participantIds": ["string"],
  "participants": [
    {
      "userId": "string",
      "displayName": "string",
      "avatarUrl": "string",
      "type": "USER | SELLER",
      "shopId": "string (optional)",
      "shopName": "string (optional)",
      "online": "boolean"
    }
  ],
  "lastMessage": {
    "messageId": "string",
    "senderId": "string",
    "senderName": "string",
    "preview": "string",
    "type": "TEXT | IMAGE | PRODUCT | ORDER | FILE | STICKER",
    "sentAt": "ISO 8601 datetime"
  },
  "unreadCount": {
    "userId1": 0,
    "userId2": 5
  },
  "status": "ACTIVE | ARCHIVED | BLOCKED",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### 7.2. Message

```json
{
  "id": "string",
  "conversationId": "string",
  "senderId": "string",
  "senderName": "string",
  "senderAvatar": "string",
  "type": "TEXT | IMAGE | PRODUCT | ORDER | FILE | STICKER",
  "contents": [
    {
      "contentType": "TEXT | IMAGE | PRODUCT | ORDER | FILE | STICKER",
      "text": "string (for TEXT)",
      "image": {...},
      "product": {...},
      "order": {...},
      "file": {...},
      "sticker": {...}
    }
  ],
  "replyTo": {
    "messageId": "string",
    "senderId": "string",
    "senderName": "string",
    "type": "string",
    "preview": "string",
    "thumbnailUrl": "string (optional)"
  },
  "status": "SENDING | SENT | DELIVERED | READ | FAILED",
  "readBy": ["userId1", "userId2"],
  "sentAt": "ISO 8601 datetime",
  "readAt": "ISO 8601 datetime (optional)",
  "editedAt": "ISO 8601 datetime (optional)",
  "deleted": "boolean"
}
```

### 7.3. Product Content

```json
{
  "productId": "string",
  "productName": "string",
  "description": "string",
  "price": 100000,
  "originalPrice": 120000,
  "currency": "VND",
  "imageUrl": "string",
  "imageUrls": ["string"],
  "shopId": "string",
  "shopName": "string",
  "status": "AVAILABLE | OUT_OF_STOCK | DISCONTINUED",
  "soldCount": 100,
  "rating": 4.5,
  "ratingCount": 50,
  "productUrl": "/products/prod_123",
  "note": "string"
}
```

### 7.4. Order Content

```json
{
  "orderId": "string",
  "orderCode": "ORD20251201001",
  "status": "PENDING | CONFIRMED | SHIPPING | DELIVERED | CANCELLED",
  "totalAmount": 500000,
  "currency": "VND",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "imageUrl": "string",
      "quantity": 2,
      "unitPrice": 100000,
      "totalPrice": 200000,
      "variantName": "Đỏ - Size M",
      "sku": "SKU001"
    }
  ],
  "itemCount": 3,
  "shopId": "string",
  "shopName": "string",
  "orderedAt": "ISO 8601 datetime",
  "orderUrl": "/orders/order_123",
  "shipping": {
    "recipientName": "string",
    "recipientPhone": "string",
    "address": "string"
  },
  "note": "string"
}
```

---

## 8. Enums

### ContentType

| Value     | Mô tả             |
| --------- | ----------------- |
| `TEXT`    | Tin nhắn văn bản  |
| `IMAGE`   | Tin nhắn hình ảnh |
| `PRODUCT` | Chia sẻ sản phẩm  |
| `ORDER`   | Chia sẻ đơn hàng  |
| `FILE`    | Chia sẻ file      |
| `STICKER` | Sticker           |

### MessageStatus

| Value       | Mô tả                    |
| ----------- | ------------------------ |
| `SENDING`   | Đang gửi                 |
| `SENT`      | Đã gửi đến server        |
| `DELIVERED` | Đã chuyển đến người nhận |
| `READ`      | Đã đọc                   |
| `FAILED`    | Gửi thất bại             |

### ConversationStatus

| Value      | Mô tả          |
| ---------- | -------------- |
| `ACTIVE`   | Đang hoạt động |
| `ARCHIVED` | Đã lưu trữ     |
| `BLOCKED`  | Bị chặn        |

### ParticipantType

| Value    | Mô tả                   |
| -------- | ----------------------- |
| `USER`   | Người dùng thông thường |
| `SELLER` | Người bán hàng          |

---

## 9. Tích hợp với các Service khác

Message Service sử dụng **Feign Client** để gọi internal API của các service khác:

### 9.1. User Service

```
GET /users/internal/{username}
```

Lấy thông tin profile user (displayName, avatar, etc.)

### 9.2. Product Service

```
GET /internal/products/{productId}
```

Lấy thông tin sản phẩm khi gửi tin nhắn loại PRODUCT.

### 9.3. Order Service

```
GET /internal/orders/{orderId}
```

Lấy thông tin đơn hàng khi gửi tin nhắn loại ORDER.

---

## 10. Ví dụ sử dụng

### 10.1. Kịch bản: User chat với Shop

1. **User mở chat với Shop:**

```http
POST /api/chat/conversations
{
  "recipientId": "seller_username",
  "recipientType": "SELLER",
  "shopId": "shop_123"
}
```

2. **User gửi tin nhắn hỏi về sản phẩm:**

```http
POST /api/chat/messages
{
  "conversationId": "conv_abc",
  "contentType": "TEXT",
  "text": "Sản phẩm này còn hàng không shop?"
}
```

3. **User chia sẻ sản phẩm:**

```http
POST /api/chat/messages
{
  "conversationId": "conv_abc",
  "contentType": "PRODUCT",
  "product": {
    "productId": "prod_123",
    "note": "Tôi muốn hỏi về sản phẩm này"
  }
}
```

4. **Seller trả lời (qua WebSocket):**

```javascript
stompClient.send(
  "/app/chat.send",
  {},
  JSON.stringify({
    conversationId: "conv_abc",
    contentType: "TEXT",
    text: "Dạ, sản phẩm này còn hàng ạ! Anh/chị đặt ngay đi ạ.",
  })
);
```

5. **User đánh dấu đã đọc:**

```javascript
stompClient.send(
  "/app/chat.read",
  {},
  JSON.stringify({
    conversationId: "conv_abc",
    messageIds: null, // Đánh dấu tất cả
  })
);
```

### 10.2. Kịch bản: Hỗ trợ đơn hàng

```http
POST /api/chat/messages
{
  "conversationId": "conv_abc",
  "contentType": "ORDER",
  "order": {
    "orderId": "order_xyz",
    "note": "Đơn hàng của tôi bao giờ giao?"
  }
}
```

---

## Error Codes

| Code | Message               | Mô tả                                   |
| ---- | --------------------- | --------------------------------------- |
| 400  | Bad Request           | Request không hợp lệ                    |
| 401  | Unauthorized          | Chưa xác thực                           |
| 403  | Forbidden             | Không có quyền truy cập conversation    |
| 404  | Not Found             | Conversation hoặc Message không tồn tại |
| 500  | Internal Server Error | Lỗi server                              |

---

## Lưu ý quan trọng

1. **WebSocket Connection**: Nên duy trì 1 connection duy nhất cho mỗi user session.

2. **Reconnection**: Implement logic reconnect khi mất kết nối WebSocket.

3. **Message Ordering**: Tin nhắn được sắp xếp theo `sentAt` giảm dần (mới nhất trước).

4. **Unread Count**: Tự động tăng khi có tin nhắn mới, reset về 0 khi gọi `markAsRead`.

5. **Soft Delete**: Tin nhắn bị xóa chỉ đánh dấu `deleted = true`, không xóa khỏi database.

6. **Rate Limiting**: Nên implement rate limiting cho việc gửi tin nhắn để tránh spam.

---

_Document version: 1.0_  
_Last updated: December 2025_
