# 🎯 Getting Started - Bắt Đầu Ngay!

## 🎬 Video Hướng Dẫn (Recommended)

> **Coming soon**: Video tutorial từng bước chi tiết

## 📚 Tài Liệu Có Sẵn

Chúng tôi đã chuẩn bị đầy đủ tài liệu cho bạn:

### 🚀 Bắt Đầu Nhanh

1. **[DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)** ⭐ BẮT ĐẦU Ở ĐÂY!
   - Hướng dẫn deploy trong 5 phút
   - Step-by-step rõ ràng
   - Perfect cho người mới

### 📖 Hướng Dẫn Chi Tiết

2. **[deployment/README.md](deployment/README.md)**
   - Hướng dẫn đầy đủ nhất
   - Troubleshooting guide
   - Best practices

### 🏗️ Hiểu Hệ Thống

3. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - Sơ đồ kiến trúc hệ thống
   - CI/CD pipeline flow
   - Service communication

### 🛠️ Làm Việc Hàng Ngày

4. **[COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md)**
   - Tất cả commands bạn cần
   - Copy-paste friendly
   - Organized theo category

### ✅ Checklist

5. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
   - Pre-deployment checklist
   - Deployment steps
   - Verification checklist

### ❓ Câu Hỏi Thường Gặp

6. **[FAQ.md](FAQ.md)**
   - Trả lời 20+ câu hỏi phổ biến
   - Troubleshooting tips
   - Best practices

### 📊 Tổng Kết

7. **[CICD_SUMMARY.md](CICD_SUMMARY.md)**
   - Overview toàn bộ quy trình
   - Next steps
   - Important notes

## 🎯 Lộ Trình Học Tập

### Ngày 1: Chuẩn Bị (1-2 giờ)

**Mục tiêu**: Hiểu hệ thống và setup môi trường

```
✅ 1. Đọc README.md chính (overview)
✅ 2. Đọc ARCHITECTURE.md (hiểu kiến trúc)
✅ 3. Đọc DEPLOYMENT_QUICKSTART.md
✅ 4. Setup server Ubuntu 22.04
✅ 5. Setup GitHub secrets
```

**Resources**:

- 📖 [README.md](README.MD)
- 📖 [ARCHITECTURE.md](ARCHITECTURE.md)
- 📖 [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)

---

### Ngày 2: Deploy Lần Đầu (2-3 giờ)

**Mục tiêu**: Deployment thành công lần đầu

```
✅ 1. Chạy setup-server.sh trên server
✅ 2. Clone repository
✅ 3. Configure GitHub Secrets
✅ 4. Push tag để trigger deployment
✅ 5. Monitor deployment
✅ 6. Verify health checks
```

**Follow**:

- 📖 [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) - Steps 1-3
- 📖 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - First-time deployment

**Commands**:

```bash
# 1. Setup server
ssh your-username@your-server-ip
curl -O https://raw.githubusercontent.com/ntabodoiqua/cnweb_20251/be/test-deploy/deployment/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh

# 2. Clone repo
cd /opt && sudo mkdir -p cnweb && sudo chown -R $USER:$USER cnweb
cd cnweb
git clone git@github.com:ntabodoiqua/cnweb_20251.git .
git checkout be/test-deploy

# 3. Local: Push tag
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1

# 4. Monitor
# GitHub: https://github.com/ntabodoiqua/cnweb_20251/actions
# Server: cd /opt/cnweb/deployment && ./monitor.sh
```

---

### Ngày 3: Làm Quen Với Hệ Thống (1-2 giờ)

**Mục tiêu**: Biết cách monitor và troubleshoot

```
✅ 1. Chạy monitor script
✅ 2. Xem logs từng service
✅ 3. Test API endpoints
✅ 4. Thử restart service
✅ 5. Đọc FAQ.md
```

**Practice**:

```bash
# Monitor
cd /opt/cnweb/deployment
./monitor.sh

# View logs
cd /opt/cnweb/backend
docker compose -f docker-compose.prod.yaml logs -f user-service

# Test APIs
curl http://YOUR_SERVER_IP:8080/actuator/health
curl http://YOUR_SERVER_IP:8081/actuator/health

# Restart
docker compose -f docker-compose.prod.yaml restart user-service
```

**Read**:

- 📖 [COMMANDS_REFERENCE.md](COMMANDS_REFERENCE.md)
- 📖 [FAQ.md](FAQ.md)

---

