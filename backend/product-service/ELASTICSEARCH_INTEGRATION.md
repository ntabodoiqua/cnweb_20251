# Elasticsearch Integration Guide

## Tổng quan

Tích hợp Elasticsearch vào `product-service` để cung cấp tìm kiếm sản phẩm và cửa hàng nhanh và chính xác hơn với:

- **Full-text search** với hỗ trợ tiếng Việt
- **Search trong Description, Specs và Metadata** của product và variant
- **Search cửa hàng (Store)** theo tên, mô tả, địa chỉ
- **Autocomplete/Suggestion** cho search box
- **Global Search** - tìm kiếm cả sản phẩm và cửa hàng cùng lúc
- **Faceted search** với aggregations
- **Fuzzy search** cho tìm kiếm gần đúng
- **Real-time sync** với PostgreSQL

## Search Fields

### Product Search Fields

Elasticsearch tìm kiếm trong các trường sau với độ ưu tiên khác nhau:

| Field                   | Boost | Mô tả                           |
| ----------------------- | ----- | ------------------------------- |
| `name`                  | 3.0   | Tên sản phẩm (ưu tiên cao nhất) |
| `name.autocomplete`     | 2.0   | Tên sản phẩm cho autocomplete   |
| `shortDescription`      | 1.5   | Mô tả ngắn                      |
| `brandName`             | 1.5   | Tên thương hiệu                 |
| `categoryName`          | 1.0   | Tên danh mục                    |
| `description`           | 1.0   | Mô tả chi tiết                  |
| `specsText`             | 1.0   | **Thông số kỹ thuật (specs)**   |
| `variants.metadataText` | 1.0   | **Metadata của variants**       |
| `variants.variantName`  | 1.0   | **Tên variant**                 |

### Store Search Fields

| Field                    | Boost | Mô tả                           |
| ------------------------ | ----- | ------------------------------- |
| `storeName`              | 3.0   | Tên cửa hàng (ưu tiên cao nhất) |
| `storeName.autocomplete` | 2.0   | Tên cửa hàng cho autocomplete   |
| `storeDescription`       | 1.5   | Mô tả cửa hàng                  |
| `shopAddress`            | 1.0   | Địa chỉ cửa hàng                |

### Ví dụ Search

```json
// Search sản phẩm theo specs (RAM, màn hình, pin...)
{"keyword": "8GB RAM"}
{"keyword": "AMOLED 120Hz"}
{"keyword": "pin 5000mAh"}

// Search sản phẩm theo variant metadata (màu sắc, dung lượng...)
{"keyword": "màu xanh 256GB"}
{"keyword": "Gold 128GB"}

// Search cửa hàng
{"keyword": "Apple Store"}
{"keyword": "cửa hàng Hà Nội"}
```

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        Product Service                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  REST API   │───>│  Service    │───>│  Elasticsearch      │ │
│  │  /search    │    │  Layer      │    │  Client             │ │
│  └─────────────┘    └──────┬──────┘    └──────────┬──────────┘ │
│                            │                       │            │
│                     ┌──────┴──────┐         ┌──────┴──────┐    │
│                     │ PostgreSQL  │         │Elasticsearch│    │
│                     │ (Primary)   │◄───────►│   (Search)  │    │
│                     └─────────────┘  Sync   └─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Cấu hình tối ưu cho Server 8GB RAM

### Memory Allocation

| Component       | RAM Allocation |
| --------------- | -------------- |
| Elasticsearch   | 512MB - 1GB    |
| Product Service | 512MB - 1GB    |
| Other Services  | ~4-5GB         |
| OS & Buffer     | ~1-2GB         |

### Elasticsearch Settings (trong docker-compose)

```yaml
environment:
  - "ES_JAVA_OPTS=-Xms512m -Xmx512m" # Heap size
  - discovery.type=single-node # Single node cluster
  - indices.memory.index_buffer_size=10%
  - indices.queries.cache.size=5%
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

## API Endpoints

### 1. Search Products

```http
POST /api/products/v1/products/search
Content-Type: application/json

