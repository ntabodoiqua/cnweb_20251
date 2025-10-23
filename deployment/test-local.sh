#!/bin/bash

###############################################################################
# Local testing script
# Test Docker build locally before pushing to production
###############################################################################

set -e

echo "=============================================="
echo "🧪 Testing Docker Build Locally"
echo "=============================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build all services
echo "📦 Building services..."
echo ""

echo "1️⃣ Building Discovery Service..."
docker build -f discovery-service/Dockerfile -t cnweb-discovery-service:test . || exit 1
echo "✅ Discovery Service built successfully"
echo ""

echo "2️⃣ Building API Gateway..."
docker build -f api-gateway/Dockerfile -t cnweb-api-gateway:test . || exit 1
echo "✅ API Gateway built successfully"
echo ""

echo "3️⃣ Building User Service..."
docker build -f user-service/Dockerfile -t cnweb-user-service:test . || exit 1
echo "✅ User Service built successfully"
echo ""

echo "4️⃣ Building Notification Service..."
docker build -f notification-service/Dockerfile -t cnweb-notification-service:test . || exit 1
echo "✅ Notification Service built successfully"
echo ""

echo "=============================================="
echo "✅ All services built successfully!"
echo "=============================================="
echo ""

# List built images
echo "📋 Built images:"
docker images | grep cnweb-
echo ""

# Ask if user wants to test run
read -p "Do you want to test run the services? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting services..."
    
    # Use docker-compose with test images
    TAG=test docker compose -f docker-compose.prod.yaml up -d
    
    echo ""
    echo "⏳ Waiting for services to start (60 seconds)..."
    sleep 60
    
    echo ""
    echo "🏥 Checking service health..."
    
    # Check each service
    if curl -f -s http://localhost:8761/actuator/health > /dev/null; then
        echo "✅ Discovery Service is healthy"
    else
        echo "❌ Discovery Service is not healthy"
    fi
    
    if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
        echo "✅ API Gateway is healthy"
    else
        echo "❌ API Gateway is not healthy"
    fi
    
    if curl -f -s http://localhost:8081/actuator/health > /dev/null; then
        echo "✅ User Service is healthy"
    else
        echo "❌ User Service is not healthy"
    fi
    
    if curl -f -s http://localhost:8084/actuator/health > /dev/null; then
        echo "✅ Notification Service is healthy"
    else
        echo "❌ Notification Service is not healthy"
    fi
    
    echo ""
    echo "📊 Running containers:"
    docker compose -f docker-compose.prod.yaml ps
    
    echo ""
    echo "📝 To view logs: docker compose -f docker-compose.prod.yaml logs -f"
    echo "🛑 To stop: docker compose -f docker-compose.prod.yaml down"
fi

echo ""
echo "=============================================="
echo "✅ Local testing completed!"
echo "=============================================="
