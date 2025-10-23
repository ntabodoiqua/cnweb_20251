# 🚀 Quick Start Guide - CI/CD Deployment

## ⚡ Triển Khai Nhanh (5 Phút)

### 1️⃣ Setup Server (One-time)

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

### 2️⃣ Setup GitHub Secrets (One-time)

Vào: https://github.com/ntabodoiqua/cnweb_20251/settings/secrets/actions

Thêm 4 secrets:

- `SSH_HOST`: IP server của bạn
- `SSH_USERNAME`: username SSH (vd: ubuntu)
- `SSH_PRIVATE_KEY`: Nội dung `~/.ssh/id_ed25519` từ server
- `SSH_PORT`: 22

### 3️⃣ Deploy Lần Đầu

```bash
# Trên máy local
cd cnweb_20251
git add .
git commit -m "Setup CI/CD"
git push origin be/test-deploy

# Tạo tag và push
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1
```

✅ **Xong!** GitHub Actions sẽ tự động build và deploy.

## 📊 Kiểm Tra Deployment

### Trên GitHub

- Vào: https://github.com/ntabodoiqua/cnweb_20251/actions
- Xem workflow đang chạy

### Trên Server

```bash
ssh your-username@your-server-ip
cd /opt/cnweb/backend
docker compose -f docker-compose.prod.yaml ps
```

### Truy cập Services

- **Discovery**: http://YOUR_SERVER_IP:8761
- **API Gateway**: http://YOUR_SERVER_IP:8080
- **User Service**: http://YOUR_SERVER_IP:8081
- **Notification**: http://YOUR_SERVER_IP:8084

## 🔄 Deploy Version Mới

```bash
# Sửa code
git add .
git commit -m "Your changes"
git push origin be/test-deploy

# Tạo tag mới
git tag dev_24.10.2025_v1
git push origin dev_24.10.2025_v1
```

## 🛠️ Lệnh Hữu Ích

```bash
# Xem logs
docker compose -f docker-compose.prod.yaml logs -f

# Restart service
docker compose -f docker-compose.prod.yaml restart user-service

# Monitor
cd /opt/cnweb/deployment && ./monitor.sh

# Rollback
cd /opt/cnweb/deployment && ./rollback.sh dev_23.10.2025_v1
```

## ❓ Troubleshooting

**Service không start?**

```bash
docker compose -f docker-compose.prod.yaml logs service-name
```

**Out of memory?**

```bash
free -h
docker stats --no-stream
```

**Port conflict?**

```bash
sudo netstat -tulpn | grep :8080
```

## 📚 Tài Liệu Đầy Đủ

Xem file `deployment/README.md` cho hướng dẫn chi tiết.

---

**Support**: Create issue tại https://github.com/ntabodoiqua/cnweb_20251/issues
