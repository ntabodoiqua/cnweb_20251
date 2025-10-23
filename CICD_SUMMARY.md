# 🎯 Tóm Tắt Quy Trình CI/CD

## ✅ Những Gì Đã Được Tạo

### 1. **Dockerfile** (5 files)

- ✅ `backend/common-dto/Dockerfile` - Build shared library
- ✅ `backend/discovery-service/Dockerfile` - Eureka server
- ✅ `backend/api-gateway/Dockerfile` - API Gateway
- ✅ `backend/user-service/Dockerfile` - User service
- ✅ `backend/notification-service/Dockerfile` - Notification service

### 2. **Docker Compose**

- ✅ `backend/docker-compose.prod.yaml` - Orchestration cho production

### 3. **GitHub Actions Workflow**

- ✅ `.github/workflows/deploy.yml` - CI/CD pipeline tự động

### 4. **Deployment Scripts**

- ✅ `deployment/setup-server.sh` - Setup server Ubuntu 22.04
- ✅ `deployment/deploy.sh` - Deploy thủ công
- ✅ `deployment/rollback.sh` - Rollback về version cũ
- ✅ `deployment/monitor.sh` - Monitor services

### 5. **Documentation**

- ✅ `deployment/README.md` - Hướng dẫn đầy đủ
- ✅ `DEPLOYMENT_QUICKSTART.md` - Hướng dẫn nhanh
- ✅ `.env.example` - Template cho environment variables

## 🎯 Câu Trả Lời Cho Câu Hỏi Của Bạn

### ❓ Có cần CI/CD cho common-dto, api-gateway và discovery-service không?

**✅ CÓ, cần tất cả!** Lý do:

1. **common-dto**:

   - Là dependency của user-service và notification-service
   - Phải build trước khi build các service khác
   - Được install vào local Maven repo trong Docker build

2. **discovery-service (Eureka)**:

   - ⚠️ **CỰC KỲ QUAN TRỌNG**
   - Tất cả services (user, notification, gateway) đều register với Eureka
   - Phải start TRƯỚC các services khác
   - Nếu thiếu → services không tìm thấy nhau

3. **api-gateway**:
   - ⚠️ **CỰC KỲ QUAN TRỌNG**
   - Entry point cho tất cả requests
   - Route traffic đến các microservices
   - Load balancing
   - Nếu thiếu → client không thể access services

## 📋 Quy Trình Deployment

### Automatic (Recommended)

```
Push Tag → GitHub Actions → Build Docker Images → Push to Registry → Deploy to Server
```

### Thứ Tự Start Services

```
1. discovery-service (port 8761) - MUST be healthy first
2. api-gateway (port 8080) - Waits for discovery
3. user-service (port 8081) - Waits for discovery
4. notification-service (port 8084) - Waits for discovery
```

## 🚦 Các Bước Tiếp Theo

### Bước 1: Commit & Push Code

```bash
cd "c:\Users\ADMIN\Desktop\CN WEB\cnweb_20251"
git add .
git commit -m "Add CI/CD pipeline for microservices deployment"
git push origin be/test-deploy
```

### Bước 2: Setup Server (One-time)

```bash
# SSH vào server Ubuntu 22.04
ssh your-username@your-server-ip

# Download và chạy setup script
curl -O https://raw.githubusercontent.com/ntabodoiqua/cnweb_20251/be/test-deploy/deployment/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh

# Clone repo
cd /opt && sudo mkdir -p cnweb && sudo chown -R $USER:$USER cnweb
cd cnweb
git clone git@github.com:ntabodoiqua/cnweb_20251.git .
git checkout be/test-deploy
```

### Bước 3: Setup GitHub Secrets

Vào: https://github.com/ntabodoiqua/cnweb_20251/settings/secrets/actions

Thêm 4 secrets:
| Name | Value |
|------|-------|
| SSH_HOST | IP server |
| SSH_USERNAME | username SSH |
| SSH_PRIVATE_KEY | ~/.ssh/id_ed25519 content |
| SSH_PORT | 22 |

### Bước 4: Deploy!

```bash
# Tạo tag
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1
```

## 📊 Monitoring

### Health Checks

```bash
curl http://YOUR_SERVER_IP:8761/actuator/health  # Discovery
curl http://YOUR_SERVER_IP:8080/actuator/health  # Gateway
curl http://YOUR_SERVER_IP:8081/actuator/health  # User
curl http://YOUR_SERVER_IP:8084/actuator/health  # Notification
```

### Access Services

- **Eureka Dashboard**: http://YOUR_SERVER_IP:8761
- **API Gateway**: http://YOUR_SERVER_IP:8080
- **User API**: http://YOUR_SERVER_IP:8080/api/user/\*\*
- **Notification API**: http://YOUR_SERVER_IP:8080/api/notification/\*\*

## 💾 Resource Allocation (8GB RAM Server)

| Service              | Memory Limit | Description          |
| -------------------- | ------------ | -------------------- |
| discovery-service    | ~512MB       | Eureka (lightweight) |
| api-gateway          | ~512MB       | Gateway routing      |
| user-service         | 512MB-1GB    | Main service với DB  |
| notification-service | 256MB-512MB  | Email service        |
| **Total**            | ~2-2.5GB     | + OS overhead ~1GB   |
| **Available**        | ~4.5GB       | For future services  |

## ⚠️ Important Notes

1. **Security**:
   - ⚠️ Credentials hiện đang hard-coded trong file
   - 🔒 Nên move sang environment variables hoặc secrets manager
2. **Database**:

   - ✅ External PostgreSQL (DigitalOcean) - OK
   - ✅ External Redis (DigitalOcean) - OK
   - ✅ External RabbitMQ (CloudAMQP) - OK

3. **Networking**:

   - Services communicate qua Docker network
   - External access qua exposed ports
   - Service discovery qua Eureka

4. **Persistence**:
   - Volume `user-uploads` cho file uploads
   - Database & Redis ở external → data safe

## 🔧 Troubleshooting Commands

```bash
# View logs
docker compose -f backend/docker-compose.prod.yaml logs -f

# Restart a service
docker compose -f backend/docker-compose.prod.yaml restart user-service

# Check resource usage
docker stats

# Check service health
cd /opt/cnweb/deployment && ./monitor.sh

# Rollback
cd /opt/cnweb/deployment && ./rollback.sh dev_22.10.2025_v1
```

## 📞 Support

Nếu có vấn đề:

1. Check GitHub Actions logs
2. Check server logs: `docker compose logs`
3. Run monitor script: `./deployment/monitor.sh`
4. Create GitHub issue

---

**🎉 Bạn đã có quy trình CI/CD hoàn chỉnh!**

Mỗi lần push tag, hệ thống sẽ:

1. ✅ Build tất cả services
2. ✅ Run tests
3. ✅ Build Docker images
4. ✅ Push to registry
5. ✅ Deploy to server
6. ✅ Health check
7. ✅ Auto rollback if failed

**Next deploy**: Chỉ cần `git tag dev_24.10.2025_v1 && git push origin dev_24.10.2025_v1`
