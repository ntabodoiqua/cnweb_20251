# ❓ Frequently Asked Questions (FAQ)

## 🚀 Deployment Questions

### Q: Tại sao cần common-dto, api-gateway và discovery-service?

**A:**

- **common-dto**: Là shared library chứa các DTO (Data Transfer Objects) dùng chung giữa các services. Nếu thiếu, các service khác sẽ build fail.
- **discovery-service (Eureka)**: Service registry để các microservices tìm thấy nhau. Nếu thiếu, services không communicate được.
- **api-gateway**: Entry point duy nhất cho client, routing requests đến đúng service. Nếu thiếu, client phải biết IP/port của từng service.

**Kết luận**: CẦN TẤT CẢ! ✅

---

### Q: Tại sao phải push tag mới deployment chạy?

**A:** Đây là best practice trong CI/CD:

- **Tags** đại diện cho releases/versions cụ thể
- Tránh deploy tự động mỗi commit (nguy hiểm)
- Dễ rollback về version cụ thể
- Track được version nào đang chạy trên production

**Tag format**: `dev_DD.MM.YYYY_vX`

- Example: `dev_23.10.2025_v1`, `dev_23.10.2025_v2`

---

### Q: Server 8GB RAM có đủ không?

**A:** ✅ Đủ cho 4 services hiện tại!

Resource allocation:

```
- Discovery Service:     ~512MB
- API Gateway:           ~512MB
- User Service:          ~1GB
- Notification Service:  ~512MB
- OS + Docker overhead:  ~1GB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Used:              ~3.5GB
Available:               ~4.5GB (cho future services)
```

**Tips**:

- Monitor với `docker stats`
- Thêm swap nếu cần
- Optimize JVM heap sizes nếu cần

---

### Q: Database có cần chạy trên Docker không?

**A:** ❌ KHÔNG! Và đã KHÔNG.

Bạn đã dùng external managed databases (best practice!):

- ✅ PostgreSQL trên DigitalOcean
- ✅ Redis trên DigitalOcean
- ✅ RabbitMQ trên CloudAMQP

**Lợi ích**:

- Managed backups
- High availability
- Professional monitoring
- Không chiếm RAM server
- Data safety khi container restart

---

### Q: Làm sao để rollback về version cũ?

**A:** Rất đơn giản!

```bash
# SSH vào server
ssh your-username@your-server-ip

# Chạy rollback script
cd /opt/cnweb/deployment
./rollback.sh dev_22.10.2025_v1
```

Hoặc manual:

```bash
cd /opt/cnweb/backend
export TAG=dev_22.10.2025_v1
docker compose -f docker-compose.prod.yaml pull
docker compose -f docker-compose.prod.yaml up -d
```

---

### Q: Thứ tự start services có quan trọng không?

**A:** ✅ CỰC KỲ QUAN TRỌNG!

**Thứ tự đúng**:

1. **Discovery Service** (phải healthy first)
2. **API Gateway** (depends on Discovery)
3. **User Service** (depends on Discovery)
4. **Notification Service** (depends on Discovery)

Docker Compose đã handle điều này với `depends_on` và `healthcheck`.

---

### Q: Credentials có bị lộ không khi commit?

**A:** ⚠️ HIỆN TẠI: Có risk!

Credentials đang hard-coded trong:

- `application.yaml` files
- `docker-compose.prod.yaml`

**Giải pháp**:

1. ✅ Đã có `.env.example` - không chứa credentials thật
2. ✅ Credentials thật nên stored trong GitHub Secrets
3. ❌ CẦN refactor để inject từ environment variables

**TODO**: Move credentials to `.env` file và inject vào containers.

---

## 🐛 Troubleshooting Questions

### Q: Service không start, phải làm gì?

**A:** Debug theo steps:

```bash
# 1. Check logs
docker compose -f docker-compose.prod.yaml logs service-name

# 2. Check container status
docker ps -a

# 3. Check health
curl http://localhost:8081/actuator/health

# 4. Check resources
free -h
df -h

# 5. Restart service
docker compose -f docker-compose.prod.yaml restart service-name
```

**Common issues**:

- Discovery Service chưa healthy → Wait thêm
- Out of memory → Check `docker stats`
- Port conflict → `netstat -tulpn | grep 8081`
- Database connection → Check network connectivity

---

### Q: Làm sao biết deployment thành công?

**A:** Kiểm tra 3 nơi:

**1. GitHub Actions** ✅

- Vào: `Actions` tab
- Workflow có dấu ✅ xanh
- Tất cả steps passed

**2. Server Health Checks** 🏥

```bash
curl http://YOUR_SERVER_IP:8761/actuator/health
curl http://YOUR_SERVER_IP:8080/actuator/health
curl http://YOUR_SERVER_IP:8081/actuator/health
curl http://YOUR_SERVER_IP:8084/actuator/health
```

**3. Eureka Dashboard** 📊

- Open: `http://YOUR_SERVER_IP:8761`
- Tất cả services đều registered
- Status: UP

