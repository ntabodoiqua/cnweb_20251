@echo off
REM Windows batch script for local testing
REM PowerShell version for Windows users

echo ==============================================
echo 🧪 Testing Docker Build Locally (Windows)
echo ==============================================
echo.

cd /d "%~dp0..\backend"

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Build all services
echo 📦 Building services...
echo.

echo 1️⃣ Building Discovery Service...
docker build -f discovery-service/Dockerfile -t cnweb-discovery-service:test . || exit /b 1
echo ✅ Discovery Service built successfully
echo.

echo 2️⃣ Building API Gateway...
docker build -f api-gateway/Dockerfile -t cnweb-api-gateway:test . || exit /b 1
echo ✅ API Gateway built successfully
echo.

echo 3️⃣ Building User Service...
docker build -f user-service/Dockerfile -t cnweb-user-service:test . || exit /b 1
echo ✅ User Service built successfully
echo.

echo 4️⃣ Building Notification Service...
docker build -f notification-service/Dockerfile -t cnweb-notification-service:test . || exit /b 1
echo ✅ Notification Service built successfully
echo.

echo ==============================================
echo ✅ All services built successfully!
echo ==============================================
echo.

echo 📋 Built images:
docker images | findstr cnweb-
echo.

set /p answer="Do you want to test run the services? (y/n): "
if /i "%answer%"=="y" (
    echo.
    echo 🚀 Starting services...
    
    set TAG=test
    docker compose -f docker-compose.prod.yaml up -d
    
    echo.
    echo ⏳ Waiting for services to start 60 seconds...
    timeout /t 60 /nobreak
    
    echo.
    echo 🏥 Checking service health...
    
    curl -f -s http://localhost:8761/actuator/health >nul 2>&1 && (
        echo ✅ Discovery Service is healthy
    ) || (
        echo ❌ Discovery Service is not healthy
    )
    
    curl -f -s http://localhost:8080/actuator/health >nul 2>&1 && (
        echo ✅ API Gateway is healthy
    ) || (
        echo ❌ API Gateway is not healthy
    )
    
    curl -f -s http://localhost:8081/actuator/health >nul 2>&1 && (
        echo ✅ User Service is healthy
    ) || (
        echo ❌ User Service is not healthy
    )
    
    curl -f -s http://localhost:8084/actuator/health >nul 2>&1 && (
        echo ✅ Notification Service is healthy
    ) || (
        echo ❌ Notification Service is not healthy
    )
    
    echo.
    echo 📊 Running containers:
    docker compose -f docker-compose.prod.yaml ps
    
    echo.
    echo 📝 To view logs: docker compose -f docker-compose.prod.yaml logs -f
    echo 🛑 To stop: docker compose -f docker-compose.prod.yaml down
)

echo.
echo ==============================================
echo ✅ Local testing completed!
echo ==============================================
pause
