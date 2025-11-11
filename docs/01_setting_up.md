# Containerized Development Setup for React + Go + Protocol Buffers

**Complete Docker & DevContainer Configuration for Consistent Development**

*Extension to: Building a Type-Safe Monorepo Guide*

---

## Table of Contents

1. [Why Containerize Development?](#why-containerize-development)
2. [Architecture Overview](#architecture-overview)
3. [Docker Setup](#docker-setup)
4. [Docker Compose for Local Development](#docker-compose-for-local-development)
5. [VS Code DevContainer](#vs-code-devcontainer)
6. [Development Workflow](#development-workflow)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Why Containerize Development?

### The Problems We Solve

**Without Containers:**
- ❌ "Works on my machine" syndrome
- ❌ Complex onboarding (install Node, Go, Buf, etc.)
- ❌ Version conflicts between projects
- ❌ Different dev/prod environments

**With Containers:**
- ✅ **Consistent environment** - Same setup for all developers
- ✅ **Fast onboarding** - New devs productive in minutes
- ✅ **Isolated dependencies** - No conflicts between projects
- ✅ **Dev/prod parity** - Same images from dev to production
- ✅ **Easy cleanup** - Delete containers, no leftover dependencies

---

## Architecture Overview

### Container Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │   proto-gen      │  │    backend       │  │  frontend  ││
│  │  (buf generate)  │  │   (Go server)    │  │ (CRA dev)  ││
│  │                  │  │                  │  │            ││
│  │  • Buf CLI       │  │  • Go 1.21       │  │ • Node 18  ││
│  │  • Proto files   │  │  • Hot reload    │  │ • Hot HMR  ││
│  │  • Generates:    │  │  • Port 8080     │  │ • Port 3000││
│  │    - Go types    │  │                  │  │            ││
│  │    - TS types    │  │                  │  │            ││
│  └──────────────────┘  └──────────────────┘  └────────────┘│
│           │                      │                    │      │
│           └──────────────────────┴────────────────────┘      │
│                         Shared Volumes:                      │
│                    • ./proto (source)                        │
│                    • ./apps/backend/gen (generated)          │
│                    • ./apps/frontend/src/gen (generated)     │
└─────────────────────────────────────────────────────────────┘
```

### Three-Container Approach

1. **proto-gen** - Runs Buf to generate types (runs once or on-demand)
2. **backend** - Go API server with hot reload
3. **frontend** - React dev server with HMR

---

## Docker Setup

### Project Structure

```
my-monorepo/
├── .devcontainer/
│   └── devcontainer.json           # VS Code DevContainer config
├── docker/
│   ├── backend/
│   │   ├── Dockerfile.dev          # Development image
│   │   └── Dockerfile.prod         # Production image
│   ├── frontend/
│   │   ├── Dockerfile.dev          # Development image
│   │   └── Dockerfile.prod         # Production image
│   └── proto/
│       └── Dockerfile              # Buf CLI image
├── docker-compose.yml              # Local development
├── docker-compose.prod.yml         # Production deployment
└── Makefile                        # Helper commands
```

### 1. Proto Generation Container

**`docker/proto/Dockerfile`:**

```dockerfile
FROM bufbuild/buf:latest AS buf

WORKDIR /workspace

# Copy proto files
COPY proto/ ./proto/

# Install dependencies if needed
RUN cd proto && buf mod update

# Generate command will be run via docker-compose
CMD ["buf", "generate", "proto"]
```

### 2. Backend Development Container

**`docker/backend/Dockerfile.dev`:**

```dockerfile
FROM golang:1.21-alpine AS development

# Install development tools
RUN apk add --no-cache \
    git \
    make \
    curl \
    bash

# Install Air for hot reload
RUN go install github.com/cosmtrek/air@latest

WORKDIR /app

# Copy go mod files first (for caching)
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download

# Copy the rest of the code
COPY apps/backend/ ./

# Expose port
EXPOSE 8080

# Use Air for hot reload
CMD ["air", "-c", ".air.toml"]
```

**`apps/backend/.air.toml`:**

```toml
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/server"
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata", "gen"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  include_file = []
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_error = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = false

[screen]
  clear_on_rebuild = false
  keep_scroll = true
```

### 3. Frontend Development Container

**`docker/frontend/Dockerfile.dev`:**

```dockerfile
FROM node:18-alpine AS development

# Install bash for scripts
RUN apk add --no-cache bash

WORKDIR /app

# Copy package files first (for caching)
COPY apps/frontend/package*.json ./
RUN npm ci

# Copy the rest of the code
COPY apps/frontend/ ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Start dev server
CMD ["npm", "start"]
```

### 4. Production Containers

**`docker/backend/Dockerfile.prod`:**

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download

# Copy source code
COPY apps/backend/ ./

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
```

**`docker/frontend/Dockerfile.prod`:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY apps/frontend/package*.json ./
RUN npm ci

# Copy source
COPY apps/frontend/ ./

# Build app
RUN npm run build

# Runtime stage with nginx
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Docker Compose for Local Development

### Main docker-compose.yml

**`docker-compose.yml`:**

```yaml
version: '3.8'

services:
  # Proto generation service
  proto-gen:
    build:
      context: .
      dockerfile: docker/proto/Dockerfile
    volumes:
      - ./proto:/workspace/proto:ro
      - ./apps/backend/gen:/workspace/apps/backend/gen
      - ./apps/frontend/src/gen:/workspace/apps/frontend/src/gen
    command: buf generate proto
    profiles:
      - tools

  # Backend service
  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./apps/backend:/app
      - backend-cache:/go/pkg/mod
    environment:
      - ENV=development
      - PORT=8080
    depends_on:
      - postgres
    networks:
      - app-network
    restart: unless-stopped

  # Frontend service
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://backend:8080
      - CHOKIDAR_USEPOLLING=true
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped
    stdin_open: true
    tty: true

  # PostgreSQL database
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=devuser
      - POSTGRES_PASSWORD=devpass
      - POSTGRES_DB=monorepo_dev
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching (optional)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

networks:
  app-network:
    driver: bridge

volumes:
  backend-cache:
  postgres-data:
  redis-data:
```

### Helper Makefile

**`Makefile`:**

```makefile
.PHONY: help build up down logs clean generate db-reset

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all containers
	docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"
	@echo "Postgres: localhost:5432"
	@echo "Redis:    localhost:6379"

down: ## Stop all services
	docker-compose down

restart: down up ## Restart all services

logs: ## Tail logs from all services
	docker-compose logs -f

logs-backend: ## Tail logs from backend only
	docker-compose logs -f backend

logs-frontend: ## Tail logs from frontend only
	docker-compose logs -f frontend

generate: ## Generate proto types
	docker-compose run --rm proto-gen
	@echo "Proto types generated!"

db-reset: ## Reset database
	docker-compose down -v postgres
	docker-compose up -d postgres
	@echo "Database reset!"

clean: ## Remove all containers, volumes, and generated files
	docker-compose down -v
	rm -rf apps/backend/gen apps/frontend/src/gen
	@echo "Cleaned up!"

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-db: ## Open psql shell
	docker-compose exec postgres psql -U devuser -d monorepo_dev

test-backend: ## Run backend tests
	docker-compose exec backend go test ./...

test-frontend: ## Run frontend tests
	docker-compose exec frontend npm test

install-frontend: ## Install frontend dependencies
	docker-compose exec frontend npm install

install-backend: ## Install backend dependencies
	docker-compose exec backend go mod download

ps: ## Show running containers
	docker-compose ps

prune: ## Remove unused Docker resources
	docker system prune -af --volumes
	@echo "Docker system pruned!"
```

---

## VS Code DevContainer

### DevContainer Configuration

**`.devcontainer/devcontainer.json`:**

```json
{
  "name": "Monorepo Dev Environment",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "backend",
  "workspaceFolder": "/app",
  
  "customizations": {
    "vscode": {
      "extensions": [
        "golang.go",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker",
        "bufbuild.vscode-buf",
        "eamodio.gitlens",
        "github.copilot"
      ],
      "settings": {
        "go.useLanguageServer": true,
        "go.toolsManagement.autoUpdate": true,
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
          "source.organizeImports": true
        },
        "[go]": {
          "editor.defaultFormatter": "golang.go"
        },
        "[typescript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "[typescriptreact]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        }
      }
    }
  },
  
  "forwardPorts": [3000, 8080, 5432, 6379],
  "portsAttributes": {
    "3000": {
      "label": "Frontend",
      "onAutoForward": "notify"
    },
    "8080": {
      "label": "Backend",
      "onAutoForward": "notify"
    },
    "5432": {
      "label": "PostgreSQL",
      "onAutoForward": "silent"
    },
    "6379": {
      "label": "Redis",
      "onAutoForward": "silent"
    }
  },
  
  "postCreateCommand": "make generate",
  
  "remoteUser": "root"
}
```

### Multi-Container DevContainer

For working with both frontend and backend simultaneously:

**`.devcontainer/devcontainer.json` (alternative):**

```json
{
  "name": "Full Stack Dev Environment",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "backend",
  "workspaceFolder": "/workspace",
  
  "initializeCommand": "docker-compose -f docker-compose.yml up -d",
  
  "customizations": {
    "vscode": {
      "extensions": [
        "golang.go",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-azuretools.vscode-docker",
        "bufbuild.vscode-buf"
      ]
    }
  },
  
  "forwardPorts": [3000, 8080, 5432],
  
  "postCreateCommand": "make generate && make up",
  
  "remoteUser": "root"
}
```

---

## Development Workflow

### Day 1: Getting Started

**Clone and start:**

```bash
# Clone repository
git clone <your-repo>
cd my-monorepo

# Start everything
make up

# Generate proto types
make generate

# Open in browser
open http://localhost:3000
```

That's it! No need to install Node, Go, or Buf.

### Daily Development

**Start your day:**

```bash
# Start all services
make up

# Watch logs
make logs
```

**Make changes:**

1. **Change a proto file** → Run `make generate`
2. **Backend code changes** → Auto-reloads via Air
3. **Frontend code changes** → Auto-reloads via CRA HMR

**Debugging:**

```bash
# Check service status
make ps

# View specific logs
make logs-backend
make logs-frontend

# Open shell in container
make shell-backend
make shell-frontend

# Reset database
make db-reset
```

**End your day:**

```bash
# Stop all services
make down

# Or keep them running
# (containers restart automatically on reboot)
```

### Working with Database

**Access PostgreSQL:**

```bash
# Using make
make shell-db

# Or directly
docker-compose exec postgres psql -U devuser -d monorepo_dev
```

**Run migrations:**

```bash
# In backend container
make shell-backend
go run cmd/migrate/main.go up
```

### Testing

**Run tests:**

```bash
# Backend tests
make test-backend

# Frontend tests
make test-frontend

# Or enter container and run
make shell-backend
go test -v ./...
```

### Installing Dependencies

**Add npm package:**

```bash
# Option 1: Use make
make shell-frontend
npm install <package-name>

# Option 2: Direct command
docker-compose exec frontend npm install <package-name>
```

**Add Go package:**

```bash
# Option 1: Use make
make shell-backend
go get <package-name>

# Option 2: Direct command
docker-compose exec backend go get <package-name>
```

---

## Production Deployment

### Production Docker Compose

**`docker-compose.prod.yml`:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge
```

### Kubernetes Deployment

**`k8s/backend-deployment.yaml`:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
  type: LoadBalancer
```

**`k8s/frontend-deployment.yaml`:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

### CI/CD Pipeline

**`.github/workflows/docker-build.yml`:**

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        service: [backend, frontend]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: docker/${{ matrix.service }}/Dockerfile.prod
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          # E.g., kubectl apply, helm upgrade, etc.
          echo "Deploying to production..."
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Port Already in Use

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solution:**

```bash
# Find what's using the port
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

#### Issue 2: Permission Denied on Generated Files

**Error:**
```
Permission denied: /app/gen/api/v1/user_pb.go
```

**Solution:**

```bash
# Fix ownership
sudo chown -R $USER:$USER apps/backend/gen apps/frontend/src/gen

# Or add to docker-compose.yml
user: "${UID}:${GID}"
```

#### Issue 3: Changes Not Reflected

**Frontend:**

```bash
# Ensure polling is enabled in Dockerfile.dev
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Restart container
docker-compose restart frontend
```

**Backend:**

```bash
# Check Air is running
docker-compose logs backend

# Ensure .air.toml excludes gen/ directory
exclude_dir = ["gen", "tmp", "vendor"]
```

#### Issue 4: Out of Memory

**Error:**
```
npm ERR! errno 137
npm ERR! Exit status 137
```

**Solution:**

Increase Docker memory limit:

```bash
# Docker Desktop: Settings → Resources → Memory (increase to 4GB+)

# Or add to docker-compose.yml
frontend:
  deploy:
    resources:
      limits:
        memory: 4G
```

#### Issue 5: Proto Generation Fails

**Error:**
```
buf: plugin protoc-gen-go: not found
```

**Solution:**

```bash
# Rebuild proto-gen container
docker-compose build proto-gen

# Or run with proper path
docker-compose run --rm proto-gen sh -c "export PATH=$PATH:/go/bin && buf generate proto"
```

#### Issue 6: Database Connection Refused

**Error:**
```
dial tcp 127.0.0.1:5432: connect: connection refused
```

**Solution:**

```bash
# Use service name, not localhost
DATABASE_URL=postgres://devuser:devpass@postgres:5432/monorepo_dev

# Wait for postgres to be ready
depends_on:
  postgres:
    condition: service_healthy
```

### Performance Tips

**Speed up builds:**

```dockerfile
# Use build cache effectively
COPY package*.json ./
RUN npm ci
COPY . .

# Multi-stage builds
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
```

**Reduce image size:**

```dockerfile
# Use alpine images
FROM node:18-alpine
FROM golang:1.21-alpine

# Use .dockerignore
node_modules
.git
*.log
dist
build
```

**`.dockerignore`:**

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
dist
build
coverage
.vscode
.idea
*.swp
.DS_Store
README.md
Makefile
docker-compose*.yml
```

---

## Quick Reference

### Most Used Commands

```bash
# Start everything
make up

# Stop everything
make down

# View logs
make logs

# Generate proto types
make generate

# Reset database
make db-reset

# Run tests
make test-backend
make test-frontend

# Open shells
make shell-backend
make shell-frontend
make shell-db

# Clean everything
make clean
```

### Environment Variables

**`.env` (for docker-compose):**

```bash
# Database
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devpass
POSTGRES_DB=monorepo_dev

# Redis
REDIS_URL=redis://redis:6379

# Backend
PORT=8080
ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:8080
```

### Health Checks

**Backend:**

```go
// cmd/server/main.go
mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
})

mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
    // Check database connection
    if err := db.Ping(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("READY"))
})
```

**Docker Compose:**

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Conclusion

### What You've Built

✅ **Consistent development environment** - Same for all team members  
✅ **One-command setup** - `make up` and you're coding  
✅ **Isolated dependencies** - No conflicts between projects  
✅ **Hot reload everywhere** - Changes reflect instantly  
✅ **Production-ready containers** - Same images from dev to prod  
✅ **Easy debugging** - Shell access, logs, database access  
✅ **CI/CD ready** - Docker builds in GitHub Actions  

### Team Onboarding

**New developer setup (< 5 minutes):**

```bash
# 1. Install prerequisites
# - Docker Desktop
# - Git
# - VS Code (optional)

# 2. Clone and start
git clone <repo>
cd my-monorepo
make up

# 3. Generate types
make generate

# 4. Start coding!
code .
```

### Next Steps

1. **Add more services** - Message queue, object storage, etc.
2. **Implement monitoring** - Prometheus, Grafana
3. **Add E2E tests** - Cypress in container
4. **Set up staging** - Deploy to staging environment
5. **Implement secrets management** - Vault, AWS Secrets Manager

### Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **DevContainers**: https://code.visualstudio.com/docs/devcontainers/containers
- **Air (Go hot reload)**: https://github.com/cosmtrek/air
- **Example Repository**: [Your GitHub repo with complete setup]

---

**End of Containerized Development Guide**

*This is a companion guide to "Building a Type-Safe Monorepo: React TypeScript + Go + Protocol Buffers"*

*Last updated: November 2025*