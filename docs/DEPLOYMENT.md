# 🚀 VITYAZ Deployment Guide

## Local Development

### Prerequisites

```bash
# Node.js 20+
node --version

# Docker & Docker Compose
docker --version
docker-compose --version

# Git
git --version
```

### Setup Local Environment

```bash
# 1. Clone repository
git clone https://github.com/kaylas000/vityaz-special-operations.git
cd vityaz-special-operations

# 2. Install dependencies
make install

# 3. Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Start Docker stack (PostgreSQL, Redis, Nginx)
make docker-up

# 5. Wait for services to be ready
sleep 10

# 6. Run database migrations
make db-migrate

# 7. Seed database (optional)
make db-seed

# 8. In separate terminals, start frontend & backend
cd frontend && npm run dev     # Terminal 1 - Port 3000
cd backend && npm run start:dev # Terminal 2 - Port 3001
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api
- Adminer (DB): http://localhost:8080

### Environment Variables

**frontend/.env:**
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_TON_NETWORK=testnet
```

**backend/.env:**
```
NODE_ENV=development
DATABASE_URL=postgresql://vityaz:password@postgres:5432/vityaz_db
REDIS_URL=redis://redis:6379
JWT_SECRET=dev_secret_key_123
TON_NETWORK=testnet
TON_MNEMONIC=your_test_wallet_mnemonic
```

---

## Testnet Deployment (TON, Ethereum, Solana)

### 1. TON Testnet

#### Deploy Smart Contracts

```bash
cd contracts/ton

# Compile contracts
fift -s compile.fif

# Deploy token
tonlib deploy testnet VityazToken.boc

# Deploy marketplace
tonlib deploy testnet Marketplace.boc

# Deploy staking
tonlib deploy testnet Staking.boc
```

#### Configure Backend

```
# backend/.env
TON_NETWORK=testnet
TON_MNEMONIC=your_test_mnemonic_12_words
TON_TOKEN_ADDRESS=EQA8UqFCq3Tp6Cr9sZn0...
TON_MARKETPLACE_ADDRESS=EQA5aF_LqHHa...
TON_STAKING_ADDRESS=EQB1hF_GqHK...
```

#### Test TON Integration

```bash
# Test token transfer
curl -X POST http://localhost:3001/ton/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "EQA...",
    "amount": "1000",
    "memo": "Test transfer"
  }'

# Check balance
curl http://localhost:3001/ton/balance/EQA...
```

### 2. Ethereum Sepolia Testnet

#### Deploy Smart Contracts

```bash
cd contracts/ethereum

# Compile
npx hardhat compile

# Deploy to Sepolia
CHAIN_ID=11155111 npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
ETHERSCAN_API_KEY=your_key npx hardhat verify --network sepolia ADDRESS args
```

#### Configure Backend

```
# backend/.env
ETH_NETWORK=sepolia
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETH_TOKEN_ADDRESS=0x...
ETH_PRIVATE_KEY=your_test_key
ETHERSCAN_API_KEY=your_key
```

### 3. Solana Devnet

#### Deploy Programs

```bash
cd contracts/solana

# Build
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Test
anchor test
```

#### Configure Backend

```
# backend/.env
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_TOKEN_ADDRESS=Vity2...
SOLANA_PRIVATE_KEY=your_test_key
```

---

## Staging Deployment

### Prerequisites

- AWS Account (or equivalent cloud provider)
- Domain name (optional)
- SSL certificate (recommended)
- CI/CD pipeline (GitHub Actions, GitLab CI, etc.)

### Architecture

```
┌─────────────────────────────────────────┐
│         CloudFlare / CDN               │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      Application Load Balancer          │
└──────────────────┬──────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
  ┌──▼──┐      ┌──▼──┐      ┌──▼──┐
  │ FE  │      │ BE  │      │ BE  │
  │ 3000│      │3001 │      │3002 │
  └─────┘      └──┬──┘      └──┬──┘
                  │             │
              ┌───▼─────────────▼───┐
              │  Shared Services    │
              │  PostgreSQL/Redis   │
              └─────────────────────┘
```

### Deployment Steps

#### 1. Setup AWS Infrastructure

