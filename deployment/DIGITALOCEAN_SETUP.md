# 🚀 Quick Setup for DigitalOcean Docker Droplet

> Dành cho server đã có Docker sẵn (DigitalOcean Docker on Ubuntu 22.04)

---

## ✅ Điều Kiện Tiên Quyết

Server của bạn đã có:

- ✅ Ubuntu 22.04
- ✅ Docker Engine
- ✅ Docker Compose

**Bạn chỉ cần làm thêm một vài bước!**

---

## 🚀 Quick Setup (10 phút)

### Bước 1: SSH vào Server

```bash
ssh root@YOUR_SERVER_IP
```

### Bước 2: Tạo User Non-root (Recommended)

```bash
# Tạo user mới (nếu chưa có)
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Switch sang user mới
su - deploy
```

### Bước 3: Cấu Hình Firewall

```bash
# Enable và cấu hình UFW
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 8080/tcp  # API Gateway
sudo ufw allow 8081/tcp  # User Service
sudo ufw allow 8084/tcp  # Notification Service
sudo ufw allow 8761/tcp  # Discovery Service
sudo ufw reload

# Verify
sudo ufw status
```

### Bước 4: Setup SSH Key cho GitHub

```bash
# Tạo SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Xem public key
cat ~/.ssh/id_ed25519.pub
```

**→ Copy public key và add vào GitHub:**

- Vào: https://github.com/settings/keys
- Click "New SSH key"
- Paste public key

### Bước 5: Clone Repository

```bash
# Tạo thư mục deployment
sudo mkdir -p /opt/cnweb
sudo chown -R $USER:$USER /opt/cnweb
cd /opt/cnweb

# Clone repo
git clone git@github.com:ntabodoiqua/cnweb_20251.git .

# Checkout branch
git checkout be/test-deploy

# Verify
ls -la
```

### Bước 6: Configure Docker Logging (Optional but Recommended)

```bash
# Tạo hoặc sửa /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json
```

Thêm nội dung:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker

# Verify
docker info | grep "Logging Driver"
```

### Bước 7: Setup GitHub Secrets

Vào: https://github.com/ntabodoiqua/cnweb_20251/settings/secrets/actions

**Thêm 4 secrets:**

| Name              | Value                        | How to get              |
| ----------------- | ---------------------------- | ----------------------- |
| `SSH_HOST`        | IP server của bạn            | DigitalOcean dashboard  |
| `SSH_USERNAME`    | `deploy` (hoặc user bạn tạo) | -                       |
| `SSH_PRIVATE_KEY` | Private SSH key              | `cat ~/.ssh/id_ed25519` |
| `SSH_PORT`        | `22`                         | -                       |

**Lấy Private Key:**

```bash
# Trên server
cat ~/.ssh/id_ed25519
```

Copy toàn bộ nội dung (bao gồm `-----BEGIN` và `-----END`)

### Bước 8: Test Docker

```bash
# Verify Docker hoạt động
docker --version
docker compose version
docker ps

# Test pull image
docker pull hello-world
docker run hello-world
```

---

## 🎯 Deploy Lần Đầu

### 1. Trên Local Machine

```bash
# Commit changes (nếu có)
git add .
git commit -m "Setup CI/CD for DigitalOcean Docker Droplet"
git push origin be/test-deploy

# Tạo và push tag
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1
```

### 2. Monitor Deployment

**GitHub Actions:**

- Vào: https://github.com/ntabodoiqua/cnweb_20251/actions
- Xem workflow đang chạy

**Trên Server:**

```bash
# SSH vào server
ssh deploy@YOUR_SERVER_IP

# Watch logs
cd /opt/cnweb/backend
docker compose -f docker-compose.prod.yaml logs -f
```

### 3. Verify Deployment

```bash
# Check containers
docker compose -f docker-compose.prod.yaml ps

# Health checks
curl http://localhost:8761/actuator/health  # Discovery
curl http://localhost:8080/actuator/health  # Gateway
curl http://localhost:8081/actuator/health  # User
curl http://localhost:8084/actuator/health  # Notification

