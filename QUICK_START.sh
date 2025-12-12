#!/bin/bash

# VITYAZ Quick Start Script
# This script sets up the entire project in one command

echo "🚀 VITYAZ: Special Operations - Quick Start"
echo "=========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"

echo ""
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🗄️ Running database migrations..."
cd backend
npm run prisma:migrate:deploy

echo ""
echo "🌱 Seeding database with test data..."
npm run prisma:seed
cd ..

echo ""
echo "=========================================="
echo "🌟 SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "To start development servers, run:"
echo ""
echo "  Terminal 1 (Frontend): cd frontend && npm run dev"
echo "  Terminal 2 (Backend):  cd backend && npm run start:dev"
echo ""
echo "Then visit:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Database: http://localhost:5432"
echo "  Redis:    http://localhost:6379"
echo ""
echo "For more info, see GETTING_STARTED.md"
echo ""