---

### Q: Out of memory, phải làm gì?

**A:** Solutions:

**1. Add Swap** (Quick fix)

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**2. Reduce Memory Limits** (docker-compose.prod.yaml)

```yaml
services:
  user-service:
    deploy:
      resources:
        limits:
          memory: 512M
```

**3. Optimize JVM** (Dockerfile)

```dockerfile
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
```

---

### Q: Port đã được sử dụng, fix như thế nào?

**A:**

```bash
# 1. Tìm process đang dùng port
sudo netstat -tulpn | grep :8080

# 2. Kill process
sudo kill -9 <PID>

# 3. Hoặc change port trong docker-compose.prod.yaml
ports:
  - "8090:8080"  # Host:Container
```

---

### Q: Database connection failed, tại sao?

**A:** Check list:

```bash
# 1. Test connectivity từ server
telnet db-postgresql-sgp1-29269-do-user-23301452-0.k.db.ondigitalocean.com 25060

# 2. Check firewall
# DigitalOcean → Databases → Settings → Trusted Sources
# Add your server IP

# 3. Check credentials trong application.yaml
# Username, password, SSL settings

# 4. Check từ container
docker exec user-service ping db-postgresql-sgp1-29269-do-user-23301452-0.k.db.ondigitalocean.com
```

---

## 🔐 Security Questions

### Q: Có cần HTTPS không?

**A:** 🔴 HIGHLY RECOMMENDED cho production!

**Current**: HTTP only
**Should have**:

- Nginx reverse proxy với SSL/TLS
- Let's Encrypt certificates
- Force HTTPS redirect

**Quick setup**:

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Configure reverse proxy
# /etc/nginx/sites-available/cnweb
```

---

### Q: Làm sao secure GitHub Secrets?

**A:** Best practices:

✅ **DO**:

- Rotate credentials định kỳ
- Use separate credentials cho mỗi environment
- Minimal permissions
- Enable 2FA trên GitHub

❌ **DON'T**:

- Share secrets qua chat/email
- Commit secrets vào code
- Use production secrets cho development
- Hard-code passwords

---

### Q: Firewall đã đủ an toàn chưa?

**A:** Cần thêm:

**Current firewall**:

```bash
ufw allow 22    # SSH
ufw allow 8080  # Gateway
ufw allow 8081  # User Service
ufw allow 8084  # Notification
ufw allow 8761  # Discovery
```

**Recommended additions**:

- ✅ Fail2ban để prevent brute force
- ✅ Rate limiting trên Nginx
- ✅ Restrict SSH to specific IPs
- ✅ Setup VPN cho admin access

---

## 💰 Cost Questions

### Q: Chi phí vận hành như thế nào?

**A:** Breakdown:

**Server**: Ubuntu 22.04 (8GB/2CPU)

- DigitalOcean Droplet: ~$48/month
- Hoặc tự host: $0

**External Services**:

- PostgreSQL (DigitalOcean): ~$15/month (starter)
- Redis (DigitalOcean): ~$15/month (starter)
- RabbitMQ (CloudAMQP): $0-$19/month

**Total**: ~$48-97/month

**Free alternatives**:

- PostgreSQL: Railway.app, Supabase (free tier)
- Redis: Upstash, Redis Cloud (free tier)
- RabbitMQ: CloudAMQP free tier

---

## 🎓 Learning Questions

### Q: Tài liệu học thêm về Microservices?

**A:** Recommended resources:

**Books**:

- "Building Microservices" - Sam Newman
- "Spring Microservices in Action" - John Carnell

**Online**:

- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [Microservices.io](https://microservices.io/)
- [Docker Documentation](https://docs.docker.com/)

**Videos**:

- Spring Boot Microservices Tutorial - YouTube
- Docker Crash Course

---

### Q: Next steps để improve system?

**A:** Roadmap:

**Phase 1** (Current): ✅

- ✅ Basic microservices
- ✅ Docker deployment
- ✅ CI/CD pipeline

**Phase 2** (Recommend):

- [ ] Add monitoring (Prometheus + Grafana)
- [ ] Centralized logging (ELK Stack)
- [ ] Add caching layers
- [ ] API documentation (Swagger UI)

**Phase 3** (Advanced):

- [ ] Kubernetes deployment
- [ ] Service mesh (Istio)
- [ ] Distributed tracing (Zipkin)
- [ ] Auto-scaling

---

## 📞 Getting Help

**Issues?**

1. Check logs: `docker compose logs -f`
2. Run monitor: `./deployment/monitor.sh`
3. Read documentation in `/deployment/README.md`
4. Create GitHub issue với:
   - Error message
   - Logs
   - Steps to reproduce

**Resources**:

- 📖 [Deployment Guide](deployment/README.md)
- 📖 [Commands Reference](COMMANDS_REFERENCE.md)
- 📖 [Architecture Diagram](ARCHITECTURE.md)

---

**Last Updated**: October 23, 2025
**Version**: 1.0
