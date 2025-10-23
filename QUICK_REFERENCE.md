# 📋 CI/CD Quick Reference Card

> Print this for your desk! 🖨️

---

## 🚀 DEPLOY NEW VERSION

```bash
# 1. Code & Commit
git add .
git commit -m "Your changes"
git push origin be/test-deploy

# 2. Tag & Deploy
git tag dev_DD.MM.YYYY_vX
git push origin dev_DD.MM.YYYY_vX

# 3. Monitor
# GitHub: Actions tab
# Server: ./deployment/monitor.sh
```

---

## 🏥 HEALTH CHECKS

```bash
# Quick check all services
curl http://SERVER_IP:8761/actuator/health  # Discovery
curl http://SERVER_IP:8080/actuator/health  # Gateway
curl http://SERVER_IP:8081/actuator/health  # User
curl http://SERVER_IP:8084/actuator/health  # Notification

# Eureka Dashboard
http://SERVER_IP:8761
```

---

## 📊 MONITORING

```bash
# All-in-one monitor
./deployment/monitor.sh

# View logs
docker compose -f docker-compose.prod.yaml logs -f

# Service logs
docker compose -f docker-compose.prod.yaml logs user-service

# Resources
docker stats
free -h
df -h
```

---

## 🔄 ROLLBACK

```bash
cd /opt/cnweb/deployment
./rollback.sh dev_PREVIOUS_VERSION
```

---

## 🛠️ COMMON COMMANDS

```bash
# Container management
docker compose -f docker-compose.prod.yaml ps
docker compose -f docker-compose.prod.yaml restart
docker compose -f docker-compose.prod.yaml down
docker compose -f docker-compose.prod.yaml up -d

# Restart specific service
docker compose -f docker-compose.prod.yaml restart user-service

# Clean up
docker image prune -a
docker system prune
```

---

## 🐛 TROUBLESHOOTING

```bash
# Find errors in logs
docker compose logs | grep -i error

# Check resources
free -h && df -h

# Check port usage
netstat -tulpn | grep 8081

# Access container
docker exec -it user-service /bin/sh

# Test connectivity
curl -v http://localhost:8081/actuator/health
```

---

## 📁 FILE LOCATIONS

```
Server Deployment: /opt/cnweb/
Scripts: /opt/cnweb/deployment/
Docker Compose: /opt/cnweb/backend/docker-compose.prod.yaml
Logs: docker compose logs
```

---

## 🔑 GITHUB SECRETS

```
SSH_HOST          = Server IP
SSH_USERNAME      = SSH user
SSH_PRIVATE_KEY   = ~/.ssh/id_ed25519 content
SSH_PORT          = 22
```

---

## 🌐 SERVICES & PORTS

```
Discovery Service    :8761  (Eureka)
API Gateway          :8080  (Entry point)
User Service         :8081  (Main service)
Notification Service :8084  (Email)
```

---

## 📞 QUICK HELP

```
FAQ:               FAQ.md
All Commands:      COMMANDS_REFERENCE.md
Quick Deploy:      DEPLOYMENT_QUICKSTART.md
Full Guide:        deployment/README.md
Architecture:      ARCHITECTURE.md
```

---

## ⚡ ALIASES (Add to ~/.bashrc)

```bash
alias dc='docker compose -f /opt/cnweb/backend/docker-compose.prod.yaml'
alias dcl='dc logs -f'
alias dcp='dc ps'
alias dcr='dc restart'
alias monitor='cd /opt/cnweb/deployment && ./monitor.sh'
```

---

## 🎯 DAILY CHECKLIST

```
□ Check services running: ./monitor.sh
□ Check logs for errors
□ Check disk space: df -h
□ Check memory: free -h
```

---

## 📅 WEEKLY TASKS

```
□ Clean old images: docker image prune -a
□ Backup uploads: See COMMANDS_REFERENCE.md
□ Update system: sudo apt update && sudo apt upgrade
□ Review logs
```

---

## 🆘 EMERGENCY CONTACTS

```
1. Check FAQ.md
2. Run ./monitor.sh
3. Check logs
4. Create GitHub issue
```

---

**Version**: 1.0 | **Date**: Oct 23, 2025
**Project**: cnweb_20251

---

© HUST 2025 | Keep this card handy! 📌