# Check Eureka Dashboard
curl http://localhost:8761
```

---

## 🔍 Monitoring

```bash
# Quick monitor
cd /opt/cnweb/deployment
chmod +x monitor.sh
./monitor.sh

# View logs
docker compose -f /opt/cnweb/backend/docker-compose.prod.yaml logs -f

# Check resources
docker stats
free -h
df -h
```

---

## 📝 So Sánh: Setup Script vs Manual

| Task                   | Full Setup Script | DigitalOcean Docker Droplet |
| ---------------------- | ----------------- | --------------------------- |
| Install Docker         | ✅ Required       | ⏭️ Skip (đã có sẵn)         |
| Install Docker Compose | ✅ Required       | ⏭️ Skip (đã có sẵn)         |
| Configure Firewall     | ✅ Automated      | ✋ Manual (5 phút)          |
| Setup Logging          | ✅ Automated      | ✋ Optional (3 phút)        |
| Create Deployment Dir  | ✅ Automated      | ✋ Manual (1 phút)          |
| Clone Repo             | ❌ Manual         | ✋ Manual (2 phút)          |
| **Total Time**         | ~15-20 phút       | ~10 phút                    |

---

## ⚡ Optional: Bash Aliases

Thêm vào `~/.bashrc` để làm việc nhanh hơn:

```bash
# Edit .bashrc
nano ~/.bashrc

# Add these lines
alias dc='docker compose -f /opt/cnweb/backend/docker-compose.prod.yaml'
alias dcl='dc logs -f'
alias dcp='dc ps'
alias dcr='dc restart'
alias monitor='cd /opt/cnweb/deployment && ./monitor.sh'
alias cnweb='cd /opt/cnweb'

# Reload
source ~/.bashrc
```

Giờ bạn có thể dùng:

```bash
dc ps              # Thay vì docker compose -f ... ps
dcl                # View logs
monitor            # Run monitor script
cnweb              # cd to project
```

---

## 🔐 Security Checklist

Vì đây là DigitalOcean, thêm vài security steps:

### 1. Disable Root SSH Login (Recommended)

```bash
sudo nano /etc/ssh/sshd_config
```

Tìm và sửa:

```
PermitRootLogin no
PasswordAuthentication no
```

```bash
sudo systemctl restart sshd
```

### 2. Setup Fail2Ban

```bash
sudo apt update
sudo apt install -y fail2ban

sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### 3. Regular Updates

```bash
# Setup unattended upgrades
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🎯 Quick Commands

```bash
# Deploy new version
git tag dev_$(date +%d.%m.%Y)_v1 && git push origin dev_$(date +%d.%m.%Y)_v1

# Check services
curl -s http://localhost:8761/actuator/health | jq

# View logs with errors
dc logs | grep -i error

# Restart all services
dc restart

# Clean up
docker system prune -a
```

---

## ❓ Troubleshooting

### Port 80/443 cho Nginx (Optional)

Nếu muốn thêm Nginx reverse proxy:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/cnweb

# Enable site
sudo ln -s /etc/nginx/sites-available/cnweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL (nếu có domain)
sudo certbot --nginx -d your-domain.com
```

### Nếu Docker không start containers

```bash
# Check Docker service
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check logs
sudo journalctl -u docker -n 50 --no-pager
```

---

## 🎊 You're Done!

**Tóm tắt điểm khác:**

✅ **Skip**:

- Docker installation (đã có)
- Docker Compose installation (đã có)

✋ **Làm thêm**:

- Configure firewall (~5 phút)
- Setup SSH keys (~3 phút)
- Clone repository (~2 phút)

**Total**: ~10 phút thay vì 20 phút! 🚀

---

## 📚 Next Steps

1. ✅ Complete steps 1-8 above
2. ✅ Commit and push tag
3. ✅ Monitor deployment
4. ✅ Verify all services
5. ✅ Read [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for details

---

**Questions?** → [FAQ.md](FAQ.md)

**Need full guide?** → [deployment/README.md](deployment/README.md)

---

**Happy Deploying from DigitalOcean! 🌊🚀**
