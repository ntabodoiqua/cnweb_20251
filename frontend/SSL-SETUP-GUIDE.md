# Hướng dẫn cấu hình HTTPS cho domain nguyentheanh-nta.id.vn

## Yêu cầu

1. Domain `nguyentheanh-nta.id.vn` đã được trỏ về địa chỉ IP của server
2. Port 80 và 443 đã được mở trên firewall
3. Docker và Docker Compose đã được cài đặt

## Các bước thực hiện

### Bước 1: Kiểm tra domain đã trỏ đúng IP chưa

Trên Windows PowerShell:

```powershell
nslookup nguyentheanh-nta.id.vn
```

Hoặc trên Linux/Mac:

```bash
dig nguyentheanh-nta.id.vn
```

Đảm bảo domain trả về đúng IP của server.

### Bước 2: Cập nhật email trong script

Mở file `init-letsencrypt.ps1` (Windows) hoặc `init-letsencrypt.sh` (Linux/Mac) và thay đổi:

```powershell
$EMAIL = "your-email@example.com"  # Thay bằng email thật của bạn
```

Email này sẽ được Let's Encrypt sử dụng để gửi thông báo về certificate (ví dụ: khi sắp hết hạn).

### Bước 3: Chạy script để lấy SSL certificate

#### Trên Windows (PowerShell):

```powershell
# Di chuyển đến thư mục frontend
cd frontend

# Chạy script (có thể cần quyền admin)
.\init-letsencrypt.ps1
```

#### Trên Linux/Mac:

```bash
# Di chuyển đến thư mục frontend
cd frontend

# Cấp quyền thực thi cho script
chmod +x init-letsencrypt.sh

# Chạy script
./init-letsencrypt.sh
```

### Bước 4: Cập nhật docker-compose.prod.yaml

Chỉnh sửa file `docker-compose.prod.yaml` để mount đúng thư mục certbot:

```yaml
volumes:
  - ./certbot/conf:/etc/letsencrypt
  - ./certbot/var:/var/lib/letsencrypt
  - ./certbot/www:/var/www/certbot
```

### Bước 5: Khởi động ứng dụng

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

### Bước 6: Kiểm tra

Truy cập vào:

- `https://nguyentheanh-nta.id.vn` - Nên thấy trang web với HTTPS
- `http://nguyentheanh-nta.id.vn` - Nên tự động redirect sang HTTPS

## Tự động gia hạn SSL Certificate

Certificate từ Let's Encrypt có hiệu lực 90 ngày. Container `certbot` đã được cấu hình để tự động gia hạn certificate mỗi 12 giờ.

## Troubleshooting

### Lỗi: Cannot connect to port 80

- Đảm bảo không có service nào đang chạy trên port 80
- Kiểm tra firewall đã mở port 80 chưa

### Lỗi: Domain validation failed

- Kiểm tra domain đã trỏ đúng IP chưa
- Đảm bảo server có thể truy cập từ internet
- Thử với staging mode trước (set `$STAGING = 1`)

### Lỗi: Rate limit exceeded

Let's Encrypt có giới hạn số lần request. Nếu gặp lỗi này:

- Đợi 1 tuần để giới hạn được reset
- Hoặc sử dụng staging mode để test

## Cấu trúc thư mục

```
frontend/
├── certbot/
│   ├── conf/           # SSL certificates
│   ├── www/            # ACME challenge files
│   └── var/            # Certbot working directory
├── docker-compose.prod.yaml
├── nginx.conf
├── Dockerfile
├── init-letsencrypt.ps1  # Windows script
└── init-letsencrypt.sh   # Linux/Mac script
```

## Thông tin SSL Certificate

- **Issuer**: Let's Encrypt
- **Validity**: 90 days
- **Auto-renewal**: Yes (every 12 hours check)
- **Protocols**: TLS 1.2, TLS 1.3
- **HSTS**: Enabled (max-age=31536000)

## Các tính năng bảo mật đã được cấu hình

1. ✅ HTTPS với TLS 1.2/1.3
2. ✅ Tự động redirect HTTP → HTTPS
3. ✅ HSTS (HTTP Strict Transport Security)
4. ✅ X-Frame-Options
5. ✅ X-Content-Type-Options
6. ✅ XSS Protection
7. ✅ Secure cipher suites

## Lưu ý quan trọng

1. **Backup certificates**: Nên backup thư mục `certbot/conf` định kỳ
2. **Email notifications**: Đảm bảo email trong script là email thật để nhận thông báo
3. **Testing first**: Nên test với staging mode trước (`$STAGING = 1`) để tránh rate limit
4. **Firewall**: Đảm bảo port 80 và 443 đã được mở
