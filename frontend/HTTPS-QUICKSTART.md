# Quick Start - HTTPS Setup

## Prerequisites

- ✅ Domain `nguyentheanh-nta.id.vn` đã trỏ về IP server
- ✅ Port 80 và 443 đã mở
- ✅ Docker và Docker Compose đã cài

## Quick Setup (3 bước)

### 1. Cập nhật email

Mở file `init-letsencrypt.ps1` và sửa dòng:

```powershell
$EMAIL = "your-email@example.com"  # ← Thay email của bạn
```

### 2. Chạy script lấy SSL certificate

```powershell
cd frontend
.\init-letsencrypt.ps1
```

### 3. Deploy ứng dụng

```powershell
.\deploy.ps1
```

## Xong! 🎉

Truy cập: **https://nguyentheanh-nta.id.vn**

---

## Các lệnh hữu ích

### Xem logs

```powershell
docker-compose -f docker-compose.prod.yaml logs -f
```

### Xem logs frontend

```powershell
docker logs cnweb-frontend -f
```

### Xem logs certbot

```powershell
docker logs cnweb-certbot -f
```

### Dừng ứng dụng

```powershell
docker-compose -f docker-compose.prod.yaml down
```

### Khởi động lại

```powershell
docker-compose -f docker-compose.prod.yaml restart
```

### Kiểm tra certificate

```powershell
docker exec cnweb-certbot certbot certificates
```

### Gia hạn certificate thủ công (không bắt buộc)

```powershell
docker exec cnweb-certbot certbot renew
```

---

## Troubleshooting

### Port 80 đang bị chiếm

```powershell
# Xem process nào đang dùng port 80
netstat -ano | findstr :80

# Dừng container đang chạy
docker stop <container-id>
```

### Certificate không hoạt động

1. Kiểm tra domain đã trỏ đúng IP:

   ```powershell
   nslookup nguyentheanh-nta.id.vn
   ```

2. Kiểm tra logs:

   ```powershell
   docker logs cnweb-certbot
   ```

3. Thử lại với staging mode (tránh rate limit):
   - Mở `init-letsencrypt.ps1`
   - Đổi `$STAGING = 0` thành `$STAGING = 1`
   - Chạy lại script

### Container không start

```powershell
# Xem logs chi tiết
docker-compose -f docker-compose.prod.yaml logs

# Rebuild image
docker-compose -f docker-compose.prod.yaml up -d --force-recreate
```

---

## Certificate Info

- **Issuer**: Let's Encrypt
- **Valid**: 90 days
- **Auto-renew**: Yes (every 12h)
- **Protocols**: TLS 1.2, TLS 1.3

---

## Security Features

✅ HTTPS with TLS 1.2/1.3  
✅ Auto HTTP → HTTPS redirect  
✅ HSTS enabled  
✅ Secure headers configured  
✅ Certificate auto-renewal

---

Xem hướng dẫn chi tiết: [SSL-SETUP-GUIDE.md](./SSL-SETUP-GUIDE.md)
