# 🛒 E-Commerce Platform - Microservices Architecture

> **Dự án Capstone: Web Technologies and E-services**  
> Trường Đại học Bách khoa Hà Nội - Học kỳ 2024.2

[![Deploy Status](https://github.com/ntabodoiqua/cnweb_20251/actions/workflows/deploy.yml/badge.svg)](https://github.com/ntabodoiqua/cnweb_20251/actions)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-Educational-blue.svg)](LICENSE)

## 📖 Tổng Quan

Nền tảng thương mại điện tử full-stack được xây dựng theo kiến trúc microservices hiện đại, sử dụng Spring Cloud ecosystem và React. Dự án tập trung vào khả năng mở rộng, bảo trì và triển khai tự động thông qua CI/CD pipeline.

### ✨ Tính Năng Chính

- 🔐 **Authentication & Authorization** - JWT-based với role management
- 👥 **User Management** - Đăng ký, đăng nhập, quản lý profile
- 📦 **Product Management** - CRUD sản phẩm, phân loại, tìm kiếm
- 🛒 **Order Processing** - Giỏ hàng, đặt hàng, theo dõi đơn hàng
- 💳 **Payment Integration** - Xử lý thanh toán đa dạng
- 📧 **Email Notifications** - Thông báo tự động qua email
- 📁 **File Management** - Upload và quản lý files/images
- 📊 **Admin Dashboard** - Quản trị hệ thống toàn diện

## 👥 Nhóm Phát Triển

| Họ và Tên        | MSSV     | Vai Trò                        |
| ---------------- | -------- | ------------------------------ |
| Nguyễn Thế Anh   | 20224921 | Team Leader, Backend Developer |
| Hồ Lương An      | 20224821 | Backend Developer              |
| Bùi Khắc Anh     | 20225246 | Frontend Developer             |
| Lê Đình Hùng Anh | 20224917 | DevOps Engineer                |

## 🏗️ Kiến Trúc Hệ Thống

### Microservices Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          API Gateway (8080)             │
│    - Routing & Load Balancing           │
│    - Rate Limiting                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│    Discovery Service (Eureka:8761)      │
│    - Service Registry                   │
│    - Health Monitoring                  │
└──────┬──────────────────────────────────┘
       │
       ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼          ▼          ▼          ▼
   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
   │User  │  │Product│ │Order │  │Payment│ │File  │  │Notif │  │Common│
   │:8081 │  │:8082 │  │:8083 │  │:8085 │  │:8086 │  │:8084 │  │DTO   │
   └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └──────┘
      │         │         │         │         │         │
      └─────────┴─────────┴─────────┴─────────┴─────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   External Services   │
              ├───────────────────────┤
              │ - PostgreSQL          │
              │ - Redis/Valkey        │
              │ - RabbitMQ            │
              └───────────────────────┘
```

### Services Overview

| Service                  | Port | Mô Tả                                | Tech Stack               |
| ------------------------ | ---- | ------------------------------------ | ------------------------ |
| **Discovery Service**    | 8761 | Service registry và discovery        | Spring Cloud Eureka      |
| **API Gateway**          | 8080 | Entry point, routing, load balancing | Spring Cloud Gateway     |
| **User Service**         | 8081 | Quản lý người dùng, authentication   | Spring Security, JWT     |
| **Product Service**      | 8082 | Quản lý sản phẩm, catalog            | Spring Data JPA          |
| **Order Service**        | 8083 | Xử lý đơn hàng, giỏ hàng             | Spring Data JPA          |
| **Notification Service** | 8084 | Gửi email, notifications             | JavaMailSender, RabbitMQ |
| **Payment Service**      | 8085 | Xử lý thanh toán                     | Spring WebFlux           |
| **File Service**         | 8086 | Upload/download files                | Multipart File Handling  |
| **Common DTO**           | -    | Shared data transfer objects         | Java POJOs               |

## 🛠️ Technology Stack

### Backend

- **Core Framework**: Java 21, Spring Boot 3.2.2
- **Microservices**: Spring Cloud (Eureka, Gateway, OpenFeign, Config)
- **Security**: Spring Security, JWT, BCrypt
- **Database**: PostgreSQL 15 (DigitalOcean Managed Database)
- **Caching**: Redis/Valkey (DigitalOcean)
- **Message Queue**: RabbitMQ (CloudAMQP)
- **API Documentation**: SpringDoc OpenAPI 3

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6

### DevOps & Infrastructure

- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (GHCR)
- **Server**: Ubuntu 22.04 LTS
- **Reverse Proxy**: Nginx
- **Monitoring**: Spring Boot Actuator

## 📚 Tài Liệu

### Hướng Dẫn Triển Khai

- 📖 [Quick Start Guide](md%20file/DEPLOYMENT_QUICKSTART.md) - Triển khai nhanh trong 5 phút
- 📖 [Full Deployment Guide](deployment/README.md) - Hướng dẫn chi tiết từng bước
- 📖 [DigitalOcean Setup](deployment/DIGITALOCEAN_SETUP.md) - Cấu hình cloud infrastructure

### Tài Liệu Kỹ Thuật

- 📖 [Architecture Overview](md%20file/ARCHITECTURE.md) - Kiến trúc và design patterns
- 📖 [API Documentation](md%20file/API_DOCS.md) - RESTful API reference
- 📖 [Database Schema](md%20file/DATABASE_SCHEMA.md) - Cấu trúc database

### DevOps & Operations

- 📖 [CI/CD Summary](md%20file/CICD_SUMMARY.md) - Quy trình CI/CD pipeline
- 📖 [Commands Reference](md%20file/COMMANDS_REFERENCE.md) - Các lệnh thường dùng
- 📖 [Deployment Checklist](md%20file/DEPLOYMENT_CHECKLIST.md) - Checklist triển khai

## 🚀 Getting Started

### Prerequisites

- **Java 21** hoặc cao hơn
- **Node.js 18+** và npm/yarn
- **Docker** và Docker Compose
- **Git**
- **PostgreSQL 15+** (hoặc sử dụng Docker)

### Local Development

#### 1. Clone Repository

```bash
git clone https://github.com/ntabodoiqua/cnweb_20251.git
cd cnweb_20251
```

#### 2. Setup Backend

```bash
cd backend

# Build tất cả services
./mvnw clean install -DskipTests

# Chạy services bằng Docker Compose
docker-compose up -d

# Hoặc chạy từng service riêng lẻ
cd discovery-service && ./mvnw spring-boot:run
cd api-gateway && ./mvnw spring-boot:run
cd user-service && ./mvnw spring-boot:run
# ... các services khác
```

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Production Deployment

#### 1. Setup Server

```bash
# SSH vào server
ssh your-username@your-server-ip

# Chạy setup script
curl -sSL https://raw.githubusercontent.com/ntabodoiqua/cnweb_20251/main/deployment/setup-server.sh | sudo bash

# Clone repository
cd /opt && sudo mkdir -p cnweb && sudo chown -R $USER:$USER cnweb
cd cnweb
git clone git@github.com:ntabodoiqua/cnweb_20251.git .
```

#### 2. Configure GitHub Secrets

Vào `Settings → Secrets and variables → Actions` và thêm:

| Secret            | Mô Tả                               |
| ----------------- | ----------------------------------- |
| `SSH_HOST`        | IP address của server               |
| `SSH_USERNAME`    | SSH username                        |
| `SSH_PRIVATE_KEY` | Private SSH key (~/.ssh/id_ed25519) |
| `SSH_PORT`        | SSH port (mặc định: 22)             |

#### 3. Deploy với Tag

```bash
# Commit changes
git add .
git commit -m "Your changes description"
git push origin main

# Tạo tag để trigger deployment
git tag dev_$(date +%d.%m.%Y)_v1
git push origin dev_$(date +%d.%m.%Y)_v1
```

CI/CD pipeline sẽ tự động:

1. ✅ Build Docker images
2. ✅ Push images lên GitHub Container Registry
3. ✅ Deploy lên server
4. ✅ Run health checks

## 🔍 Monitoring & Health Checks

### Service Health Endpoints

```bash
# Discovery Service
curl http://YOUR_SERVER_IP:8761/actuator/health

# API Gateway
curl http://YOUR_SERVER_IP:8080/actuator/health

# User Service
curl http://YOUR_SERVER_IP:8081/actuator/health

# Product Service
curl http://YOUR_SERVER_IP:8082/actuator/health

# Order Service
curl http://YOUR_SERVER_IP:8083/actuator/health

# Notification Service
curl http://YOUR_SERVER_IP:8084/actuator/health

# Payment Service
curl http://YOUR_SERVER_IP:8085/actuator/health

# File Service
curl http://YOUR_SERVER_IP:8086/actuator/health
```

### Monitoring Script

```bash
cd /opt/cnweb/deployment
./monitor.sh

# Xem logs
./monitor.sh logs service-name

# Rollback deployment
./rollback.sh
```

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất

### User Management

- `GET /api/users` - Danh sách users (Admin)
- `GET /api/users/{id}` - Chi tiết user
- `PUT /api/users/{id}` - Cập nhật user
- `DELETE /api/users/{id}` - Xóa user (Admin)

### Products

- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Seller/Admin)
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm

### Orders

- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/{id}` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/{id}/status` - Cập nhật trạng thái

_Xem chi tiết tại [API Documentation](md%20file/API_DOCS.md)_

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
./mvnw test

# Run tests for specific service
cd user-service && ./mvnw test

# Run with coverage
./mvnw test jacoco:report
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

**Service không start được:**

```bash
# Check logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name
```

**Database connection failed:**

```bash
# Kiểm tra PostgreSQL status
docker-compose ps postgres

# Check connection string trong application.properties
```

**Port already in use:**

```bash
# Tìm process đang dùng port
netstat -ano | findstr :8080

# Kill process
taskkill /PID <process_id> /F
```

Xem thêm tại [Troubleshooting Guide](deployment/README.md#troubleshooting)

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án giáo dục - Trường Đại học Bách khoa Hà Nội 2025.  
Chỉ sử dụng cho mục đích học tập.

## 📞 Contact & Support

- 📧 Email: [anh.nt224921@sis.hust.edu.vn](mailto:nguyentheanh@hust.edu.vn)
- 🐛 Issues: [GitHub Issues](https://github.com/ntabodoiqua/cnweb_20251/issues)
- 📖 Wiki: [Project Wiki](https://github.com/ntabodoiqua/cnweb_20251/wiki)

---

**Made with ❤️ by HUST Students**
