#!/bin/bash

# Quick deployment script for CNWEB Frontend with HTTPS
# This script helps you deploy the application with SSL certificate

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CNWEB Frontend Deployment with HTTPS ===${NC}"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if certificates exist
if [ ! -d "./certbot/conf/live/nguyentheanh-nta.id.vn" ]; then
    echo -e "${YELLOW}SSL certificates not found!${NC}"
    echo -e "${YELLOW}You need to obtain SSL certificates first.${NC}"
    echo ""
    read -p "Do you want to run the certificate initialization script? (y/N) " response
    
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo -e "${CYAN}Running init-letsencrypt.sh...${NC}"
        chmod +x init-letsencrypt.sh
        ./init-letsencrypt.sh
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to obtain certificates. Aborting deployment.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Please run ./init-letsencrypt.sh first to obtain SSL certificates.${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✓ SSL certificates found${NC}"
echo ""

# Ask for image tag
echo -e "${CYAN}Enter the Docker image tag (default: latest):${NC}"
read tag
if [ -z "$tag" ]; then
    tag="latest"
fi

echo ""
echo -e "${YELLOW}Deploying with tag: $tag${NC}"
echo ""

# Set environment variable
export TAG=$tag

# Stop existing containers
echo -e "${CYAN}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yaml down

# Pull latest images
echo -e "${CYAN}Pulling latest Docker images...${NC}"
docker-compose -f docker-compose.prod.yaml pull

# Start containers
echo -e "${CYAN}Starting containers...${NC}"
docker-compose -f docker-compose.prod.yaml up -d

# Wait a bit for containers to start
sleep 5

# Check container status
echo ""
echo -e "${GREEN}Container Status:${NC}"
docker-compose -f docker-compose.prod.yaml ps

echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo -e "${CYAN}Your application should now be available at:${NC}"
echo -e "${WHITE}  • https://nguyentheanh-nta.id.vn${NC}"
echo -e "${WHITE}  • https://www.nguyentheanh-nta.id.vn${NC}"
echo ""
echo -e "${YELLOW}HTTP traffic will be automatically redirected to HTTPS${NC}"
echo ""
echo -e "${CYAN}To view logs, run:${NC}"
echo -e "${WHITE}  docker-compose -f docker-compose.prod.yaml logs -f${NC}"
echo ""
echo -e "${CYAN}To stop the application, run:${NC}"
echo -e "${WHITE}  docker-compose -f docker-compose.prod.yaml down${NC}"
