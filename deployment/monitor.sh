#!/bin/bash

###############################################################################
# Monitoring script
# Use this to monitor your deployed services
###############################################################################

DEPLOY_DIR="/opt/cnweb/backend"

echo "=============================================="
echo "🔍 Microservices Monitoring Dashboard"
echo "=============================================="
echo ""

# Function to check service health
check_service() {
    local name=$1
    local port=$2
    
    if curl -f -s http://localhost:$port/actuator/health > /dev/null 2>&1; then
        echo "✅ $name (Port $port): HEALTHY"
    else
        echo "❌ $name (Port $port): UNHEALTHY"
    fi
}

# Check all services
echo "📊 Service Health Status:"
echo "------------------------------------"
check_service "Discovery Service" 8761
check_service "API Gateway      " 8080
check_service "User Service     " 8081
check_service "Notification Svc " 8084
echo ""

# Show container status
echo "🐳 Docker Container Status:"
echo "------------------------------------"
cd $DEPLOY_DIR
docker compose -f docker-compose.prod.yaml ps
echo ""

# Show resource usage
echo "💻 System Resource Usage:"
echo "------------------------------------"
echo "Memory:"
free -h
echo ""
echo "Disk:"
df -h / | tail -1
echo ""
echo "CPU Load:"
uptime
echo ""

# Show container resource usage
echo "📈 Container Resource Usage:"
echo "------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

# Show recent logs
echo "📝 Recent Errors (last 50 lines):"
echo "------------------------------------"
docker compose -f docker-compose.prod.yaml logs --tail=50 | grep -i "error\|exception\|failed" || echo "No recent errors found"
echo ""

# Network connections
echo "🌐 Network Connections:"
echo "------------------------------------"
netstat -tuln | grep -E "8080|8081|8084|8761" || echo "No active connections"
echo ""

echo "=============================================="
echo "For live logs, use:"
echo "  docker compose -f $DEPLOY_DIR/docker-compose.prod.yaml logs -f [service-name]"
echo ""
echo "To restart a service:"
echo "  docker compose -f $DEPLOY_DIR/docker-compose.prod.yaml restart [service-name]"
echo "=============================================="
