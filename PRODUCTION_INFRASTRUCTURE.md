# 🏗️ VITYAZ: Production Infrastructure Guide

**Last Updated:** December 13, 2025  
**Status:** 🟡 Ready for Implementation  
**Estimated Setup Time:** 2-3 weeks  
**Monthly Cost:** $500-$2,000

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Cloud Infrastructure (AWS)](#2-cloud-infrastructure-aws)
3. [Kubernetes Setup](#3-kubernetes-setup)
4. [Database & Caching](#4-database--caching)
5. [Load Balancing & CDN](#5-load-balancing--cdn)
6. [Monitoring & Logging](#6-monitoring--logging)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Secrets Management](#8-secrets-management)
9. [Backup & Disaster Recovery](#9-backup--disaster-recovery)
10. [Security & Compliance](#10-security--compliance)
11. [Cost Optimization](#11-cost-optimization)
12. [Deployment Checklist](#12-deployment-checklist)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE CDN                         │
│            (DDoS Protection + Edge Caching)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   AWS ROUTE 53 (DNS)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS ALB (Application Load Balancer)            │
│          (SSL Termination + Health Checks)                  │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────┐          ┌─────────────────────┐
│  EKS CLUSTER (K8s)  │          │   CloudFront CDN    │
│                     │          │  (Static Assets)    │
│  ┌───────────────┐ │          └─────────────────────┘
│  │   Frontend    │ │
│  │  (React SPA)  │ │
│  └───────────────┘ │
│                     │
│  ┌───────────────┐ │
│  │   Backend     │ │
│  │  (NestJS API) │ │
│  └───────────────┘ │
│                     │
│  ┌───────────────┐ │
│  │   WebSocket   │ │
│  │   Gateway     │ │
│  └───────────────┘ │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  RDS (Postgres) │  │ ElastiCache  │  │     S3       │    │
│  │   Multi-AZ    │  │   (Redis)    │  │  (Assets)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                  MONITORING & LOGGING                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Prometheus   │  │  Grafana     │  │     ELK      │    │
│  │  (Metrics)   │  │ (Dashboards) │  │   (Logs)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|----------|
| **Cloud Provider** | AWS | Primary infrastructure |
| **Container Orchestration** | Kubernetes (EKS) | Service management |
| **Load Balancer** | AWS ALB | Traffic distribution |
| **CDN** | Cloudflare + CloudFront | Global content delivery |
| **Database** | RDS PostgreSQL (Multi-AZ) | Persistent data |
| **Cache** | ElastiCache (Redis) | Session/game state |
| **Object Storage** | S3 | Static assets, backups |
| **Secrets** | AWS Secrets Manager | Credentials management |
| **CI/CD** | GitHub Actions | Automated deployments |
| **Monitoring** | Prometheus + Grafana | Metrics & dashboards |
| **Logging** | ELK Stack | Centralized logging |
| **APM** | Sentry | Error tracking |
| **Security** | AWS WAF + Shield | DDoS protection |

---

## 2. Cloud Infrastructure (AWS)

### 2.1 VPC Network Architecture

**File: `terraform/vpc.tf`**

```hcl
# VPC with Multi-AZ setup
resource "aws_vpc" "vityaz_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "vityaz-vpc"
    Environment = var.environment
    Project     = "vityaz"
  }
}

# Public Subnets (for Load Balancers, NAT Gateways)
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.vityaz_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name                              = "vityaz-public-1a"
    "kubernetes.io/role/elb"          = "1"
    "kubernetes.io/cluster/vityaz"    = "shared"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.vityaz_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name                              = "vityaz-public-1b"
    "kubernetes.io/role/elb"          = "1"
    "kubernetes.io/cluster/vityaz"    = "shared"
  }
}

# Private Subnets (for EKS Nodes, RDS)
resource "aws_subnet" "private_subnet_a" {
  vpc_id            = aws_vpc.vityaz_vpc.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name                              = "vityaz-private-1a"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/vityaz"    = "shared"
  }
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.vityaz_vpc.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name                              = "vityaz-private-1b"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/vityaz"    = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vityaz_vpc.id

  tags = {
    Name = "vityaz-igw"
  }
}

# NAT Gateway (for private subnet outbound traffic)
resource "aws_eip" "nat_eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet_a.id

  tags = {
    Name = "vityaz-nat"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.vityaz_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "vityaz-public-rt"
  }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.vityaz_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "vityaz-private-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_subnet_a.id
  route_table_id = aws_route_table.private_rt.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_subnet_b.id
  route_table_id = aws_route_table.private_rt.id
}
```

### 2.2 EKS Cluster Setup

**File: `terraform/eks.tf`**

```hcl
# EKS Cluster
resource "aws_eks_cluster" "vityaz" {
  name     = "vityaz-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = [
      aws_subnet.private_subnet_a.id,
      aws_subnet.private_subnet_b.id,
      aws_subnet.public_subnet_a.id,
      aws_subnet.public_subnet_b.id
    ]
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"] # Restrict in production
  }

  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  tags = {
    Name        = "vityaz-eks-cluster"
    Environment = var.environment
  }
}

# EKS Node Group (General Purpose)
resource "aws_eks_node_group" "general" {
  cluster_name    = aws_eks_cluster.vityaz.name
  node_group_name = "vityaz-general"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = [
    aws_subnet.private_subnet_a.id,
    aws_subnet.private_subnet_b.id
  ]

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }

  instance_types = ["t3.medium"] # 2 vCPU, 4GB RAM

  update_config {
    max_unavailable = 1
  }

  tags = {
    Name = "vityaz-general-nodes"
  }
}

# EKS Node Group (Game Servers - CPU Optimized)
resource "aws_eks_node_group" "game_servers" {
  cluster_name    = aws_eks_cluster.vityaz.name
  node_group_name = "vityaz-game-servers"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = [
    aws_subnet.private_subnet_a.id,
    aws_subnet.private_subnet_b.id
  ]

  scaling_config {
    desired_size = 2
    max_size     = 20
    min_size     = 1
  }

  instance_types = ["c6i.xlarge"] # 4 vCPU, 8GB RAM (compute optimized)

  labels = {
    workload = "game-server"
  }

  taint {
    key    = "game-server"
    value  = "true"
    effect = "NO_SCHEDULE"
  }

  tags = {
    Name = "vityaz-game-server-nodes"
  }
}

# IAM Roles
resource "aws_iam_role" "eks_cluster_role" {
  name = "vityaz-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role" "eks_node_role" {
  name = "vityaz-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}
```

### 2.3 RDS PostgreSQL (Multi-AZ)

**File: `terraform/rds.tf`**

```hcl
# RDS Subnet Group
resource "aws_db_subnet_group" "vityaz_db" {
  name       = "vityaz-db-subnet"
  subnet_ids = [
    aws_subnet.private_subnet_a.id,
    aws_subnet.private_subnet_b.id
  ]

  tags = {
    Name = "vityaz-db-subnet-group"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "vityaz-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.vityaz_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Only from VPC
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vityaz-rds-sg"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "vityaz_db" {
  identifier             = "vityaz-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.medium" # 2 vCPU, 4GB RAM
  allocated_storage      = 100 # GB
  max_allocated_storage  = 500 # Auto-scaling up to 500GB
  storage_type           = "gp3"
  storage_encrypted      = true
  
  db_name  = "vityaz"
  username = "vityaz_admin"
  password = random_password.db_password.result
  
  # High Availability
  multi_az               = true
  
  # Networking
  db_subnet_group_name   = aws_db_subnet_group.vityaz_db.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = false
  
  # Backups
  backup_retention_period = 7 # days
  backup_window           = "03:00-04:00" # UTC
  maintenance_window      = "sun:04:00-sun:05:00"
  
  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring_role.arn
  
  # Performance Insights
  performance_insights_enabled    = true
  performance_insights_retention_period = 7
  
  # Deletion protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "vityaz-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "vityaz-production-db"
    Environment = var.environment
  }
}

# Random password for DB
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "vityaz/db/password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}
```

### 2.4 ElastiCache Redis Cluster

**File: `terraform/redis.tf`**

```hcl
# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "vityaz_redis" {
  name       = "vityaz-redis-subnet"
  subnet_ids = [
    aws_subnet.private_subnet_a.id,
    aws_subnet.private_subnet_b.id
  ]
}

# Security Group for Redis
resource "aws_security_group" "redis_sg" {
  name        = "vityaz-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.vityaz_vpc.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vityaz-redis-sg"
  }
}

# ElastiCache Redis Cluster (Multi-AZ with automatic failover)
resource "aws_elasticache_replication_group" "vityaz_redis" {
  replication_group_id       = "vityaz-redis"
  description                = "Redis cluster for VITYAZ"
  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.t3.medium" # 2 vCPU, 3.09GB RAM
  num_cache_clusters         = 2
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  # High Availability
  automatic_failover_enabled = true
  multi_az_enabled           = true
  
  # Networking
  subnet_group_name          = aws_elasticache_subnet_group.vityaz_redis.name
  security_group_ids         = [aws_security_group.redis_sg.id]
  
  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auth_token                 = random_password.redis_auth_token.result
  
  # Backups
  snapshot_retention_limit   = 5
  snapshot_window            = "03:00-05:00"
  
  # Maintenance
  maintenance_window         = "sun:05:00-sun:07:00"
  
  tags = {
    Name        = "vityaz-redis-cluster"
    Environment = var.environment
  }
}

resource "random_password" "redis_auth_token" {
  length  = 32
  special = false # Redis auth token can't have special chars
}

resource "aws_secretsmanager_secret" "redis_auth_token" {
  name = "vityaz/redis/auth-token"
}

resource "aws_secretsmanager_secret_version" "redis_auth_token" {
  secret_id     = aws_secretsmanager_secret.redis_auth_token.id
  secret_string = random_password.redis_auth_token.result
}
```

---

## 3. Kubernetes Setup

### 3.1 Namespace Configuration

**File: `k8s/namespaces.yaml`**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: vityaz-production
  labels:
    name: vityaz-production
    environment: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: vityaz-monitoring
  labels:
    name: vityaz-monitoring
    environment: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: vityaz-ingress
  labels:
    name: vityaz-ingress
    environment: production
```

### 3.2 Backend Deployment

**File: `k8s/backend-deployment.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vityaz-backend
  namespace: vityaz-production
  labels:
    app: vityaz-backend
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: vityaz-backend
  template:
    metadata:
      labels:
        app: vityaz-backend
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      # Security Context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      
      # Service Account
      serviceAccountName: vityaz-backend-sa
      
      containers:
      - name: backend
        image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/vityaz-backend:latest
        imagePullPolicy: Always
        
        ports:
        - name: http
          containerPort: 3001
          protocol: TCP
        
        # Environment Variables from Secrets
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vityaz-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: vityaz-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: vityaz-secrets
              key: jwt-secret
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: vityaz-secrets
              key: encryption-key
        
        # Resource Limits
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        
        # Health Checks
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Security
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        
        # Volumes for temp files
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /app/.cache
      
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}
      
      # Pod Anti-Affinity (spread across nodes)
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - vityaz-backend
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: vityaz-backend-service
  namespace: vityaz-production
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: ClusterIP
  selector:
    app: vityaz-backend
  ports:
  - name: http
    port: 3001
    targetPort: 3001
    protocol: TCP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800 # 3 hours
```

### 3.3 Frontend Deployment

**File: `k8s/frontend-deployment.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vityaz-frontend
  namespace: vityaz-production
  labels:
    app: vityaz-frontend
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vityaz-frontend
  template:
    metadata:
      labels:
        app: vityaz-frontend
        version: v1
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 101 # nginx user
        fsGroup: 101
      
      containers:
      - name: frontend
        image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/vityaz-frontend:latest
        imagePullPolicy: Always
        
        ports:
        - name: http
          containerPort: 80
          protocol: TCP
        
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
            add:
            - NET_BIND_SERVICE
        
        volumeMounts:
        - name: nginx-cache
          mountPath: /var/cache/nginx
        - name: nginx-run
          mountPath: /var/run
      
      volumes:
      - name: nginx-cache
        emptyDir: {}
      - name: nginx-run
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: vityaz-frontend-service
  namespace: vityaz-production
spec:
  type: ClusterIP
  selector:
    app: vityaz-frontend
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
```

### 3.4 Horizontal Pod Autoscaler

**File: `k8s/hpa.yaml`**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vityaz-backend-hpa
  namespace: vityaz-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vityaz-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### 3.5 Ingress Controller (AWS ALB)

**File: `k8s/ingress.yaml`**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vityaz-ingress
  namespace: vityaz-production
  annotations:
    # AWS ALB Controller
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
    
    # Health check
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: '30'
    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '5'
    alb.ingress.kubernetes.io/healthy-threshold-count: '2'
    alb.ingress.kubernetes.io/unhealthy-threshold-count: '3'
    
    # WAF
    alb.ingress.kubernetes.io/wafv2-acl-arn: arn:aws:wafv2:us-east-1:ACCOUNT_ID:regional/webacl/vityaz-waf/ID
    
    # Security groups
    alb.ingress.kubernetes.io/security-groups: sg-xxxxxxxxx
    
    # Tags
    alb.ingress.kubernetes.io/tags: Environment=production,Project=vityaz
spec:
  rules:
  - host: api.vityaz.game
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: vityaz-backend-service
            port:
              number: 3001
  
  - host: vityaz.game
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: vityaz-frontend-service
            port:
              number: 80
  
  - host: www.vityaz.game
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: vityaz-frontend-service
            port:
              number: 80
```

---

## 4. Database & Caching

### 4.1 Database Connection Pooling

**backend/src/database/prisma.service.ts:**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['query', 'error', 'warn'],
    });

    // Connection pooling
    this.$connect();
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }
}
```

**Connection Pool Configuration (DATABASE_URL):**

```bash
DATABASE_URL="postgresql://vityaz_admin:PASSWORD@vityaz-db.xxxxx.us-east-1.rds.amazonaws.com:5432/vityaz?schema=public&connection_limit=10&pool_timeout=20&socket_timeout=60"
```

### 4.2 Redis Caching Strategy

**backend/src/cache/redis.service.ts:**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;
  private readonly TTL = {
    USER_SESSION: 3600, // 1 hour
    BATTLE_STATE: 600,  // 10 minutes
    LEADERBOARD: 300,   // 5 minutes
    NFT_METADATA: 86400, // 24 hours
  };

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_AUTH_TOKEN,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Redis connection failed');
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on('error', (err) => console.error('Redis Error:', err));
    this.client.on('connect', () => console.log('✅ Redis connected'));

    await this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flushPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetchFn();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}
```

---

## 5. Load Balancing & CDN

### 5.1 Cloudflare Configuration

**Cloudflare DNS Settings:**

```
vityaz.game         A     <ALB_IP>    Proxied  ✓
www.vityaz.game     CNAME vityaz.game  Proxied  ✓
api.vityaz.game     A     <ALB_IP>    Proxied  ✓
*.vityaz.game       A     <ALB_IP>    Proxied  ✓
```

**Cloudflare Page Rules:**

1. **Static Assets Caching:**
   - URL: `vityaz.game/assets/*`
   - Settings:
     - Cache Level: Standard
     - Edge Cache TTL: 1 month
     - Browser Cache TTL: 1 week

2. **API No-Cache:**
   - URL: `api.vityaz.game/*`
   - Settings:
     - Cache Level: Bypass

3. **WebSocket Support:**
   - URL: `api.vityaz.game/socket.io/*`
   - Settings:
     - WebSockets: On

**Cloudflare Firewall Rules:**

```javascript
// Block known bad bots
(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine Crawler" "Page Preview"})

// Rate limit API
(http.request.uri.path contains "/api/") and (rate limit 100 requests per 1 minute)

// Geo-blocking (optional)
(ip.geoip.country in {"XX" "YY"}) // Block specific countries if needed
```

### 5.2 AWS CloudFront for Static Assets

**File: `terraform/cloudfront.tf`**

```hcl
resource "aws_cloudfront_distribution" "vityaz_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "VITYAZ Static Assets CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # US, Canada, Europe
  
  aliases = [
    "cdn.vityaz.game"
  ]
  
  origin {
    domain_name = aws_s3_bucket.vityaz_assets.bucket_regional_domain_name
    origin_id   = "S3-vityaz-assets"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.vityaz_oai.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-vityaz-assets"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400   # 1 day
    max_ttl                = 31536000 # 1 year
    compress               = true
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.vityaz_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  
  tags = {
    Name        = "vityaz-cdn"
    Environment = var.environment
  }
}
```

---

## 6. Monitoring & Logging

### 6.1 Prometheus Setup

**File: `k8s/monitoring/prometheus.yaml`**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: vityaz-monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: 'vityaz-production'
        environment: 'production'
    
    scrape_configs:
    # Kubernetes API Server
    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https
    
    # Node Exporter
    - job_name: 'kubernetes-nodes'
      kubernetes_sd_configs:
      - role: node
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
    
    # Pods (with prometheus.io/scrape annotation)
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: vityaz-monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus
      containers:
      - name: prometheus
        image: prom/prometheus:v2.48.0
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--storage.tsdb.retention.time=30d'
        - '--web.enable-lifecycle'
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-pvc
```

### 6.2 Grafana Dashboards

**File: `k8s/monitoring/grafana.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: vityaz-monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:10.2.2
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-admin
              key: password
        - name: GF_INSTALL_PLUGINS
          value: "grafana-piechart-panel,grafana-clock-panel"
        volumeMounts:
        - name: storage
          mountPath: /var/lib/grafana
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
        - name: dashboards-config
          mountPath: /etc/grafana/provisioning/dashboards
        - name: dashboards
          mountPath: /var/lib/grafana/dashboards
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: grafana-pvc
      - name: datasources
        configMap:
          name: grafana-datasources
      - name: dashboards-config
        configMap:
          name: grafana-dashboards-config
      - name: dashboards
        configMap:
          name: grafana-dashboards
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: vityaz-monitoring
data:
  datasources.yml: |
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      access: proxy
      url: http://prometheus-service:9090
      isDefault: true
      editable: false
```

### 6.3 ELK Stack (Elasticsearch, Logstash, Kibana)

**Simplified with AWS OpenSearch Service:**

**File: `terraform/opensearch.tf`**

```hcl
resource "aws_opensearch_domain" "vityaz_logs" {
  domain_name    = "vityaz-logs"
  engine_version = "OpenSearch_2.11"
  
  cluster_config {
    instance_type          = "t3.medium.search"
    instance_count         = 2
    zone_awareness_enabled = true
  }
  
  ebs_options {
    ebs_enabled = true
    volume_size = 50 # GB per node
    volume_type = "gp3"
  }
  
  encrypt_at_rest {
    enabled = true
  }
  
  node_to_node_encryption {
    enabled = true
  }
  
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }
  
  vpc_options {
    subnet_ids = [
      aws_subnet.private_subnet_a.id,
      aws_subnet.private_subnet_b.id
    ]
    security_group_ids = [aws_security_group.opensearch_sg.id]
  }
  
  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = true
    master_user_options {
      master_user_name     = "admin"
      master_user_password = random_password.opensearch_password.result
    }
  }
  
  tags = {
    Name        = "vityaz-logs"
    Environment = var.environment
  }
}
```

**Fluent Bit for Log Shipping:**

**File: `k8s/logging/fluent-bit.yaml`**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: vityaz-production
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush        5
        Daemon       Off
        Log_Level    info
    
    [INPUT]
        Name              tail
        Path              /var/log/containers/*_vityaz-production_*.log
        Parser            docker
        Tag               kube.*
        Refresh_Interval  5
        Mem_Buf_Limit     5MB
    
    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        Kube_Token_File     /var/run/secrets/kubernetes.io/serviceaccount/token
        Merge_Log           On
        K8S-Logging.Parser  On
        K8S-Logging.Exclude On
    
    [OUTPUT]
        Name  es
        Match *
        Host  ${OPENSEARCH_HOST}
        Port  443
        TLS   On
        HTTP_User ${OPENSEARCH_USER}
        HTTP_Passwd ${OPENSEARCH_PASSWORD}
        Index vityaz-logs
        Type  _doc
        Logstash_Format On
        Logstash_Prefix vityaz
        Retry_Limit 5
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: vityaz-production
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    metadata:
      labels:
        app: fluent-bit
    spec:
      serviceAccountName: fluent-bit
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:2.2.0
        env:
        - name: OPENSEARCH_HOST
          valueFrom:
            secretKeyRef:
              name: opensearch-credentials
              key: host
        - name: OPENSEARCH_USER
          valueFrom:
            secretKeyRef:
              name: opensearch-credentials
              key: username
        - name: OPENSEARCH_PASSWORD
          valueFrom:
            secretKeyRef:
              name: opensearch-credentials
              key: password
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Workflow

**File: `.github/workflows/deploy-production.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - 'frontend/**'
      - 'k8s/**'
      - '.github/workflows/deploy-production.yml'
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
  EKS_CLUSTER_NAME: vityaz-cluster

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm install
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Run backend tests
      run: cd backend && npm test -- --coverage
    
    - name: Run frontend tests
      run: cd frontend && npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info

  build-backend:
    name: Build Backend Image
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.image-tag.outputs.tag }}
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Generate image tag
      id: image-tag
      run: echo "tag=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
    
    - name: Build and push Docker image
      working-directory: ./backend
      run: |
        docker build -t ${{ env.ECR_REGISTRY }}/vityaz-backend:${{ steps.image-tag.outputs.tag }} .
        docker tag ${{ env.ECR_REGISTRY }}/vityaz-backend:${{ steps.image-tag.outputs.tag }} ${{ env.ECR_REGISTRY }}/vityaz-backend:latest
        docker push ${{ env.ECR_REGISTRY }}/vityaz-backend:${{ steps.image-tag.outputs.tag }}
        docker push ${{ env.ECR_REGISTRY }}/vityaz-backend:latest

  build-frontend:
    name: Build Frontend Image
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.image-tag.outputs.tag }}
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Generate image tag
      id: image-tag
      run: echo "tag=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT
    
    - name: Build and push Docker image
      working-directory: ./frontend
      run: |
        docker build -t ${{ env.ECR_REGISTRY }}/vityaz-frontend:${{ steps.image-tag.outputs.tag }} .
        docker tag ${{ env.ECR_REGISTRY }}/vityaz-frontend:${{ steps.image-tag.outputs.tag }} ${{ env.ECR_REGISTRY }}/vityaz-frontend:latest
        docker push ${{ env.ECR_REGISTRY }}/vityaz-frontend:${{ steps.image-tag.outputs.tag }}
        docker push ${{ env.ECR_REGISTRY }}/vityaz-frontend:latest

  deploy:
    name: Deploy to EKS
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://vityaz.game
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region ${{ env.AWS_REGION }} --name ${{ env.EKS_CLUSTER_NAME }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/vityaz-backend vityaz-backend=${{ env.ECR_REGISTRY }}/vityaz-backend:${{ needs.build-backend.outputs.image-tag }} -n vityaz-production
        kubectl set image deployment/vityaz-frontend vityaz-frontend=${{ env.ECR_REGISTRY }}/vityaz-frontend:${{ needs.build-frontend.outputs.image-tag }} -n vityaz-production
        kubectl rollout status deployment/vityaz-backend -n vityaz-production --timeout=5m
        kubectl rollout status deployment/vityaz-frontend -n vityaz-production --timeout=5m
    
    - name: Verify deployment
      run: |
        kubectl get pods -n vityaz-production
        kubectl get services -n vityaz-production
        kubectl get ingress -n vityaz-production
    
    - name: Notify Slack
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Deployment to production ${{ job.status }}'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 8. Secrets Management

### 8.1 AWS Secrets Manager

**Create secrets:**

```bash
# Database password
aws secretsmanager create-secret \
  --name vityaz/prod/database-url \
  --description "Production database connection string" \
  --secret-string "postgresql://vityaz_admin:STRONG_PASSWORD@vityaz-db.xxxxx.us-east-1.rds.amazonaws.com:5432/vityaz"

# JWT Secret
aws secretsmanager create-secret \
  --name vityaz/prod/jwt-secret \
  --description "JWT signing key" \
  --secret-string "$(openssl rand -base64 32)"

# Encryption Key
aws secretsmanager create-secret \
  --name vityaz/prod/encryption-key \
  --description "Data encryption key" \
  --secret-string "$(openssl rand -hex 32)"

# Redis Auth Token
aws secretsmanager create-secret \
  --name vityaz/prod/redis-auth-token \
  --description "Redis authentication token" \
  --secret-string "$(openssl rand -base64 32 | tr -d '=+/')"
```

### 8.2 External Secrets Operator

**File: `k8s/external-secrets/secret-store.yaml`**

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: vityaz-production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: vityaz-secrets
  namespace: vityaz-production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: vityaz-secrets
    creationPolicy: Owner
  data:
  - secretKey: database-url
    remoteRef:
      key: vityaz/prod/database-url
  
  - secretKey: redis-url
    remoteRef:
      key: vityaz/prod/redis-url
  
  - secretKey: jwt-secret
    remoteRef:
      key: vityaz/prod/jwt-secret
  
  - secretKey: encryption-key
    remoteRef:
      key: vityaz/prod/encryption-key
  
  - secretKey: redis-auth-token
    remoteRef:
      key: vityaz/prod/redis-auth-token
```

---

## 9. Backup & Disaster Recovery

### 9.1 Automated Database Backups

**RDS automated backups are configured in terraform (7-day retention).**

**Additional manual backup script:**

**File: `scripts/backup-database.sh`**

```bash
#!/bin/bash
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BUCKET="s3://vityaz-backups"
DB_HOST="vityaz-db.xxxxx.us-east-1.rds.amazonaws.com"
DB_NAME="vityaz"
DB_USER="vityaz_admin"
BACKUP_FILE="vityaz_backup_${DATE}.sql.gz"

echo "Starting database backup..."

# Get password from AWS Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id vityaz/prod/database-password \
  --query SecretString \
  --output text)

