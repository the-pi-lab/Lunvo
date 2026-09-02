#!/usr/bin/env bash
# ==============================================================================
# LUNVO 2.0 — 1-Click VPS & Dedicated Server Installer (Ubuntu / Debian / Alma)
# ==============================================================================

set -e

echo "🚀 Starting LUNVO 2.0 Autonomous OS VPS Setup..."

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker compose &> /dev/null; then
    echo "🐳 Installing Docker Compose plugin..."
    sudo apt-get install -y docker-compose-plugin
fi

# 3. Environment configuration
if [ ! -f .env.local ] && [ -f .env.example ]; then
    echo "📄 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update your .env.local file with your API keys and Telegram tokens."
fi

# 4. Build and run production containers
echo "🏗️ Building and starting LUNVO Production Cluster in background..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "======================================================================"
echo "✅ LUNVO 2.0 VPS Cluster is now running 24/7!"
echo "🌐 Local Access: http://localhost:3000"
echo "🔍 Health Check: http://localhost:3000/api/health"
echo "📊 Check Logs:   docker compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop Cluster: docker compose -f docker-compose.prod.yml down"
echo "======================================================================"