```bash
# Create RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier vityaz-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username vityaz \
  --master-user-password SecurePassword123! \
  --allocated-storage 20

# Create ElastiCache Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id vityaz-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### 2. Configure CI/CD (.github/workflows/deploy.yml)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Build backend
        run: cd backend && npm run build
      
      - name: Deploy to AWS
        run: |
          aws s3 sync frontend/dist s3://vityaz-frontend/
          aws ecs update-service --cluster vityaz --service vityaz-backend --force-new-deployment
```

#### 3. Deploy Containers

```bash
# Build images
docker build -t vityaz-frontend:latest ./frontend
docker build -t vityaz-backend:latest ./backend

# Tag for ECR
docker tag vityaz-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/vityaz-frontend:latest
docker tag vityaz-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/vityaz-backend:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/vityaz-frontend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/vityaz-backend:latest

# Update ECS service
aws ecs update-service \
  --cluster vityaz-staging \
  --service vityaz-backend \
  --force-new-deployment
```

#### 4. Database Migrations

```bash
# Run migrations on staging database
DATABASE_URL=postgresql://user:pass@staging-db:5432/vityaz \
  npx prisma migrate deploy

# Verify
DATABASE_URL=postgresql://user:pass@staging-db:5432/vityaz \
  npx prisma studio
```

---

## Production Deployment

### Prerequisites

- Multi-region deployment capability
- DDoS protection (CloudFlare, AWS Shield)
- WAF (Web Application Firewall)
- Monitoring (DataDog, New Relic)
- Logging (ELK Stack, CloudWatch)

### Production Checklist

- [ ] Code reviewed and tested
- [ ] Security audit completed
- [ ] Performance tested (load testing)
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan
- [ ] Monitoring alerts configured
- [ ] Incident response procedures documented
- [ ] SSL/TLS certificates valid
- [ ] Rate limiting configured
- [ ] Database backups automated

### Production Environment Variables

```
# backend/.env.production
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=postgresql://secure-user:SecurePassword@prod-db.region.rds.amazonaws.com:5432/vityaz_prod
REDIS_URL=redis://prod-redis.region.cache.amazonaws.com:6379
JWT_SECRET=production_secret_key_very_long_random_string_minimum_32_chars
TON_NETWORK=mainnet
TON_MNEMONIC=encrypted_mainnet_mnemonic_12_words
ETH_NETWORK=mainnet
CORS_ORIGIN=https://vityaz.game
RATENOTLIMIT_WINDOW=15m
RATELIMIT_MAX_REQUESTS=100
```

### Deploy to Production

```bash
# Manual deployment (or use GitHub Actions)

# 1. Tag release
git tag -a v1.0.0 -m "Production Release v1.0.0"
git push origin v1.0.0

# 2. Build production images
docker build -t vityaz-frontend:v1.0.0 ./frontend
docker build -t vityaz-backend:v1.0.0 ./backend

# 3. Push to production ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/vityaz-frontend:v1.0.0
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/vityaz-backend:v1.0.0

# 4. Update production database
DATABASE_URL=postgresql://prod:password@prod-db.amazonaws.com:5432/vityaz \
  npx prisma migrate deploy --skip-generate

# 5. Deploy services
aws ecs update-service \
  --cluster vityaz-prod \
  --service vityaz-backend \
  --force-new-deployment \
  --region us-east-1

# 6. Monitor deployment
aws ecs describe-services \
  --cluster vityaz-prod \
  --services vityaz-backend \
  --region us-east-1
```

### Health Checks

```bash
# After deployment, verify health

# Frontend
curl -I https://vityaz.game

# Backend API
curl https://api.vityaz.game/health

# Database connection
curl -X GET https://api.vityaz.game/db/health

# TON integration
curl -X GET https://api.vityaz.game/ton/health
```

---

## Monitoring & Maintenance

### Monitoring Stack

```bash
# Enable Prometheus metrics
cd backend
npm install @nestjs/metrics

# Enable DataDog monitoring
DD_API_KEY=your_key npm run start:prod
```

### Log Aggregation

```bash
# CloudWatch logs
aws logs create-log-group --log-group-name /vityaz/backend
aws logs put-retention-policy \
  --log-group-name /vityaz/backend \
  --retention-in-days 30
```

### Alerting

```
- CPU > 80% for 5 min
- Memory > 90% for 5 min
- Error rate > 1% for 5 min
- API response time > 2s
- Database connection errors
- Blockchain RPC errors
```

---

**Last Updated:** December 2025  
**Target Release:** Q4 2026  
**Production Status:** 🟡 In Preparation