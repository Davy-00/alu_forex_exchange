# Deployment Guide for Linda Server

## Pre-deployment Setup

1. **Prepare the server environment**
```bash
# SSH into Linda
ssh your-username@linda-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone your repository**
```bash
git clone <your-repository-url>
cd alu_forex_exchange
```

## Option A: Single Instance Deployment (Quick Start)

```bash
# Build the Docker image
docker build -t forex-exchange:v1 .

# Run the application
docker run -d --name forex-app \
  --restart unless-stopped \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e SERVER_NAME=linda-server \
  forex-exchange:v1

# Test the deployment
curl http://localhost:8080/health
```

## Option B: Load Balanced Deployment (Full Marks)

```bash
# Build and deploy with load balancing
docker-compose up -d

# Test load balancing
for i in {1..10}; do
  curl -s http://localhost/health | jq '.server'
  sleep 1
done
```

## Verification Commands

```bash
# Check all containers are running
docker ps

# Check application logs
docker logs forex-app

# Test API endpoints
curl http://localhost:8080/api/currencies
curl -X POST http://localhost:8080/api/convert \
  -H "Content-Type: application/json" \
  -d '{"from":"USD","to":"EUR","amount":100}'

# Test load balancer (if using Option B)
curl http://localhost/health
curl http://localhost:8404/stats  # HAProxy stats
```

## Public Access Setup

```bash
# If you want public access, configure nginx reverse proxy
sudo apt install nginx -y

# Create nginx configuration
sudo tee /etc/nginx/sites-available/forex-exchange << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/forex-exchange /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Security Considerations

```bash
# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if using SSL)
sudo ufw enable

# Set up SSL with Let's Encrypt (optional)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```
