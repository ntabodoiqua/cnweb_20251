#!/bin/bash

###############################################################################
# Script to setup Ubuntu 22.04 server for Docker deployment
# This script should be run as root or with sudo
###############################################################################

set -e

echo "=============================================="
echo "Starting server setup for Docker deployment"
echo "=============================================="

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    net-tools \
    htop

# Install Docker
echo "🐳 Installing Docker..."
# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc || true

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add current user to docker group (if not root)
if [ "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    echo "✅ Added $SUDO_USER to docker group"
fi

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 8080/tcp  # API Gateway
ufw allow 8081/tcp  # User Service
ufw allow 8084/tcp  # Notification Service
ufw allow 8761/tcp  # Discovery Service
ufw reload

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p /opt/cnweb
cd /opt/cnweb

# Clone repository (you'll need to set this up)
echo "📥 Note: You need to clone your repository manually:"
echo "cd /opt/cnweb"
echo "git clone https://github.com/ntabodoiqua/cnweb_20251.git ."
echo "git checkout be/test-deploy"

# Set up Docker log rotation
echo "📝 Setting up Docker log rotation..."
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker to apply changes
systemctl restart docker

# Display Docker info
echo ""
echo "=============================================="
echo "✅ Server setup complete!"
echo "=============================================="
echo ""
docker --version
docker compose version
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/cnweb"
echo "2. Set up GitHub secrets in your repository:"
echo "   - SSH_HOST: Your server IP"
echo "   - SSH_USERNAME: Your SSH username"
echo "   - SSH_PRIVATE_KEY: Your SSH private key"
echo "   - SSH_PORT: SSH port (default: 22)"
echo "3. Push a tag to trigger deployment: git tag dev_23.10.2025_v1 && git push origin dev_23.10.2025_v1"
echo ""
echo "Server resources:"
free -h
echo ""
df -h
echo ""
echo "=============================================="
