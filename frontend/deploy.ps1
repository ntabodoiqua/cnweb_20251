# Quick deployment script for CNWEB Frontend with HTTPS
# This script helps you deploy the application with SSL certificate

Write-Host "=== CNWEB Frontend Deployment with HTTPS ===" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if certificates exist
if (-not (Test-Path "./certbot/conf/live/nguyentheanh-nta.id.vn")) {
    Write-Host "SSL certificates not found!" -ForegroundColor Yellow
    Write-Host "You need to obtain SSL certificates first." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to run the certificate initialization script? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Running init-letsencrypt.ps1..." -ForegroundColor Cyan
        .\init-letsencrypt.ps1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to obtain certificates. Aborting deployment." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Please run ./init-letsencrypt.ps1 first to obtain SSL certificates." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "✓ SSL certificates found" -ForegroundColor Green
Write-Host ""

# Ask for image tag
Write-Host "Enter the Docker image tag (default: latest):" -ForegroundColor Cyan
$tag = Read-Host
if ([string]::IsNullOrWhiteSpace($tag)) {
    $tag = "latest"
}

Write-Host ""
Write-Host "Deploying with tag: $tag" -ForegroundColor Yellow
Write-Host ""

# Set environment variable
$env:TAG = $tag

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yaml down

# Pull latest images
Write-Host "Pulling latest Docker images..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yaml pull

# Start containers
Write-Host "Starting containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yaml up -d

# Wait a bit for containers to start
Start-Sleep -Seconds 5

# Check container status
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Green
docker-compose -f docker-compose.prod.yaml ps

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your application should now be available at:" -ForegroundColor Cyan
Write-Host "  • https://nguyentheanh-nta.id.vn" -ForegroundColor White
Write-Host "  • https://www.nguyentheanh-nta.id.vn" -ForegroundColor White
Write-Host ""
Write-Host "HTTP traffic will be automatically redirected to HTTPS" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs, run:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.prod.yaml logs -f" -ForegroundColor White
Write-Host ""
Write-Host "To stop the application, run:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.prod.yaml down" -ForegroundColor White