### Ngày 4: Deploy Version Mới (30 phút)

**Mục tiêu**: Tự tin deploy updates

```
✅ 1. Sửa code (ví dụ)
✅ 2. Test local (optional)
✅ 3. Commit & push
✅ 4. Tag new version
✅ 5. Monitor deployment
✅ 6. Verify changes
```

**Commands**:

```bash
# 1. Make changes
# Edit some code...

# 2. Test local (optional)
cd deployment
./test-local.bat  # Windows

# 3. Commit
git add .
git commit -m "Update user service logic"
git push origin be/test-deploy

# 4. Tag
git tag dev_24.10.2025_v1
git push origin dev_24.10.2025_v1

# 5. Monitor on GitHub Actions
# 6. Verify
curl http://YOUR_SERVER_IP:8081/actuator/health
```

---

### Ngày 5: Master Level (1 giờ)

**Mục tiêu**: Troubleshoot và optimize

```
✅ 1. Thử rollback
✅ 2. Check resources (RAM, CPU, Disk)
✅ 3. Optimize if needed
✅ 4. Setup monitoring alerts
✅ 5. Backup uploaded files
```

**Advanced**:

```bash
# Rollback
cd /opt/cnweb/deployment
./rollback.sh dev_23.10.2025_v1

# Resources
free -h
df -h
docker stats

# Backup
docker run --rm -v backend_user-uploads:/data \
  -v $(pwd):/backup ubuntu \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

## 🎓 Học Theo Vai Trò

### 👨‍💻 Developer

**Focus on**:

1. ARCHITECTURE.md - Hiểu service communication
2. COMMANDS_REFERENCE.md - Docker commands
3. FAQ.md - Development questions

**Tasks**:

- Deploy code changes
- Debug services
- Test APIs

---

### 🔧 DevOps/SysAdmin

**Focus on**:

1. deployment/README.md - Full setup
2. DEPLOYMENT_CHECKLIST.md - Operations
3. COMMANDS_REFERENCE.md - All commands

**Tasks**:

- Server management
- Monitoring
- Security
- Backups

---

### 📊 Project Manager

**Focus on**:

1. README.md - Overview
2. CICD_SUMMARY.md - Process
3. FAQ.md - Cost, roadmap

**Tasks**:

- Understand deployment process
- Monitor deployments
- Plan releases

---

## 🎯 Success Criteria

Bạn đã master khi có thể:

✅ Deploy version mới trong < 5 phút
✅ Troubleshoot service issues
✅ Rollback khi cần
✅ Monitor và optimize resources
✅ Giải thích architecture cho người khác

## 🆘 Cần Giúp Đỡ?

### 1️⃣ Đọc Tài Liệu Trước

- FAQ.md có thể trả lời 80% câu hỏi
- COMMANDS_REFERENCE.md có sẵn commands

### 2️⃣ Troubleshoot

```bash
# Run monitor
./deployment/monitor.sh

# Check logs
docker compose -f docker-compose.prod.yaml logs -f

# Check resources
free -h && df -h
```

### 3️⃣ Ask for Help

- Create GitHub Issue với:
  - Error message
  - Logs
  - Steps to reproduce

## 📅 Daily Workflow

### Mỗi Ngày

```bash
# 1. Check services
ssh your-username@your-server-ip
cd /opt/cnweb/deployment
./monitor.sh

# 2. Check logs for errors
cd /opt/cnweb/backend
docker compose -f docker-compose.prod.yaml logs --tail=100 | grep -i error
```

### Mỗi Tuần

```bash
# 1. Clean old images
docker image prune -a

# 2. Backup uploads
docker run --rm -v backend_user-uploads:/data \
  -v /backup:/backup ubuntu \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .

# 3. Check resources
free -h
df -h
```

### Khi Deploy

```bash
# 1. Code changes
git add . && git commit -m "message" && git push

# 2. Tag
git tag dev_$(date +%d.%m.%Y)_v1
git push origin dev_$(date +%d.%m.%Y)_v1

# 3. Monitor
# GitHub Actions + ./monitor.sh
```

## 🎊 You're Ready!

Bây giờ bạn đã có:

- ✅ Complete documentation
- ✅ Automated CI/CD pipeline
- ✅ Monitoring tools
- ✅ Troubleshooting guides
- ✅ Best practices

**Next Step**:
👉 [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)

---

**Happy Deploying!** 🚀

_Questions? Check [FAQ.md](FAQ.md) first!_
