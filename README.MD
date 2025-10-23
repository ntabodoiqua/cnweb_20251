Web Technologies and E-services Capstone Project
===========================================================

## 👥 Thành viên thực hiện:

- Nguyễn Thế Anh - 20224921
- Hồ Lương An - 20224821
- Bùi Khắc Anh - 20225246
- Lê Đình Hùng Anh - 20224917

## 📋 Mô tả dự án:

### 🏗️ Kiến Trúc Microservices

Dự án được xây dựng theo kiến trúc microservices với Spring Boot và Spring Cloud:

- **Discovery Service (Eureka)** - Service registry và discovery
- **API Gateway** - Single entry point, routing và load balancing
- **User Service** - Quản lý người dùng, authentication, authorization
- **Notification Service** - Gửi email thông báo
- **Common DTO** - Shared data transfer objects

### 🚀 CI/CD Pipeline

Hệ thống tự động deploy với GitHub Actions:

- ✅ Tự động build khi push tag `dev_*`
- ✅ Docker containerization
- ✅ Deployment lên Ubuntu server
- ✅ Health checks và monitoring

### 🛠️ Tech Stack

**Backend:**

- Java 21
- Spring Boot 3.2.2
- Spring Cloud (Eureka, Gateway, OpenFeign)
- PostgreSQL (DigitalOcean)
- Redis/Valkey (DigitalOcean)
- RabbitMQ (CloudAMQP)

**DevOps:**

- Docker & Docker Compose
- GitHub Actions
- GitHub Container Registry (GHCR)
- Ubuntu 22.04 Server

## 📚 Documentation

- 📖 [Quick Start Guide](DEPLOYMENT_QUICKSTART.md) - Hướng dẫn nhanh 5 phút
- 📖 [Full Deployment Guide](deployment/README.md) - Hướng dẫn chi tiết
- 📖 [Architecture Overview](ARCHITECTURE.md) - Sơ đồ kiến trúc hệ thống
- 📖 [Commands Reference](COMMANDS_REFERENCE.md) - Tổng hợp các lệnh thường dùng
- 📖 [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Checklist triển khai
- 📖 [CI/CD Summary](CICD_SUMMARY.md) - Tóm tắt quy trình CI/CD

## 🚀 Quick Start

### Triển Khai Lần Đầu

1. **Setup Server**

```bash
# SSH vào server
ssh your-username@your-server-ip

# Chạy setup script
curl -sSL https://raw.githubusercontent.com/ntabodoiqua/cnweb_20251/be/test-deploy/deployment/setup-server.sh | sudo bash

# Clone repository
cd /opt && sudo mkdir -p cnweb && sudo chown -R $USER:$USER cnweb
cd cnweb
git clone git@github.com:ntabodoiqua/cnweb_20251.git .
git checkout be/test-deploy
```

2. **Setup GitHub Secrets**

Vào: `Settings → Secrets and variables → Actions`

Thêm secrets:

- `SSH_HOST` - IP server
- `SSH_USERNAME` - SSH username
- `SSH_PRIVATE_KEY` - Private key (~/.ssh/id_ed25519)
- `SSH_PORT` - SSH port (default: 22)

3. **Deploy**

```bash
# Tạo tag để trigger deployment
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1
```

### Deploy Version Mới

```bash
# Commit changes
git add .
git commit -m "Your changes"
git push origin be/test-deploy

# Create new tag
git tag dev_24.10.2025_v1
git push origin dev_24.10.2025_v1
```

## 🔍 Monitoring

### Health Checks

```bash
curl http://YOUR_SERVER_IP:8761/actuator/health  # Discovery
curl http://YOUR_SERVER_IP:8080/actuator/health  # Gateway
curl http://YOUR_SERVER_IP:8081/actuator/health  # User Service
curl http://YOUR_SERVER_IP:8084/actuator/health  # Notification
```

### Monitor Script

```bash
cd /opt/cnweb/deployment
./monitor.sh
```

## 🏃 Services

| Service              | Port | Description         |
| -------------------- | ---- | ------------------- |
| Discovery Service    | 8761 | Eureka Server       |
| API Gateway          | 8080 | Entry point         |
| User Service         | 8081 | User management     |
| Notification Service | 8084 | Email notifications |

## 📞 Support

Nếu gặp vấn đề, xem [Troubleshooting Guide](deployment/README.md#troubleshooting) hoặc tạo issue trên GitHub.

---

**Build Status**: ![Deploy Status](https://github.com/ntabodoiqua/cnweb_20251/actions/workflows/deploy.yml/badge.svg)

**License**: Educational Project - HUST 2025
