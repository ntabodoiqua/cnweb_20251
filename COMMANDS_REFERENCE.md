# 🛠️ CI/CD Commands Reference

## 📦 Git & Deployment Commands

### Deploy New Version

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"
git push origin be/test-deploy

# 2. Create and push tag (triggers deployment)
git tag dev_23.10.2025_v1
git push origin dev_23.10.2025_v1

# 3. Alternative: Force update tag (if needed)
git tag -f dev_23.10.2025_v1
git push -f origin dev_23.10.2025_v1
```

### List All Tags

```bash
# Local tags
git tag -l

# Remote tags
git ls-remote --tags origin
```

### Delete Tag

```bash
# Delete local tag
git tag -d dev_23.10.2025_v1

# Delete remote tag
git push origin :refs/tags/dev_23.10.2025_v1
```

## 🐳 Docker Commands

### Container Management

```bash
# List all containers
docker ps -a

# List running containers
docker ps

# Start all services
docker compose -f docker-compose.prod.yaml up -d

# Stop all services
docker compose -f docker-compose.prod.yaml down

# Restart all services
docker compose -f docker-compose.prod.yaml restart

# Restart specific service
docker compose -f docker-compose.prod.yaml restart user-service
```

### Logs

```bash
# View all logs
docker compose -f docker-compose.prod.yaml logs

# Follow logs (real-time)
docker compose -f docker-compose.prod.yaml logs -f

# Logs for specific service
docker compose -f docker-compose.prod.yaml logs user-service

# Last 100 lines
docker compose -f docker-compose.prod.yaml logs --tail=100

# Follow logs for specific service
docker compose -f docker-compose.prod.yaml logs -f notification-service
```

### Images

```bash
# List images
docker images

# Pull latest images
TAG=dev_23.10.2025_v1 docker compose -f docker-compose.prod.yaml pull

# Remove unused images
docker image prune -a

# Remove specific image
docker rmi <image-id>
```

### Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect backend_user-uploads

# Backup volume
docker run --rm -v backend_user-uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore volume
docker run --rm -v backend_user-uploads:/data -v $(pwd):/backup ubuntu tar xzf /backup/uploads-backup-20251023.tar.gz -C /data
```

### Resource Usage

```bash
# All containers stats
docker stats

# Specific container stats
docker stats user-service

# No streaming (one-time)
docker stats --no-stream
```

## 🔍 Health & Monitoring

### Health Checks

```bash
# Discovery Service
curl http://localhost:8761/actuator/health

# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8081/actuator/health

# Notification Service
curl http://localhost:8084/actuator/health

# Pretty print JSON
curl http://localhost:8081/actuator/health | jq
```

### Service Info

```bash
# Actuator endpoints
curl http://localhost:8081/actuator
curl http://localhost:8081/actuator/info
curl http://localhost:8081/actuator/metrics
curl http://localhost:8081/actuator/env
```

### Network

```bash
# List networks
docker network ls

# Inspect network
docker network inspect backend_microservices-network

# Check port usage
netstat -tulpn | grep 8080
netstat -tulpn | grep 8081
netstat -tulpn | grep 8084
netstat -tulpn | grep 8761

# Test connectivity
telnet localhost 8080
curl -v http://localhost:8080
```

## 🖥️ System Commands

### Resource Monitoring

```bash
# Memory
free -h

# Disk
df -h

# CPU
top
htop

# Uptime and load
uptime

# Process list
ps aux | grep java
```

### Service Management

```bash
# Docker service
systemctl status docker
systemctl start docker
systemctl stop docker
systemctl restart docker

# Enable on boot
systemctl enable docker
```

### Firewall

```bash
# UFW status
sudo ufw status

# Allow port
sudo ufw allow 8080/tcp

# Delete rule
sudo ufw delete allow 8080/tcp

# Reload
sudo ufw reload
```

## 📋 Deployment Scripts

### Server Setup (One-time)

```bash
cd /opt/cnweb/deployment
sudo ./setup-server.sh
```

### Manual Deploy

```bash
cd /opt/cnweb/deployment
./deploy.sh dev_23.10.2025_v1
```

### Monitor Services

```bash
cd /opt/cnweb/deployment
./monitor.sh
```

