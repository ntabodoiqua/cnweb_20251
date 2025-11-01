# PowerShell Script to initialize Let's Encrypt SSL certificates
# This script should be run once before starting the application

$DOMAIN = "nguyentheanh-nta.id.vn"
$EMAIL = "your-email@example.com"  # Replace with your email
$STAGING = 0  # Set to 1 if you're testing to avoid rate limits

Write-Host "=== Let's Encrypt SSL Certificate Initialization ===" -ForegroundColor Green
Write-Host "Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "Email: $EMAIL" -ForegroundColor Yellow
Write-Host ""

# Check if certificates already exist
if (Test-Path "./certbot/conf/live/$DOMAIN") {
    $decision = Read-Host "Existing certificates found for $DOMAIN! Remove and continue? (y/N)"
    if ($decision -ne "Y" -and $decision -ne "y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
}

# Create required directories
New-Item -ItemType Directory -Force -Path "./certbot/conf" | Out-Null
New-Item -ItemType Directory -Force -Path "./certbot/www" | Out-Null
New-Item -ItemType Directory -Force -Path "./certbot/var" | Out-Null

Write-Host "Step 1: Creating temporary nginx config for certificate generation..." -ForegroundColor Green

# Create a temporary nginx config for certificate acquisition
@"
server {
    listen 80;
    server_name nguyentheanh-nta.id.vn www.nguyentheanh-nta.id.vn;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
"@ | Out-File -FilePath "nginx-certonly.conf" -Encoding UTF8

Write-Host "Step 2: Starting temporary nginx container..." -ForegroundColor Green

# Get current directory
$currentDir = (Get-Location).Path

# Start a temporary nginx container with the certonly config
docker run -d --name nginx-certonly `
  -p 80:80 `
  -v "${currentDir}/nginx-certonly.conf:/etc/nginx/conf.d/default.conf:ro" `
  -v "${currentDir}/certbot/www:/var/www/certbot:ro" `
  nginx:alpine

# Wait for nginx to start
Start-Sleep -Seconds 3

Write-Host "Step 3: Requesting SSL certificate from Let's Encrypt..." -ForegroundColor Green

# Determine if we should use staging or production
$CERT_ARGS = @()
if ($STAGING -ne 0) {
    $CERT_ARGS += "--staging"
    Write-Host "Using Let's Encrypt staging server (for testing)" -ForegroundColor Yellow
}

# Request the certificate
$certbotCommand = "docker run --rm " +
    "-v `"${currentDir}/certbot/conf:/etc/letsencrypt`" " +
    "-v `"${currentDir}/certbot/www:/var/www/certbot`" " +
    "-v `"${currentDir}/certbot/var:/var/lib/letsencrypt`" " +
    "certbot/certbot certonly " +
    "--webroot " +
    "--webroot-path=/var/www/certbot " +
    "--email $EMAIL " +
    "--agree-tos " +
    "--no-eff-email " +
    ($CERT_ARGS -join " ") +
    " -d $DOMAIN " +
    "-d www.$DOMAIN"

Invoke-Expression $certbotCommand

# Check if certificate was successfully obtained
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SSL certificate obtained successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to obtain SSL certificate" -ForegroundColor Red
    docker stop nginx-certonly
    docker rm nginx-certonly
    Remove-Item "nginx-certonly.conf" -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Step 4: Cleaning up temporary containers..." -ForegroundColor Green

# Stop and remove temporary nginx container
docker stop nginx-certonly
docker rm nginx-certonly
Remove-Item "nginx-certonly.conf" -ErrorAction SilentlyContinue

Write-Host "=== SSL Certificate Setup Complete! ===" -ForegroundColor Green
Write-Host "You can now start your application with docker-compose up -d" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Certificates will be automatically renewed by the certbot container" -ForegroundColor Yellow
