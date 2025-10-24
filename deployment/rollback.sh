#!/bin/bash

###############################################################################
# Rollback script
# Use this to rollback to a previous version
###############################################################################

set -e

# Configuration
DEPLOY_DIR="/opt/cnweb"
PREVIOUS_TAG="${1}"

if [ -z "$PREVIOUS_TAG" ]; then
    echo "Usage: ./rollback.sh <previous_tag>"
    echo "Example: ./rollback.sh dev_22.10.2025_v1"
    exit 1
fi

echo "=============================================="
echo "Starting rollback to tag: $PREVIOUS_TAG"
echo "=============================================="

# Navigate to deployment directory
cd $DEPLOY_DIR/backend || exit 1

# Stop current containers
echo "🛑 Stopping current containers..."
docker compose -f docker-compose.prod.yaml down

# Pull previous version images
echo "📥 Pulling previous version images..."
export TAG=$PREVIOUS_TAG
docker compose -f docker-compose.prod.yaml pull

# Start containers with previous version
echo "🚀 Starting containers with previous version..."
docker compose -f docker-compose.prod.yaml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
curl -f http://localhost:8761/actuator/health && echo "✅ Discovery Service is healthy"
curl -f http://localhost:8080/actuator/health && echo "✅ API Gateway is healthy"
curl -f http://localhost:8081/actuator/health && echo "✅ User Service is healthy"
curl -f http://localhost:8084/actuator/health && echo "✅ Notification Service is healthy"

echo ""
echo "=============================================="
echo "✅ Rollback completed successfully!"
echo "=============================================="
docker compose -f docker-compose.prod.yaml ps
