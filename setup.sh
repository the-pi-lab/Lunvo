#!/usr/bin/env bash
set -e

# LUNVO — 30s Self-Host Setup (Docker)
# Usage: chmod +x setup.sh && ./setup.sh

echo "▸ LUNVO setup — Docker (node:20-alpine)"
echo ""

# 1. Env
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local from .env.example — edit it to add your BYOK keys (GEMINI_API_KEY or GROQ_API_KEY)."
  else
    echo "⚠ .env.example not found — creating empty .env.local"
    touch .env.local
  fi
else
  echo "✓ .env.local already exists — skipping."
fi

# 2. Docker check
if ! command -v docker >/dev/null 2>&1; then
  echo "✗ Docker not found. Install Docker Desktop: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1 && ! docker-compose version >/dev/null 2>&1; then
  echo "✗ docker compose not found. Update Docker Desktop."
  exit 1
fi

# 3. Build & up
echo ""
echo "▸ Building Docker image (node:20-alpine) — first build ~2-3 min..."
if docker compose version >/dev/null 2>&1; then
  docker compose up -d --build
else
  docker-compose up -d --build
fi

echo ""
echo "✓ LUNVO is up!"
echo "  → App: http://localhost:3000"
echo "  → Health: http://localhost:3000/api/health"
echo ""
echo "  Logs: docker compose logs -f"
echo "  Stop: docker compose down"
