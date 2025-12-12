# VITYAZ: Special Operations - Makefile
# One-command deployment helper

.PHONY: help install docker-up docker-down db-migrate db-seed dev test build deploy-testnet clean

help:
	@echo "VITYAZ: Special Operations - Available Commands"
	@echo "================================================"
	@echo "make install        - Install all dependencies"
	@echo "make docker-up      - Start Docker services"
	@echo "make docker-down    - Stop Docker services"
	@echo "make db-migrate     - Run database migrations"
	@echo "make db-seed        - Seed database with test data"
	@echo "make dev            - Start development servers"
	@echo "make test           - Run all tests"
	@echo "make build          - Build for production"
	@echo "make deploy-testnet - Deploy to testnet"
	@echo "make clean          - Clean build artifacts"
	@echo ""

install:
	@echo "📦 Installing dependencies..."
	npm install
	cd backend && npm install
	cd frontend && npm install
	@echo "✅ Dependencies installed"

docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 10
	@echo "✅ Docker services running"

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down
	@echo "✅ Docker services stopped"

db-migrate:
	@echo "🗄️ Running database migrations..."
	cd backend && npx prisma migrate deploy
	@echo "✅ Migrations complete"

db-seed:
	@echo "🌱 Seeding database..."
	cd backend && npx prisma db seed
	@echo "✅ Database seeded"

dev:
	@echo "🚀 Starting development servers..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001"
	@echo "Docs:     http://localhost:3001/docs"
	@echo ""
	@echo "Open 2 terminals and run:"
	@echo "  Terminal 1: cd frontend && npm run dev"
	@echo "  Terminal 2: cd backend && npm run start:dev"

test:
	@echo "🧪 Running tests..."
	cd backend && npm test
	cd frontend && npm test
	@echo "✅ All tests passed"

build:
	@echo "🏗️ Building for production..."
	cd backend && npm run build
	cd frontend && npm run build
	@echo "✅ Build complete"

deploy-testnet:
	@echo "🚀 Deploying to testnet..."
	./scripts/deploy-testnet.sh

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf node_modules
	@echo "✅ Cleaned"

# Quick start - Run everything
quickstart: install docker-up db-migrate db-seed
	@echo ""
	@echo "🎉 VITYAZ is ready!"
	@echo "=================="
	@echo ""
	@echo "To start development:"
	@echo "  Terminal 1: cd frontend && npm run dev"
	@echo "  Terminal 2: cd backend && npm run start:dev"
	@echo ""
	@echo "Then open: http://localhost:3000"
	@echo ""
