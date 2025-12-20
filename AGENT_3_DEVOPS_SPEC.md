# AGENT 3: DevOps Engineer Specification
## Phase 2.3 - Infrastructure & Deployment Setup

### 🎯 PRIMARY OBJECTIVE
Setup CI/CD pipeline and containerized deployment infrastructure

### 📋 TASKS (Priority Order)

#### Task 3.1: GitHub Actions CI/CD
```
□ Create .github/workflows/test.yml
  - Run npm test on pull requests
  - Run Jest coverage
  - Fail if coverage < 50%
□ Create .github/workflows/build.yml
  - Build frontend
  - Build contracts
  - Run linting
□ Create .github/workflows/deploy.yml
  - Deploy to testnet (trigger on main)
  - Run integration tests
```

#### Task 3.2: Docker Setup
```
□ Create frontend/Dockerfile
  - Node 18+ base
  - npm install & build
  - Nginx serve
□ Create contracts/ton/Dockerfile
  - Node 18+ base
  - TypeScript compilation
□ Create docker-compose.yml
  - Frontend service
  - Backend service
  - Local testnet setup
```

#### Task 3.3: Environment Configuration
```
□ Create .env.example files
  - frontend/.env.example
  - contracts/ton/.env.example
□ Document environment variables
□ Create ENV_SETUP.md
```

#### Task 3.4: Kubernetes Manifests (k8s/)
```
□ Create k8s/deployment.yaml
  - Frontend deployment
  - Contracts deployment
  - Resource limits
□ Create k8s/service.yaml
  - Load balancer
  - Port mappings
□ Create k8s/configmap.yaml
  - Configuration
```

### 📚 RESOURCES
- GitHub Actions: https://github.com/features/actions
- Docker: https://docs.docker.com/
- K8s: k8s/ directory (existing)
- Deployment guide: docker-compose.yml pattern

### 🔗 DEPENDENCIES
- Agent 1 & 2 provide deployment targets

### ✅ SUCCESS CRITERIA
- CI/CD runs on every PR
- Docker images build successfully
- docker-compose up works locally
- K8s manifests validate

### 📤 DELIVERABLE
- .github/workflows/*.yml (3 files)
- Dockerfile (2 files)
- docker-compose.yml
- k8s/*.yaml (3 files)
- ENV_SETUP.md
- PR: "infrastructure: CI/CD and Docker setup"

### ⏱️ ESTIMATED TIME: 3-4 hours
