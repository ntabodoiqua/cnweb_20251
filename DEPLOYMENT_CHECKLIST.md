# ✅ CI/CD Deployment Checklist

## 📋 Pre-Deployment Checklist

### 🖥️ Server Setup

- [ ] Server Ubuntu 22.04 đã được cài đặt
- [ ] RAM: 8GB available
- [ ] CPU: 2 Intel cores
- [ ] Disk: 40GB+ free space
- [ ] Server có public IP
- [ ] Có quyền SSH access vào server

### 🔐 Security & Access

- [ ] SSH key đã được tạo trên server
- [ ] Public SSH key đã add vào GitHub account
- [ ] Firewall đã được cấu hình (ports: 22, 8080, 8081, 8084, 8761)
- [ ] Server security groups/firewall rules đã mở đúng ports

### 🐳 Docker Setup

- [ ] Docker Engine đã được cài đặt trên server
- [ ] Docker Compose Plugin đã được cài đặt
- [ ] Docker service đang chạy: `systemctl status docker`
- [ ] User có quyền chạy docker: `docker ps` không cần sudo

### 🗂️ Repository Setup

- [ ] Repository đã được clone vào `/opt/cnweb`
- [ ] Branch `be/test-deploy` đã checkout
- [ ] Git remote đã được cấu hình đúng
- [ ] Có quyền push code lên GitHub

### 🔑 GitHub Secrets

- [ ] `SSH_HOST` - IP address của server
- [ ] `SSH_USERNAME` - SSH username (vd: ubuntu, root)
- [ ] `SSH_PRIVATE_KEY` - Private key từ `~/.ssh/id_ed25519`
- [ ] `SSH_PORT` - SSH port (mặc định: 22)

### 🗄️ External Services

- [ ] PostgreSQL database accessible từ server
  - Test: `telnet db-postgresql-sgp1-29269-do-user-23301452-0.k.db.ondigitalocean.com 25060`
- [ ] Redis/Valkey accessible từ server
  - Test: `telnet db-valkey-sgp1-50141-do-user-27848320-0.k.db.ondigitalocean.com 25061`
- [ ] RabbitMQ (CloudAMQP) accessible
  - Test: `curl -v amqps://fuji.lmq.cloudamqp.com`
- [ ] Gmail SMTP cho email service
  - Username: noreply.innolearn@gmail.com
  - App password configured

### 📄 Files Created

- [ ] `backend/discovery-service/Dockerfile`
- [ ] `backend/api-gateway/Dockerfile`
- [ ] `backend/user-service/Dockerfile`
- [ ] `backend/notification-service/Dockerfile`
- [ ] `backend/docker-compose.prod.yaml`
- [ ] `.github/workflows/deploy.yml`
- [ ] `deployment/setup-server.sh`
- [ ] `deployment/deploy.sh`
- [ ] `deployment/rollback.sh`
- [ ] `deployment/monitor.sh`

## 🚀 Deployment Checklist

### First-Time Deployment

- [ ] 1. Commit tất cả files vào Git

  ```bash
  git add .
  git commit -m "Add CI/CD pipeline"
  git push origin be/test-deploy
  ```

- [ ] 2. Tạo và push tag

  ```bash
  git tag dev_23.10.2025_v1
  git push origin dev_23.10.2025_v1
  ```

- [ ] 3. Kiểm tra GitHub Actions

  - Vào: https://github.com/ntabodoiqua/cnweb_20251/actions
  - Workflow "CI/CD Pipeline - Deploy to Production" đang chạy
  - Tất cả steps màu xanh (✅)

- [ ] 4. Verify deployment trên server

  ```bash
  ssh your-username@your-server-ip
  cd /opt/cnweb/backend
  docker compose -f docker-compose.prod.yaml ps
  ```

- [ ] 5. Health checks
  ```bash
  curl http://YOUR_SERVER_IP:8761/actuator/health
  curl http://YOUR_SERVER_IP:8080/actuator/health
  curl http://YOUR_SERVER_IP:8081/actuator/health
  curl http://YOUR_SERVER_IP:8084/actuator/health
  ```

### Subsequent Deployments

- [ ] 1. Sửa code
- [ ] 2. Test local (optional)
  ```bash
  cd deployment
  ./test-local.bat  # Windows
  # hoặc
  ./test-local.sh   # Linux/Mac
  ```
- [ ] 3. Commit và push
  ```bash
  git add .
  git commit -m "Your changes"
  git push origin be/test-deploy
  ```
- [ ] 4. Tag với version mới
  ```bash
  git tag dev_24.10.2025_v1
  git push origin dev_24.10.2025_v1
  ```
- [ ] 5. Monitor deployment trên GitHub Actions
- [ ] 6. Verify services are running

## 🔍 Post-Deployment Verification

### Service Accessibility

- [ ] Discovery Service UI accessible: http://YOUR_SERVER_IP:8761
- [ ] All services registered in Eureka
- [ ] API Gateway responding: http://YOUR_SERVER_IP:8080
- [ ] User Service API accessible via Gateway
- [ ] Notification Service registered and healthy

### Logs Check

- [ ] No ERROR logs in discovery-service
- [ ] No ERROR logs in api-gateway
- [ ] No ERROR logs in user-service
- [ ] No ERROR logs in notification-service
- [ ] No connection errors to external services (DB, Redis, RabbitMQ)

### Functionality Tests

- [ ] User registration works
- [ ] User login works
- [ ] Email notifications are sent
- [ ] File upload works (user-service)
- [ ] Database connections stable
- [ ] Redis caching works
- [ ] RabbitMQ messages processing

### Performance Check

- [ ] Server memory usage < 80%: `free -h`
- [ ] Server disk usage < 80%: `df -h`
- [ ] Container memory within limits: `docker stats`
- [ ] Response times acceptable
- [ ] No memory leaks

## 🔧 Troubleshooting Checklist

### If Deployment Fails

- [ ] Check GitHub Actions logs
- [ ] Check SSH connection: `ssh -v your-username@your-server-ip`
- [ ] Check Docker logs: `docker compose logs`
- [ ] Check server resources: `free -h && df -h`
- [ ] Check network connectivity to external services
- [ ] Try manual deployment: `./deployment/deploy.sh`

### If Service Doesn't Start

- [ ] Check service logs: `docker logs <container-name>`
- [ ] Check environment variables in docker-compose.prod.yaml
- [ ] Check port conflicts: `netstat -tulpn | grep <port>`
- [ ] Check dependencies (Discovery Service must start first)
- [ ] Check external service connectivity

### If Out of Memory

- [ ] Check memory usage: `free -h`
- [ ] Check container limits in docker-compose.prod.yaml
- [ ] Consider adding swap: See deployment/README.md
- [ ] Stop unnecessary services
- [ ] Clean up old images: `docker image prune -a`

## 📊 Monitoring Checklist (Daily/Weekly)

### Daily

- [ ] Check all services are running: `./deployment/monitor.sh`
- [ ] Check for errors in logs
- [ ] Check disk space
- [ ] Check memory usage

### Weekly

- [ ] Review and clean old Docker images
- [ ] Check for security updates: `sudo apt update && sudo apt upgrade`
- [ ] Review application logs for patterns
- [ ] Backup uploaded files (user-uploads volume)

## 🎯 Success Criteria

✅ All services running
✅ All health checks passing
✅ No errors in logs
✅ Response times < 2s
✅ Memory usage < 80%
✅ All APIs accessible
✅ External services connected

---

**Last Updated**: October 23, 2025
**Deployment Version**: dev_23.10.2025_v1
