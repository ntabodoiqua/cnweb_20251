#!/bin/bash

###############################################################################
# Manual deployment script
# Use this for manual deployment or troubleshooting
###############################################################################

set -e

# Configuration
REPO_URL="https://github.com/ntabodoiqua/cnweb_20251.git"
DEPLOY_DIR="/opt/cnweb"
BRANCH="be/test-deploy"
TAG="${1:-latest}"

echo "=============================================="
echo "Starting manual deployment"
echo "Tag: $TAG"
echo "=============================================="

# Navigate to deployment directory
cd $DEPLOY_DIR || exit 1

# Pull latest changes
echo "📥 Pulling latest changes..."
git fetch --all --tags
git checkout $BRANCH
git pull origin $BRANCH

# Stop existing containers
echo "🛑 Stopping existing containers..."
cd backend
docker compose -f docker-compose.prod.yaml down

# Pull latest images
echo "📥 Pulling latest Docker images..."
export TAG=$TAG
docker compose -f docker-compose.prod.yaml pull

# Start containers
echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yaml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

check_health() {
    local service=$1
    local port=$2
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:$port/actuator/health > /dev/null; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service (attempt $attempt/$max_attempts)..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "❌ $service failed to start"
    return 1
}

check_health "Discovery Service" 8761
check_health "API Gateway" 8080
check_health "User Service" 8081
check_health "Notification Service" 8084

# Show running containers
echo ""
echo "=============================================="
echo "📊 Running containers:"
echo "=============================================="
docker compose -f docker-compose.prod.yaml ps

# Show logs
echo ""
echo "=============================================="
echo "📝 Recent logs:"
echo "=============================================="
docker compose -f docker-compose.prod.yaml logs --tail=20

echo ""
echo "=============================================="
echo "✅ Deployment completed successfully!"
echo "=============================================="
echo ""
echo "Access your services:"
echo "- Discovery Service: http://YOUR_SERVER_IP:8761"
echo "- API Gateway: http://YOUR_SERVER_IP:8080"
echo "- User Service: http://YOUR_SERVER_IP:8081"
echo "- Notification Service: http://YOUR_SERVER_IP:8084"
echo ""
