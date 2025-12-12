#!/bin/bash

# VITYAZ Environment Setup Script
# Sets up complete development environment

set -e

echo "🛠  VITYAZ Environment Setup"
echo "============================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check Docker
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi
echo "✅ Docker $(docker --version)"

# Check Docker Compose
echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose"
    exit 1
fi
echo "✅ Docker Compose $(docker-compose --version)"

echo ""
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📊 Running database migrations..."
cd backend
npm run prisma:migrate:deploy

echo ""
echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "To start development:"
echo "  Terminal 1: cd frontend && npm run dev"
echo "  Terminal 2: cd backend && npm run start:dev"
echo ""
echo "Services:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Database:  postgresql://localhost:5432"
echo "  Redis:     redis://localhost:6379"
echo ""