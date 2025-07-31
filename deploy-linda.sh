#!/bin/bash

# ALU Forex Exchange - Quick Deployment Script for Linda Server
# Run this script to deploy the application with one command

set -e  # Exit on any error

echo "🚀 ALU Forex Exchange - Linda Server Deployment"
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    log_error "Please run this script from the alu_forex_exchange directory"
    exit 1
fi

log_info "Starting deployment process..."

# Stop existing containers if they exist
log_info "Stopping existing containers..."
docker stop forex-app 2>/dev/null || true
docker rm forex-app 2>/dev/null || true

# Build the Docker image
log_info "Building Docker image..."
docker build -t forex-exchange:v1 .

# Run the application
log_info "Starting the application..."
docker run -d --name forex-app \
    --restart unless-stopped \
    -p 8080:8080 \
    -e NODE_ENV=production \
    -e SERVER_NAME=linda-server \
    forex-exchange:v1

# Wait for the application to start
log_info "Waiting for application to start..."
sleep 10

# Test the deployment
log_info "Testing deployment..."
if curl -f -s http://localhost:8080/health > /dev/null; then
    log_info "✅ Application is running successfully!"
    
    # Get health check response
    health_response=$(curl -s http://localhost:8080/health)
    echo "Health Check Response: $health_response"
    
    # Test API endpoints
    log_info "Testing API endpoints..."
    
    echo "📊 Currencies endpoint:"
    curl -s http://localhost:8080/api/currencies | head -c 200
    echo "..."
    
    echo ""
    echo "💱 Conversion test (100 USD to EUR):"
    curl -s -X POST http://localhost:8080/api/convert \
        -H "Content-Type: application/json" \
        -d '{"from":"USD","to":"EUR","amount":100}'
    
    echo ""
    echo ""
    log_info "🎉 Deployment completed successfully!"
    echo ""
    echo "Access your application at:"
    echo "- Main Application: http://$(hostname -I | awk '{print $1}'):8080"
    echo "- Health Check: http://$(hostname -I | awk '{print $1}'):8080/health"
    echo ""
    echo "Container Status:"
    docker ps --filter name=forex-app
    
else
    log_error "❌ Application failed to start properly"
    echo "Container logs:"
    docker logs forex-app
    exit 1
fi
