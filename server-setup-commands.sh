# Các lệnh cần chạy trên server để kiểm tra và chuẩn bị

# 1. Kiểm tra cấu trúc thư mục hiện tại
cd /opt/cnweb2025_1_fe
ls -la
ls -la frontend/

# 2. Nếu chưa có code, clone repository
git clone https://github.com/ntabodoiqua/cnweb_20251.git /opt/cnweb2025_1_fe
cd /opt/cnweb2025_1_fe

# 3. Checkout đúng branch
git fetch --all
git checkout anhnt/fe-test-deploy
git pull origin anhnt/fe-test-deploy

# 4. Kiểm tra các file cần thiết có tồn tại không
ls -la frontend/Dockerfile
ls -la frontend/docker-compose.prod.yaml
ls -la frontend/nginx.conf

# 5. Kiểm tra Docker đang chạy
docker ps

# 6. Test login GitHub Container Registry (cần PAT token)
# echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u ntabodoiqua --password-stdin