{
  "keyword": "iphone",
  "categoryId": "category-id",
  "brandId": "brand-id",
  "priceFrom": 1000000,
  "priceTo": 50000000,
  "minRating": 4.0,
  "sortBy": "relevance",
  "sortDirection": "desc",
  "enableAggregation": true,
  "enableHighlight": true,
  "enableFuzzy": true
}
```

### 2. Quick Product Search (GET)

```http
GET /api/products/v1/products/search?q=iphone&categoryId=xxx&sortBy=price&page=0&size=20
```

### 3. Product Autocomplete Suggestions

```http
GET /api/products/v1/products/search/suggest?q=ip&size=10
```

### 4. Search Stores

```http
POST /api/products/v1/stores/search
Content-Type: application/json

{
  "keyword": "Apple Store",
  "provinceId": 1,
  "minRating": 4.0,
  "minProducts": 10,
  "sortBy": "rating",
  "sortDirection": "desc",
  "enableHighlight": true,
  "enableFuzzy": true,
  "enableAggregation": false
}
```

### 5. Quick Store Search (GET)

```http
GET /api/products/v1/stores/search?q=Apple&provinceId=1&sortBy=rating&page=0&size=20
```

### 6. Store Autocomplete Suggestions

```http
GET /api/products/v1/stores/search/suggest?q=App&size=10
```

### 7. Global Search (Products + Stores)

```http
GET /api/products/v1/search?q=iphone&productLimit=10&storeLimit=5
```

Response trả về cả sản phẩm và cửa hàng:

```json
{
  "code": 1000,
  "result": {
    "products": {
      "hits": [...],
      "totalHits": 100,
      "took": 15
    },
    "stores": {
      "hits": [...],
      "totalHits": 5,
      "took": 8
    },
    "totalTook": 25
  }
}
```

### 8. Global Suggestions

```http
GET /api/products/v1/search/suggest?q=app&productLimit=5&storeLimit=3
```

### 9. Health Check

```http
GET /api/products/v1/products/search/health
```

### 10. Admin - Reindex Products

```http
POST /api/products/v1/products/search/reindex-all
Authorization: Bearer <admin-token>
```

### 11. Admin - Reindex Stores

```http
POST /api/products/v1/stores/search/reindex-all
Authorization: Bearer <admin-token>
```

### 12. Admin - Sync Stats

```http
GET /api/products/v1/products/search/sync-stats
Authorization: Bearer <admin-token>
```

## Response Format

### Search Response

```json
{
  "code": 1000,
  "result": {
    "hits": [
      {
        "id": "product-id",
        "score": 12.5,
        "product": {
          "id": "product-id",
          "name": "iPhone 15 Pro Max",
          "shortDescription": "...",
          "thumbnailImage": "https://...",
          "minPrice": 25000000,
          "maxPrice": 35000000,
          "soldCount": 150,
          "averageRating": 4.8,
          "storeName": "Apple Store"
        },
        "highlights": {
          "name": ["<em>iPhone</em> 15 Pro Max"]
        }
      }
    ],
    "totalHits": 125,
    "totalPages": 7,
    "currentPage": 0,
    "pageSize": 20,
    "took": 15,
    "aggregations": {
      "categories": [
        {"key": "cat-1", "label": "Điện thoại", "docCount": 50}
      ],
      "brands": [...],
      "priceRange": {
        "min": 1000000,
        "max": 50000000,
        "buckets": [...]
      }
    }
  }
}
```

## Deployment

### 1. Deploy Elasticsearch trước

```bash
# SSH vào server
ssh root@your-server

# Pull và chạy Elasticsearch
docker-compose -f docker-compose.prod.yaml up -d elasticsearch

# Đợi ES khởi động (~1-2 phút)
docker logs -f elasticsearch

# Kiểm tra health
curl http://localhost:9200/_cluster/health
```

### 2. Deploy Product Service

```bash
# Rebuild product-service với ES support
docker-compose -f docker-compose.prod.yaml build product-service

# Restart product-service
docker-compose -f docker-compose.prod.yaml up -d product-service

# Kiểm tra logs
docker logs -f product-service
```

### 3. Trigger Initial Sync

Product service sẽ tự động sync khi khởi động nếu index trống. Hoặc có thể trigger manual:

```bash
# Login lấy admin token
TOKEN=$(curl -s -X POST 'https://your-api/api/users/v1/auth/token' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"xxx"}' | jq -r '.result.token')

