#!/bin/bash

# VITYAZ Complete Testnet Deployment
# This script performs full testnet deployment

set -e

echo "🚀 VITYAZ Complete Testnet Deployment"
echo "====================================="
echo ""

# Step 1: Deploy smart contracts
echo "Step 1/5: Deploying smart contracts"
./scripts/deploy-contracts.sh

if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed"
    exit 1
fi

echo ""
# Step 2: Run all tests
echo "Step 2/5: Running test suite"
./scripts/run-tests.sh

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo ""
# Step 3: Build Docker images
echo "Step 3/5: Building Docker images"
docker-compose -f docker-compose.prod.yml build

if [ $? -eq 0 ]; then
    echo "✅ Docker images built"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
# Step 4: Deploy to staging
echo "Step 4/5: Deploying to staging"
echo "⚠️  Manual step: Deploy Docker images to staging environment"
echo "Commands:"
echo "  docker tag vityaz-frontend:latest registry.digitalocean.com/vityaz/frontend:testnet"
echo "  docker push registry.digitalocean.com/vityaz/frontend:testnet"
echo "  docker tag vityaz-backend:latest registry.digitalocean.com/vityaz/backend:testnet"
echo "  docker push registry.digitalocean.com/vityaz/backend:testnet"
read -p "Press Enter when deployment is complete..."

echo ""
# Step 5: Health check
echo "Step 5/5: Running health checks"
echo "Checking backend health..."
curl -f https://testnet-api.vityaz.io/health || echo "❌ Backend health check failed"

echo ""
echo "Checking frontend..."
curl -f https://testnet.vityaz.io || echo "❌ Frontend health check failed"

echo ""
echo "====================================="
echo "🎉 Testnet Deployment Complete!"
echo "====================================="
echo ""
echo "Access your testnet:"
echo "  Frontend: https://testnet.vityaz.io"
echo "  Backend:  https://testnet-api.vityaz.io"
echo "  Docs:     https://testnet-api.vityaz.io/docs"
echo ""
echo "Next steps:"
echo "  1. Invite alpha testers"
echo "  2. Monitor error logs"
echo "  3. Gather feedback"
echo "  4. Fix bugs"
echo "  5. Prepare for mainnet"
echo ""