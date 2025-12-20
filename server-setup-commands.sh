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