# Trigger reindex
curl -X POST 'https://your-api/api/products/v1/search/reindex-all' \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

### Elasticsearch Metrics

```bash
# Cluster health
curl http://localhost:9200/_cluster/health?pretty

# Index stats
curl http://localhost:9200/products/_stats?pretty

# Search stats
curl http://localhost:9200/products/_search?size=0
```

### Sync Status

```bash
curl 'https://your-api/api/products/v1/search/sync-stats' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Troubleshooting

### Elasticsearch không khởi động

```bash
# Check logs
docker logs elasticsearch

# Check memory
docker stats elasticsearch

# Giảm memory nếu cần
# Sửa ES_JAVA_OPTS=-Xms256m -Xmx256m
```

### Sync không hoạt động

```bash
# Check kết nối
curl http://localhost:9200/_cluster/health

# Check product-service logs
docker logs product-service | grep -i elastic

# Manual sync một product
curl -X POST 'https://your-api/api/products/v1/search/reindex/{product-id}' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Search chậm

```bash
# Check index size
curl http://localhost:9200/_cat/indices/products?v

# Optimize index
curl -X POST http://localhost:9200/products/_forcemerge?max_num_segments=1
```

## Best Practices

1. **Không expose port 9200 ra internet** - Chỉ internal network
2. **Backup Elasticsearch data volume** định kỳ
3. **Monitor memory usage** - ES cần đủ memory cho caching
4. **Sử dụng aggregations có chọn lọc** - Chỉ enable khi cần hiển thị filters
5. **Index settings tối ưu**:
   - `number_of_shards: 1` - Cho small-medium dataset
   - `number_of_replicas: 0` - Single node không cần replicas
   - `refresh_interval: 5s` - Balance giữa real-time và performance

## Files đã tạo/sửa

```
product-service/
├── pom.xml                                    # Thêm spring-data-elasticsearch
├── src/main/
│   ├── java/com/vdt2025/product_service/
│   │   ├── configuration/
│   │   │   └── ElasticsearchConfig.java       # ES client config
│   │   ├── controller/
│   │   │   ├── ProductSearchController.java   # Product Search REST API
│   │   │   ├── StoreSearchController.java     # Store Search REST API (MỚI)
│   │   │   └── GlobalSearchController.java    # Global Search REST API (MỚI)
│   │   ├── document/
│   │   │   ├── ProductDocument.java           # ES document cho Product
│   │   │   └── StoreDocument.java             # ES document cho Store (MỚI)
│   │   ├── dto/
│   │   │   ├── request/search/
│   │   │   │   ├── ProductSearchRequest.java
│   │   │   │   └── StoreSearchRequest.java    # Request tìm kiếm store (MỚI)
│   │   │   └── response/search/
│   │   │       ├── ProductSearchResponse.java
│   │   │       ├── StoreSearchResponse.java   # Response tìm kiếm store (MỚI)
│   │   │       └── GlobalSearchResponse.java  # Response tìm kiếm tổng hợp (MỚI)
│   │   ├── event/
│   │   │   ├── ProductChangedEvent.java       # Event class
│   │   │   └── ProductChangedEventListener.java
│   │   ├── repository/elasticsearch/
│   │   │   ├── ProductSearchRepository.java   # ES repository cho Product
│   │   │   └── StoreSearchRepository.java     # ES repository cho Store (MỚI)
│   │   ├── facade/
│   │   │   └── ProductSearchFacade.java       # Facade cho product search
│   │   └── service/search/
│   │       ├── ProductSearchService.java      # Interface
│   │       ├── ProductSearchServiceImpl.java  # Implementation
│   │       ├── ProductIndexMapper.java        # Entity -> Document mapper
│   │       ├── StoreSearchService.java        # Interface cho store search (MỚI)
│   │       ├── StoreSearchServiceImpl.java    # Implementation store search (MỚI)
│   │       ├── StoreIndexMapper.java          # Store Entity -> Document mapper (MỚI)
│   │       └── ElasticsearchSyncService.java  # Sync service (cập nhật: hỗ trợ cả Store)
│   └── resources/
│       ├── application.yaml                   # Thêm ES config
│       └── elasticsearch/
│           └── product-settings.json          # Vietnamese analyzer
└── backend/
    └── docker-compose.prod.yaml               # Thêm ES container
```
