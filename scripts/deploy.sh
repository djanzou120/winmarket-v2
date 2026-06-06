#!/bin/bash

# WinMarket V2 - Production Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"

echo -e "${BLUE}🚀 WinMarket V2 Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENV}${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Docker Compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

# Check environment file
ENV_FILE="./apps/api/.env.$ENV"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: $ENV_FILE${NC}"
    echo -e "${YELLOW}Please create the environment file based on .env.production template${NC}"
    exit 1
fi

# Function to backup database
backup_database() {
    echo -e "${YELLOW}💾 Creating database backup...${NC}"

    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/winmarket_$(date +%Y%m%d_%H%M%S).sql"

    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres winmarket_v2 > "$BACKUP_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Database backup created: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️ Database backup failed (database might not exist yet)${NC}"
    fi
}

# Function to run health check
health_check() {
    echo -e "${YELLOW}🔍 Performing health check...${NC}"

    # Wait for services to be ready
    sleep 10

    # Check API health
    for i in {1..10}; do
        if curl -f http://localhost:4001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API health check passed${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Waiting for API to be ready (attempt $i/10)...${NC}"
        sleep 10
    done

    echo -e "${RED}❌ Health check failed${NC}"
    return 1
}

# Main deployment steps
echo -e "${BLUE}📋 Starting deployment process...${NC}"

# Step 1: Backup existing database
if docker-compose -f "$COMPOSE_FILE" ps | grep -q "postgres"; then
    backup_database
fi

# Step 2: Pull latest images (if using registry)
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker-compose -f "$COMPOSE_FILE" pull

# Step 3: Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
docker-compose -f "$COMPOSE_FILE" build --no-cache api

# Step 4: Stop existing services
echo -e "${YELLOW}⏹️ Stopping existing services...${NC}"
docker-compose -f "$COMPOSE_FILE" down

# Step 5: Start infrastructure services first
echo -e "${YELLOW}🗄️ Starting infrastructure services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d postgres redis minio

# Wait for infrastructure to be ready
echo -e "${YELLOW}⏳ Waiting for infrastructure to be ready...${NC}"
sleep 20

# Step 6: Start API
echo -e "${YELLOW}🚀 Starting API service...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d api

# Step 7: Health check
if health_check; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}API is running at: http://localhost:4000${NC}"
    echo -e "${GREEN}Health endpoint: http://localhost:4001/health${NC}"

    # Show service status
    echo -e "\n${BLUE}📊 Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps

    # Show logs
    echo -e "\n${BLUE}📋 Recent API logs:${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 api
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50 api
    exit 1
fi

# Optional: Clean up old images
read -p "🧹 Clean up old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed${NC}"
fi

echo -e "\n${GREEN}🎯 Deployment completed successfully!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "  - Monitor logs: docker-compose -f $COMPOSE_FILE logs -f api"
echo -e "  - Check health: curl http://localhost:4001/health"
echo -e "  - Access GraphQL: http://localhost:4000"