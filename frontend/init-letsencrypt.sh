#!/bin/bash

# Script to initialize Let's Encrypt SSL certificates
# This script should be run once before starting the application

DOMAIN="nguyentheanh-nta.id.vn"
EMAIL="anhnta2004@gmail.com"  # Replace with your email
STAGING=0  # Set to 1 if you're testing to avoid rate limits

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Let's Encrypt SSL Certificate Initialization ===${NC}"
echo -e "${YELLOW}Domain: ${DOMAIN}${NC}"
echo -e "${YELLOW}Email: ${EMAIL}${NC}"
echo ""

# Check if certificates already exist
if [ -d "./certbot/conf/live/$DOMAIN" ]; then
  read -p "Existing certificates found for $DOMAIN! Remove and continue? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
  fi
fi

# Create required directories
mkdir -p "./certbot/conf"
mkdir -p "./certbot/www"
mkdir -p "./certbot/var"

echo -e "${GREEN}Step 1: Creating temporary nginx config for certificate generation...${NC}"

# Create a temporary nginx config for certificate acquisition
cat > nginx-certonly.conf << 'EOF'
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
EOF

echo -e "${GREEN}Step 2: Starting temporary nginx container...${NC}"

# Start a temporary nginx container with the certonly config
docker run -d --name nginx-certonly \
  -p 80:80 \
  -v $(pwd)/nginx-certonly.conf:/etc/nginx/conf.d/default.conf:ro \
  -v $(pwd)/certbot/www:/var/www/certbot:ro \
  nginx:alpine

# Wait for nginx to start
sleep 3

echo -e "${GREEN}Step 3: Requesting SSL certificate from Let's Encrypt...${NC}"

# Determine if we should use staging or production
CERT_ARGS=""
if [ $STAGING != "0" ]; then
  CERT_ARGS="--staging"
  echo -e "${YELLOW}Using Let's Encrypt staging server (for testing)${NC}"
fi

# Request the certificate
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -v $(pwd)/certbot/var:/var/lib/letsencrypt \
  certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $CERT_ARGS \
    -d $DOMAIN \
    -d www.$DOMAIN

# Check if certificate was successfully obtained
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ SSL certificate obtained successfully!${NC}"
else
  echo -e "${RED}✗ Failed to obtain SSL certificate${NC}"
  docker stop nginx-certonly && docker rm nginx-certonly
  rm nginx-certonly.conf
  exit 1
fi

echo -e "${GREEN}Step 4: Cleaning up temporary containers...${NC}"

# Stop and remove temporary nginx container
docker stop nginx-certonly && docker rm nginx-certonly
rm nginx-certonly.conf

echo -e "${GREEN}=== SSL Certificate Setup Complete! ===${NC}"
echo -e "${GREEN}You can now start your application with docker-compose up -d${NC}"
echo ""
echo -e "${YELLOW}Note: Certificates will be automatically renewed by the certbot container${NC}"
