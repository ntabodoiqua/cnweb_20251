# Cart Feature Implementation - Redis + Async DB Persistence

## Overview

Implemented a robust shopping cart system that supports both authenticated users and guest sessions, using Redis for fast operations and async jobs for database persistence.

## Architecture

### 1. **Redis Layer (Primary Storage)**

- All cart operations happen in Redis first for maximum performance
- Guest carts: TTL of 30 days
- User carts: TTL of 90 days
- Key format: `cart:{identifier}` where identifier is username or `guest:{sessionId}`

### 2. **Database Layer (Long-term Persistence)**

- Async jobs persist user carts to PostgreSQL
- Guest carts are NOT persisted (temporary only)
- Scheduled job runs every 5 minutes to sync all user carts

### 3. **Key Features**

#### Guest Cart Support

- Guest users get a session ID from frontend (`X-Session-Id` header)
- Cart stored in Redis with key `cart:guest:{sessionId}`
- No database persistence for guest carts

#### Authenticated User Cart

- Uses username from JWT token as identifier
- Cart stored in Redis with key `cart:{username}`
- Automatically persisted to database after each operation (async)
- On login, if Redis doesn't have cart, loads from database

#### Cart Merge on Login

- When user logs in, frontend calls `/api/v1/cart/merge` with guest session ID
- Merges guest cart into user cart:
  - Same product + variant: quantities are added
  - Different products: added to user cart
- Guest cart is deleted after merge
- Merged cart is persisted to database

## Components

### Configuration

1. **RedisConfig.java** - Redis template configuration with JSON serialization
2. **AsyncConfig.java** - Thread pool executor for async tasks

### DTOs

1. **AddToCartRequest** - Add item to cart
2. **UpdateCartItemRequest** - Update item quantity
3. **MergeCartRequest** - Merge guest cart to user cart
4. **CartItemDTO** - Cart item data transfer object
5. **CartDTO** - Complete cart with items and totals

### Repositories

1. **CartRepository** - JPA repository for Cart entity
2. **CartItemRepository** - JPA repository for CartItem entity
3. **RedisCartRepository** - Redis operations for cart management

### Services

1. **CartService** - Main business logic for cart operations
2. **CartPersistenceService** - Async persistence to database
   - `persistCartToDatabase()` - Async method triggered after operations
   - `scheduledPersistence()` - Scheduled job every 5 minutes
   - `loadCartFromDatabase()` - Load cart from DB to Redis

### Controller

**CartController** - REST API endpoints:

- `GET /api/v1/cart` - Get current cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items` - Update item quantity
- `DELETE /api/v1/cart/items` - Remove item from cart
- `DELETE /api/v1/cart` - Clear entire cart
- `POST /api/v1/cart/merge` - Merge guest cart to user cart
- `GET /api/v1/cart/count` - Get cart item count

## Usage Flow

### Guest User Flow

1. Frontend generates session ID (UUID)
2. Sends `X-Session-Id` header with all cart requests
3. Cart stored in Redis only
4. On login, calls merge endpoint

### Authenticated User Flow

1. JWT token in Authorization header
2. Username extracted from JWT
3. Cart operations in Redis
4. Async job persists to database after each operation

### Login/Merge Flow

```
1. User has guest cart: guest:abc123
2. User logs in: JWT with username "john"
3. Frontend calls: POST /api/v1/cart/merge
   Body: { "guestSessionId": "abc123" }
4. Backend:
   - Gets guest cart from Redis
   - Gets user cart from Redis (or DB if not in Redis)
   - Merges items (adds quantities for duplicates)
   - Saves merged cart to Redis
   - Triggers async DB persistence
   - Deletes guest cart
```

## Key Benefits

1. **Performance**: All operations happen in Redis (microsecond latency)
2. **Scalability**: Redis handles high concurrency easily
3. **Reliability**: Async jobs ensure eventual consistency with database
4. **Guest Support**: No registration required to shop
5. **Seamless Merge**: No cart items lost when user logs in
6. **Fault Tolerance**: If Redis fails, can rebuild from database for authenticated users

## Technical Decisions

### Why Redis First?

- Shopping cart is accessed frequently
- Need fast read/write operations
- Temporary nature for guest users
- Auto-expiration (TTL) for cleanup

### Why Async Persistence?

- Don't slow down cart operations with DB writes
- Batch operations reduce database load
- User experience is not blocked
- Scheduled job catches any missed updates

### Why Not Persist Guest Carts?

- Guest carts are temporary
- Reduces database load
- Privacy considerations
- TTL handles cleanup automatically

## Configuration

### Redis Connection

Already configured in `application.yaml`:

```yaml
spring:
  data:
    redis:
      host: db-valkey-sgp1-03029-do-user-27848320-0.m.db.ondigitalocean.com
      port: 25061
      username: default
      password: ${SPRING_DATA_REDIS_PASSWORD:changeme}
      ssl:
        enabled: true
```

### Async Executor

- Core pool size: 5 threads
- Max pool size: 10 threads
- Queue capacity: 100 tasks

### Scheduled Job

- Fixed delay: 5 minutes (300,000 ms)
- Persists all user carts from Redis to database

## API Examples

### Add to Cart (Guest)

```bash
POST /api/v1/cart/items
Headers:
  X-Session-Id: 550e8400-e29b-41d4-a716-446655440000
Body:
{
  "productId": "PROD123",
  "productName": "Laptop",
  "variantId": "VAR456",
  "variantName": "16GB RAM",
  "imageUrl": "https://...",
  "quantity": 1,
  "price": 1200.00,
  "originalPrice": 1500.00
}
```

### Get Cart (Authenticated)

```bash
GET /api/v1/cart
Headers:
  Authorization: Bearer {JWT_TOKEN}
```

### Merge Cart (After Login)

```bash
POST /api/v1/cart/merge
Headers:
  Authorization: Bearer {JWT_TOKEN}
Body:
{
  "guestSessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Update Item Quantity

```bash
PUT /api/v1/cart/items
Headers:
  Authorization: Bearer {JWT_TOKEN}
Body:
{
  "productId": "PROD123",
  "variantId": "VAR456",
  "quantity": 3
}
```

### Remove Item

```bash
DELETE /api/v1/cart/items?productId=PROD123&variantId=VAR456
Headers:
  Authorization: Bearer {JWT_TOKEN}
```

## Database Schema

### Table: carts

- id (UUID, PK)
- user_name (String, unique)
- created_at (Timestamp)
- updated_at (Timestamp)

### Table: cart_items

- id (UUID, PK)
- cart_id (UUID, FK -> carts.id)
- product_id (String)
- product_name (String)
- variant_id (String, nullable)
- variant_name (String, nullable)
- image_url (String, nullable)
- quantity (Integer)
- price (Decimal)
- original_price (Decimal, nullable)
- created_at (Timestamp)
- updated_at (Timestamp)

## Error Handling

The implementation includes basic error handling:

- Cart not found returns error
- Invalid quantities rejected by validation
- Unauthorized merge requests return 401
- All operations logged for debugging

## Future Enhancements

1. Add cart expiration warnings
2. Implement cart item stock validation
3. Add price change notifications
4. Support cart sharing via link
5. Add cart analytics
6. Implement cart abandonment tracking
