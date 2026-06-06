#!/bin/bash

echo "🚀 WinMarket v2 Development Setup"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    echo "After installation, run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo "✅ Docker is running"

# Start infrastructure services
echo "🐘 Starting PostgreSQL, Redis, and MinIO..."
docker compose up -d postgres redis minio

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker compose ps

# Create MinIO bucket
echo "📦 Setting up MinIO bucket..."
docker compose exec -T minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker compose exec -T minio mc mb local/winmarket-uploads --ignore-existing

echo "✅ Development environment setup complete!"
echo ""
echo "Available services:"
echo "- PostgreSQL: localhost:5432 (winmarket/password)"
echo "- Redis: localhost:6379"
echo "- MinIO: localhost:9000 (minioadmin/minioadmin)"
echo "- MinIO Console: localhost:9001"
echo ""
echo "To start admin tools (optional):"
echo "docker compose --profile tools up -d"
echo "- pgAdmin: localhost:5050 (admin@winmarket.com/admin)"
echo "- Redis Commander: localhost:8081"