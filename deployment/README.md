# 🚀 Hướng Dẫn Triển Khai CI/CD

## 📋 Tổng Quan

Hệ thống CI/CD tự động triển khai các microservices lên Docker trên Ubuntu 22.04 khi push tag theo format `dev_DD.MM.YYYY_vX`.

> **🌊 DigitalOcean User?** Nếu bạn đang dùng **DigitalOcean Docker Droplet** (đã có Docker sẵn), xem hướng dẫn nhanh: **[DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md)** (10 phút)

### Kiến Trúc Services

```
┌─────────────────────────────────────────────────────────┐
│                     API Gateway (8080)                   │
│                   Load Balancer & Router                 │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼───────────┐│
│ User Service │ │ Notification ││
│   (8081)     │ │ Service(8084)││
└──────┬───────┘ └──┬───────────┘│
       │            │            │
       └────────────┼────────────┘
                    │
          ┌─────────▼──────────┐
          │ Discovery Service  │
          │  Eureka (8761)     │
          └────────────────────┘

External Services:
├── PostgreSQL (DigitalOcean)
├── Redis/Valkey (DigitalOcean)
└── RabbitMQ (CloudAMQP)
```

## 🔧 Yêu Cầu Hệ Thống

### Server Requirements

- **OS**: Ubuntu 22.04 LTS
- **RAM**: 8GB
- **CPU**: 2 Intel cores
- **Disk**: 40GB+ (recommended)
- **Network**: Public IP với ports mở: 22, 8080, 8081, 8084, 8761

### Local Requirements

- Git
- SSH access đến server
- GitHub account với quyền push

## 📦 Cài Đặt Server

### Bước 1: Setup Server

SSH vào server của bạn:

```bash
ssh your-username@your-server-ip
```

Download và chạy setup script:

```bash
# Download script
curl -O https://raw.githubusercontent.com/ntabodoiqua/cnweb_20251/be/test-deploy/deployment/setup-server.sh

# Cấp quyền thực thi
chmod +x setup-server.sh

# Chạy script với sudo
sudo ./setup-server.sh
```

Script sẽ tự động:

- ✅ Cài đặt Docker & Docker Compose
- ✅ Cấu hình firewall (UFW)
- ✅ Tạo thư mục deployment
- ✅ Cấu hình log rotation

### Bước 2: Clone Repository

```bash
# Tạo SSH key nếu chưa có
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key và add vào GitHub
cat ~/.ssh/id_ed25519.pub

# Clone repository
cd /opt
sudo mkdir -p cnweb
sudo chown -R $USER:$USER cnweb
cd cnweb
git clone git@github.com:ntabodoiqua/cnweb_20251.git .
git checkout be/test-deploy
```

### Bước 3: Cấu Hình GitHub Secrets

Vào GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Thêm các secrets sau:

| Secret Name       | Value           | Mô Tả                           |
| ----------------- | --------------- | ------------------------------- |
| `SSH_HOST`        | IP của server   | VD: 192.168.1.100               |
| `SSH_USERNAME`    | Username SSH    | VD: ubuntu                      |
| `SSH_PRIVATE_KEY` | Private SSH key | Nội dung file ~/.ssh/id_ed25519 |
| `SSH_PORT`        | Port SSH        | Mặc định: 22                    |

**Lấy Private Key:**

```bash
# Trên server
cat ~/.ssh/id_ed25519
```

Copy toàn bộ nội dung (bao gồm `-----BEGIN` và `-----END`)

## 🚀 Sử Dụng CI/CD

### Tự Động Deploy (Recommended)

1. **Commit code của bạn:**

```bash
git add .
git commit -m "Your commit message"
git push origin be/test-deploy
```

2. **Tạo và push tag:**

```bash
# Format: dev_DD.MM.YYYY_vX
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1
```

3. **Theo dõi deployment:**

- Vào GitHub → Actions → Xem workflow đang chạy
- Hoặc SSH vào server và xem logs:

```bash
cd /opt/cnweb/backend
docker compose -f docker-compose.prod.yaml logs -f
```

### Deploy Thủ Công

Nếu cần deploy thủ công:

```bash
cd /opt/cnweb/deployment
chmod +x deploy.sh
./deploy.sh dev_23.10.2025_v1
```

## 📊 Quản Lý & Monitoring

### Kiểm Tra Trạng Thái Services

```bash
cd /opt/cnweb/deployment
chmod +x monitor.sh
./monitor.sh
```

Hoặc:

```bash
cd /opt/cnweb/backend
docker compose -f docker-compose.prod.yaml ps
```

### Xem Logs

```bash
# Xem tất cả logs
docker compose -f docker-compose.prod.yaml logs

# Xem logs real-time
docker compose -f docker-compose.prod.yaml logs -f

# Xem logs của 1 service cụ thể
docker compose -f docker-compose.prod.yaml logs -f user-service
docker compose -f docker-compose.prod.yaml logs -f notification-service
```

### Kiểm Tra Health

```bash
# Discovery Service
curl http://localhost:8761/actuator/health

# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8081/actuator/health

# Notification Service
curl http://localhost:8084/actuator/health
```

### Restart Services

```bash
# Restart tất cả
docker compose -f docker-compose.prod.yaml restart

# Restart 1 service cụ thể
docker compose -f docker-compose.prod.yaml restart user-service
```

## 🔄 Rollback

Nếu có vấn đề với version mới:

```bash
cd /opt/cnweb/deployment
chmod +x rollback.sh
./rollback.sh dev_22.10.2025_v1  # Version trước đó
```

## 🔍 Troubleshooting

### Service không start được

1. **Kiểm tra logs:**

```bash
docker compose -f docker-compose.prod.yaml logs service-name
```

2. **Kiểm tra resource:**

```bash
free -h  # Memory
df -h    # Disk
```

3. **Kiểm tra network:**

```bash
docker network ls
docker network inspect backend_microservices-network
```

### Port đã được sử dụng

```bash
# Kiểm tra port nào đang sử dụng
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8081

# Stop service đang chiếm port
sudo kill -9 <PID>
```

### Out of Memory

Nếu server hết RAM:

1. **Tăng swap:**

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

2. **Giảm memory cho services** (edit docker-compose.prod.yaml):

```yaml
services:
  user-service:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Database Connection Issues

Kiểm tra:

1. Firewall rules trên DigitalOcean
2. SSL certificates
3. Network connectivity từ server

```bash
# Test PostgreSQL connection
telnet db-postgresql-sgp1-29269-do-user-23301452-0.k.db.ondigitalocean.com 25060

# Test Redis connection
telnet db-valkey-sgp1-50141-do-user-27848320-0.k.db.ondigitalocean.com 25061
```

## 🔐 Security Best Practices

1. **Không commit secrets vào Git**

   - Sử dụng GitHub Secrets
   - Sử dụng environment variables

2. **Thường xuyên update server:**

```bash
sudo apt update && sudo apt upgrade -y
```

3. **Monitor logs cho security issues:**

```bash
docker compose -f docker-compose.prod.yaml logs | grep -i "unauthorized\|failed\|error"
```

4. **Backup định kỳ:**

```bash
# Backup volumes
docker run --rm -v backend_user-uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .
```

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra GitHub Actions logs
2. Kiểm tra server logs: `./monitor.sh`
3. Tạo issue trên GitHub repository

## 📚 Tài Liệu Tham Khảo

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Eureka Service Discovery](https://spring.io/guides/gs/service-registration-and-discovery/)

---

**Note**: Đảm bảo rằng tất cả credentials trong application.yaml đã được bảo vệ và không public ra ngoài!