# Create backup
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  | gzip > "/tmp/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "/tmp/${BACKUP_FILE}" "${BUCKET}/database/${BACKUP_FILE}" \
  --storage-class STANDARD_IA

# Clean up
rm "/tmp/${BACKUP_FILE}"

echo "✅ Backup complete: ${BACKUP_FILE}"

# Delete backups older than 30 days
aws s3 ls "${BUCKET}/database/" \
  | awk '{print $4}' \
  | while read file; do
    file_date=$(echo "$file" | grep -oP '\d{8}')
    file_timestamp=$(date -d "$file_date" +%s)
    current_timestamp=$(date +%s)
    diff_days=$(( ($current_timestamp - $file_timestamp) / 86400 ))
    
    if [ $diff_days -gt 30 ]; then
      echo "Deleting old backup: $file"
      aws s3 rm "${BUCKET}/database/${file}"
    fi
  done
```

**Cron job (run daily at 3 AM):**

```bash
0 3 * * * /opt/vityaz/scripts/backup-database.sh >> /var/log/vityaz-backup.log 2>&1
```

### 9.2 Disaster Recovery Plan

**Recovery Time Objective (RTO): 4 hours**  
**Recovery Point Objective (RPO): 1 hour**

#### Scenario 1: Database Failure

1. **Automatic Failover** (if Multi-AZ RDS):
   - AWS RDS automatically fails over to standby replica
   - DNS record updated automatically
   - Downtime: < 2 minutes

2. **Manual Restore from Backup**:
   ```bash
   # List available backups
   aws rds describe-db-snapshots --db-instance-identifier vityaz-db
   
   # Restore from snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier vityaz-db-restored \
     --db-snapshot-identifier vityaz-db-snapshot-20250113
   
   # Update DNS/secrets
   # Downtime: 30-60 minutes
   ```

#### Scenario 2: Complete Region Failure

**Prerequisites:**
- Cross-region replication enabled for S3
- Database snapshots copied to secondary region
- Terraform config for secondary region ready

**Recovery Steps:**

```bash
# 1. Deploy infrastructure in secondary region (eu-west-1)
cd terraform/
terraform workspace select disaster-recovery
terraform apply -var="region=eu-west-1"