### Rollback

```bash
cd /opt/cnweb/deployment
./rollback.sh dev_22.10.2025_v1
```

### Local Testing (Windows)

```powershell
cd deployment
.\test-local.bat
```

### Local Testing (Linux/Mac)

```bash
cd deployment
chmod +x test-local.sh
./test-local.sh
```

## 🔧 Troubleshooting Commands

### Clean Everything

```bash
# Stop all containers
docker compose -f docker-compose.prod.yaml down

# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -q)

# Remove all volumes (CAREFUL!)
docker volume prune

# Remove all networks
docker network prune

# Full system clean (CAREFUL!)
docker system prune -a --volumes
```

### Rebuild Service

```bash
# Rebuild specific service
docker compose -f docker-compose.prod.yaml up -d --build user-service

# Rebuild all
docker compose -f docker-compose.prod.yaml up -d --build
```

### Shell Access

```bash
# Access container shell
docker exec -it user-service /bin/sh

# As root
docker exec -it -u root user-service /bin/sh

# Run command in container
docker exec user-service ls -la /app
```

### Debug Network

```bash
# Test connectivity between containers
docker exec user-service ping discovery-service
docker exec user-service curl http://discovery-service:8761/actuator/health

# Check DNS resolution
docker exec user-service nslookup discovery-service
```

### Check Database Connection

```bash
# From server
telnet db-postgresql-sgp1-29269-do-user-23301452-0.k.db.ondigitalocean.com 25060

# From container
docker exec user-service telnet db-postgresql-sgp1-29269-do-user-23301452-0.k.db.ondigitalocean.com 25060
```

## 📊 Useful Queries

### Find Errors in Logs

```bash
# Last 100 errors
docker compose -f docker-compose.prod.yaml logs --tail=100 | grep -i error

# Errors with context
docker compose -f docker-compose.prod.yaml logs | grep -B 2 -A 2 -i error

# Exceptions
docker compose -f docker-compose.prod.yaml logs | grep -i exception
```

### Filter Logs by Service

```bash
# User service only
docker compose -f docker-compose.prod.yaml logs user-service | grep -i error

# Multiple services
docker compose -f docker-compose.prod.yaml logs user-service notification-service
```

### Monitor Logs

```bash
# Follow all logs with grep filter
docker compose -f docker-compose.prod.yaml logs -f | grep -i "error\|warn\|exception"

# Follow specific service
docker compose -f docker-compose.prod.yaml logs -f user-service | grep -i error
```

## 🚀 Quick Deploy Workflow

### Standard Deploy

```bash
# 1. Test locally (optional)
cd deployment && ./test-local.bat

# 2. Commit & push
git add . && git commit -m "Your changes" && git push origin be/test-deploy

# 3. Tag & deploy
git tag dev_$(date +%d.%m.%Y)_v1 && git push origin dev_$(date +%d.%m.%Y)_v1

# 4. Monitor
watch -n 5 'curl -s http://YOUR_SERVER_IP:8081/actuator/health | jq'
```

### Emergency Rollback

```bash
# SSH to server
ssh your-username@your-server-ip

# Quick rollback
cd /opt/cnweb/deployment && ./rollback.sh dev_22.10.2025_v1
```

### Quick Status Check

```bash
# One-liner health check
for port in 8761 8080 8081 8084; do echo "Port $port:"; curl -s http://localhost:$port/actuator/health | jq -r '.status'; done
```

## 💡 Pro Tips

### Aliases (Add to ~/.bashrc)

```bash
alias dc='docker compose -f /opt/cnweb/backend/docker-compose.prod.yaml'
alias dcl='dc logs -f'
alias dcp='dc ps'
alias dcr='dc restart'
alias dclog='dc logs --tail=100'
alias monitor='cd /opt/cnweb/deployment && ./monitor.sh'
```

### Watch Commands

```bash
# Watch container status
watch -n 2 'docker compose -f docker-compose.prod.yaml ps'

# Watch resources
watch -n 5 'docker stats --no-stream'

# Watch logs
watch -n 1 'docker compose -f docker-compose.prod.yaml logs --tail=20'
```

---

**Quick Reference Card**: Print this and keep near your desk! 🖨️