# 2. Restore database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --region eu-west-1 \
  --db-instance-identifier vityaz-db \
  --db-snapshot-identifier arn:aws:rds:us-east-1:ACCOUNT:snapshot:vityaz-db-latest

# 3. Update DNS to point to new region
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://dns-failover.json

# 4. Deploy applications
kubectl apply -f k8s/ --namespace vityaz-production

# Total time: 2-4 hours
```

---

## 10. Security & Compliance

### 10.1 AWS WAF Rules

**File: `terraform/waf.tf`**

```hcl
resource "aws_wafv2_web_acl" "vityaz_waf" {
  name  = "vityaz-waf"
  scope = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  # AWS Managed Rules - Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }
  
  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }
  
  # Rate Limiting
  rule {
    name     = "RateLimitRule"
    priority = 3
    
    action {
      block {}
    }
    
    statement {
      rate_based_statement {
        limit              = 2000 # requests per 5 minutes per IP
        aggregate_key_type = "IP"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRuleMetric"
      sampled_requests_enabled   = true
    }
  }
  
  # Geo-blocking (if needed)
  rule {
    name     = "GeoBlockRule"
    priority = 4
    
    action {
      block {}
    }
    
    statement {
      geo_match_statement {
        country_codes = ["KP", "IR"] # Block North Korea, Iran (example)
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "GeoBlockRuleMetric"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "VityazWAFMetric"
    sampled_requests_enabled   = true
  }
  
  tags = {
    Name        = "vityaz-waf"
    Environment = var.environment
  }
}
```

### 10.2 Network Security Groups

**Bastion Host Security Group:**

```hcl
resource "aws_security_group" "bastion_sg" {
  name        = "vityaz-bastion-sg"
  description = "Security group for bastion host"
  vpc_id      = aws_vpc.vityaz_vpc.id
  
  ingress {
    description = "SSH from office IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_OFFICE_IP/32"] # Restrict to known IPs
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "vityaz-bastion-sg"
  }
}
```

---

## 11. Cost Optimization

### 11.1 Estimated Monthly Costs (AWS)

| Service | Configuration | Monthly Cost |
|---------|--------------|-------------|
| **EKS Cluster** | Control plane | $73 |
| **EC2 (EKS Nodes)** | 5x t3.medium (on-demand) | $185 |
| **RDS PostgreSQL** | db.t3.medium Multi-AZ | $120 |
| **ElastiCache Redis** | 2x cache.t3.medium | $100 |
| **ALB** | 1 ALB | $23 |
| **NAT Gateway** | 1 NAT Gateway | $45 + data transfer |
| **S3** | 100GB storage + requests | $10 |
| **CloudFront** | 1TB data transfer | $85 |
| **OpenSearch** | 2x t3.medium nodes | $150 |
| **Secrets Manager** | 10 secrets | $5 |
| **CloudWatch Logs** | 10GB ingestion | $5 |
| **Data Transfer** | Varies | $50-200 |
| **Total** | | **$851-1,001/month** |

### 11.2 Cost Reduction Strategies

1. **Reserved Instances / Savings Plans:**
   - 1-year commitment: 30-40% savings
   - 3-year commitment: 50-60% savings
   - Apply to: RDS, EC2, ElastiCache
   - Potential savings: $200-300/month

2. **Spot Instances for Non-Critical Workloads:**
   ```hcl
   # Add spot instance node group
   resource "aws_eks_node_group" "spot" {
     capacity_type  = "SPOT"
     instance_types = ["t3.medium", "t3a.medium", "t2.medium"]
     # 60-70% cheaper than on-demand
   }
   ```

3. **Auto-Scaling:**
   - Scale down during low traffic (nights/weekends)
   - Potential savings: 20-30%

4. **CloudFront Caching:**
   - Reduce origin requests to ALB/backend
   - Lower data transfer costs

5. **S3 Lifecycle Policies:**
   ```hcl
   resource "aws_s3_bucket_lifecycle_configuration" "vityaz_assets" {
     rule {
       id     = "archive-old-backups"
       status = "Enabled"
       
       transition {
         days          = 30
         storage_class = "STANDARD_IA" # 50% cheaper
       }
       
       transition {
         days          = 90
         storage_class = "GLACIER" # 80% cheaper
       }
     }
   }
   ```

**Optimized Monthly Cost: $500-700**

---

## 12. Deployment Checklist

### Pre-Deployment

- [ ] **AWS Account Setup**
  - [ ] Create AWS account
  - [ ] Enable billing alerts
  - [ ] Set up IAM users with MFA
  - [ ] Configure AWS CLI

- [ ] **Domain & SSL**
  - [ ] Register domain (vityaz.game)
  - [ ] Request ACM certificate
  - [ ] Configure Route53 hosted zone
  - [ ] Verify SSL certificate

- [ ] **Terraform State**
  - [ ] Create S3 bucket for Terraform state
  - [ ] Enable versioning on state bucket
  - [ ] Create DynamoDB table for state locking

### Infrastructure Deployment

- [ ] **VPC & Networking**
  - [ ] `terraform apply` for VPC
  - [ ] Verify subnets created
  - [ ] Test NAT Gateway connectivity

- [ ] **EKS Cluster**
  - [ ] `terraform apply` for EKS
  - [ ] Update kubeconfig
  - [ ] Install AWS Load Balancer Controller
  - [ ] Install External Secrets Operator
  - [ ] Install Metrics Server

- [ ] **Databases**
  - [ ] `terraform apply` for RDS
  - [ ] Run Prisma migrations
  - [ ] Seed initial data
  - [ ] Test connectivity from EKS

- [ ] **Caching**
  - [ ] `terraform apply` for ElastiCache
  - [ ] Test Redis connectivity

- [ ] **Storage**
  - [ ] Create S3 buckets
  - [ ] Configure CORS
  - [ ] Set up CloudFront distribution

### Application Deployment

- [ ] **Secrets**
  - [ ] Create all secrets in AWS Secrets Manager
  - [ ] Apply ExternalSecret resources
  - [ ] Verify secrets synced to K8s

- [ ] **Container Images**
  - [ ] Build and push backend image to ECR
  - [ ] Build and push frontend image to ECR
  - [ ] Tag images appropriately

- [ ] **Kubernetes Resources**
  - [ ] Apply namespaces
  - [ ] Apply deployments
  - [ ] Apply services
  - [ ] Apply ingress
  - [ ] Apply HPA

- [ ] **Monitoring**
  - [ ] Deploy Prometheus
  - [ ] Deploy Grafana
  - [ ] Import dashboards
  - [ ] Set up alerts

- [ ] **Logging**
  - [ ] Deploy Fluent Bit
  - [ ] Verify logs in OpenSearch
  - [ ] Create Kibana dashboards

### Post-Deployment

- [ ] **Testing**
  - [ ] Run smoke tests
  - [ ] Load testing (k6, Artillery)
  - [ ] Security scan (OWASP ZAP)
  - [ ] Verify SSL/TLS configuration

- [ ] **DNS**
  - [ ] Update DNS records to production ALB
  - [ ] Test from multiple locations
  - [ ] Verify CDN caching

- [ ] **Monitoring**
  - [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Configure PagerDuty/OpsGenie
  - [ ] Test alert notifications

- [ ] **Documentation**
  - [ ] Document runbook procedures
  - [ ] Update architecture diagrams
  - [ ] Create troubleshooting guide

- [ ] **Backup & DR**
  - [ ] Test database backup
  - [ ] Test restore procedure
  - [ ] Schedule automated backups
  - [ ] Document DR plan

---

## 13. Quick Commands

### AWS CLI

```bash
# Configure AWS CLI
aws configure

# Get EKS kubeconfig
aws eks update-kubeconfig --region us-east-1 --name vityaz-cluster

# List running EC2 instances
aws ec2 describe-instances --filters "Name=tag:Project,Values=vityaz" --query "Reservations[].Instances[].[InstanceId,State.Name,PrivateIpAddress]"

# Check RDS status
aws rds describe-db-instances --db-instance-identifier vityaz-db

# Get secret value
aws secretsmanager get-secret-value --secret-id vityaz/prod/jwt-secret --query SecretString --output text
```

### Kubectl

```bash
# Get all resources
kubectl get all -n vityaz-production

# Check pod logs
kubectl logs -f deployment/vityaz-backend -n vityaz-production

# Exec into pod
kubectl exec -it deployment/vityaz-backend -n vityaz-production -- /bin/sh

# Port forward for local testing
kubectl port-forward service/vityaz-backend-service 3001:3001 -n vityaz-production

# Restart deployment
kubectl rollout restart deployment/vityaz-backend -n vityaz-production

# Scale deployment
kubectl scale deployment/vityaz-backend --replicas=5 -n vityaz-production
```

### Terraform

```bash
# Initialize
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy resources (DANGEROUS!)
terraform destroy

# Import existing resource
terraform import aws_eks_cluster.vityaz vityaz-cluster
```

---

## 14. Support & Resources

### Useful Links

- **AWS Documentation:** https://docs.aws.amazon.com/
- **Kubernetes Docs:** https://kubernetes.io/docs/
- **Terraform AWS Provider:** https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **EKS Best Practices:** https://aws.github.io/aws-eks-best-practices/
- **Prometheus Operator:** https://github.com/prometheus-operator/prometheus-operator

### Troubleshooting

**Common Issues:**

1. **Pods not starting:**
   ```bash
   kubectl describe pod <pod-name> -n vityaz-production
   kubectl logs <pod-name> -n vityaz-production --previous
   ```

2. **Database connection errors:**
   - Check security groups
   - Verify secrets are correct
   - Test connectivity: `telnet <rds-endpoint> 5432`

3. **High latency:**
   - Check Prometheus metrics
   - Review application logs
   - Analyze database slow queries
   - Check Redis cache hit rate

4. **Out of memory:**
   - Increase resource limits in deployment
   - Scale horizontally (more pods)
   - Optimize application code

---

**Status:** 🟢 Production-Ready Infrastructure  
**Last Updated:** December 13, 2025  
**Maintained By:** VITYAZ DevOps Team  
**Next Review:** January 13, 2026
