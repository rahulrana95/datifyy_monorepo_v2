# Datifyy Monorepo

A production-ready containerized monorepo with React frontend, Go backend, PostgreSQL database, Redis cache, and Protocol Buffers for type-safe communication.

## 🚀 Features

- **Full-Stack Development Environment** - React + Go + PostgreSQL + Redis
- **Hot Reload** - Automatic reload for both frontend (React) and backend (Go with Air)
- **Type Safety** - Protocol Buffers for API contracts
- **Database Ready** - PostgreSQL with migrations and Redis for caching
- **Testing Support** - Separate test environment with isolated databases
- **DevContainer Support** - VS Code development inside containers
- **Production Ready** - Separate development and production Docker configurations

## 📋 Prerequisites

- Docker Desktop installed and running
- Git
- Make (optional, for using helper commands)

## 🏃 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd datifyy_monorepo_v2
   ```

2. **Start Docker Desktop** if not already running

3. **Start all services:**
   ```bash
   make up
   ```
   
   Or without make:
   ```bash
   docker-compose up -d
   ```

4. **Check service status:**
   ```bash
   make status
   ```

5. **Access the applications:**
   - 🌐 Frontend: http://localhost:3000
   - 🔧 Backend API: http://localhost:8080
   - 🗄️ PostgreSQL: localhost:5432 (user: devuser, pass: devpass, db: monorepo_dev)
   - 📦 Redis: localhost:6379

## 🏗️ Project Structure

```
.
├── apps/
│   ├── backend/             # Go backend application
│   │   ├── cmd/server/      # Main server entry point
│   │   ├── migrations/      # Database migrations
│   │   └── gen/             # Generated protobuf files
│   └── frontend/            # React frontend application
│       ├── src/
│       │   └── gen/         # Generated protobuf TypeScript files
│       └── nginx.conf       # Production nginx configuration
├── proto/                   # Protocol buffer definitions
├── docker/                  # Docker configurations
│   ├── backend/            # Backend Dockerfiles (dev & prod)
│   ├── frontend/           # Frontend Dockerfiles (dev & prod)
│   └── proto/              # Proto generation Dockerfile
├── scripts/                # Utility scripts
│   └── init-db.sql         # Database initialization
├── .devcontainer/          # VS Code DevContainer configuration
├── docker-compose.yml      # Local development setup
├── docker-compose.test.yml # Testing environment setup
├── Makefile                # Helper commands
├── .env                    # Environment variables
└── .dockerignore           # Docker ignore rules
```

## 📡 API Endpoints

### Backend Health Endpoints
- `GET /health` - Basic health check
- `GET /ready` - Readiness check (validates DB and Redis connections)
- `GET /` - Service information with connection status
- `GET /api/test-db` - Test PostgreSQL connection
- `GET /api/test-redis` - Test Redis connection

## 🗄️ Database & Cache

### PostgreSQL
The backend automatically connects to PostgreSQL running in a container. The connection is configured via environment variables and includes:
- Connection pooling
- Automatic retries on startup
- Health checks
- Migration support

### Redis
Redis is configured for caching and session storage:
- Automatic connection on startup
- Connection retries
- Health checks
- Persistence in development, memory-only for tests

### Database Migrations
Migrations are located in `apps/backend/migrations/` and run automatically on container startup.

## 🔧 Development Workflow

### Starting Development
```bash
# Start all services with logs
make dev

# Or start in background
make up

# Check status
make status
```

### Database Operations
```bash
# Reset database (drops and recreates)
make db-reset

# Run migrations
make db-migrate

# Seed with sample data
make db-seed

# Open PostgreSQL console
make db-console

# Open Redis CLI
make redis-cli
```

### Making Changes

#### Backend Changes
- Edit Go files in `apps/backend/`
- Changes auto-reload via Air
- View logs: `make logs-backend`

#### Frontend Changes
- Edit React files in `apps/frontend/`
- Changes auto-reload via Create React App
- View logs: `make logs-frontend`

#### Protocol Buffer Changes
1. Edit `.proto` files in `proto/`
2. Generate types: `make generate`
3. Types are generated in:
   - Backend: `apps/backend/gen/`
   - Frontend: `apps/frontend/src/gen/`

### Adding Dependencies

#### Backend (Go):
```bash
make shell-backend
go get <package-name>
```

#### Frontend (npm):
```bash
make shell-frontend
npm install <package-name>
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Backend Tests
```bash
# Unit tests
make test-backend

# Integration tests with test database
make test-integration
```

### Frontend Tests
```bash
make test-frontend
```

### Test Database
A separate test environment is available with isolated PostgreSQL and Redis instances:
```bash
# Start test database (port 5433) and Redis (port 6380)
make test-db

# Stop test database
make test-db-down
```

## 📚 Available Commands

```bash
make help               # Show all available commands

# Service Management
make up                 # Start all services
make down               # Stop all services
make restart            # Restart all services
make status             # Check service health
make ps                 # Show running containers
make dev                # Start development with logs

# Logs
make logs               # View all logs
make logs-backend       # View backend logs
make logs-frontend      # View frontend logs

# Database
make db-reset           # Reset database
make db-migrate         # Run migrations
make db-seed            # Seed database
make db-console         # Open PostgreSQL console
make redis-cli          # Open Redis CLI

# Testing
make test               # Run all tests
make test-backend       # Run backend tests
make test-frontend      # Run frontend tests
make test-integration   # Run integration tests
make test-db            # Start test database
make test-db-down       # Stop test database

# Development
make generate           # Generate proto types
make shell-backend      # Open backend shell
make shell-frontend     # Open frontend shell
make shell-db           # Open database shell

# Maintenance
make clean              # Remove all containers and volumes
make prune              # Remove unused Docker resources
```

## 🔐 Environment Variables

Environment variables are configured in `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgres://devuser:devpass@localhost:5432/monorepo_dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=devuser
DB_PASSWORD=devpass
DB_NAME=monorepo_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Backend Configuration
PORT=8080
ENV=development

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080

# Test Environment
TEST_DATABASE_URL=postgres://testuser:testpass@localhost:5433/monorepo_test
TEST_REDIS_URL=redis://localhost:6380
```

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
# Run unit tests
make test-backend

# Run integration tests with test database
make test-integration

# Run tests locally without Docker
cd apps/backend
go test ./...
go test -tags=integration ./tests
```

#### Frontend Tests
```bash
# Run frontend tests
make test-frontend

# Run tests locally without Docker
cd apps/frontend
npm test

# Run tests with coverage
npm test -- --coverage
```

### Test Files
- Backend unit tests: `apps/backend/cmd/server/main_test.go`
- Backend integration tests: `apps/backend/tests/integration_test.go`
- Frontend tests: `apps/frontend/src/App.test.js`

## 🚢 Production Deployment

### Docker Deployment

#### Build Production Images
```bash
# Backend
docker build -f docker/backend/Dockerfile.prod -t datifyy-backend:prod .

# Frontend
docker build -f docker/frontend/Dockerfile.prod -t datifyy-frontend:prod .
```

#### Production Features
- Multi-stage builds for smaller images
- Nginx for frontend serving
- Optimized Go binary
- Health checks configured
- Security headers in nginx

### Vercel Deployment

Both frontend and backend can be deployed to Vercel for serverless hosting.

#### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Set up environment variables in Vercel Dashboard

#### Deploy Frontend to Vercel

1. **Navigate to frontend directory:**
   ```bash
   cd apps/frontend
   ```

2. **Configure environment variables in Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `REACT_APP_API_URL` with your backend API URL

3. **Deploy:**
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

4. **Configuration details (`apps/frontend/vercel.json`):**
   - Automatic build command: `npm run build`
   - Output directory: `build`
   - SPA routing configured
   - Environment variables mapped

#### Deploy Backend to Vercel

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Configure environment variables in Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add required variables:
     - `DATABASE_URL`: PostgreSQL connection string (use Vercel Postgres or external DB)
     - `REDIS_URL`: Redis connection string (use Upstash Redis or external)
     - `ENV`: Set to "production"

3. **Deploy:**
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

4. **Configuration details (`apps/backend/vercel.json`):**
   - Go serverless functions configured
   - API routes at `/api/*`
   - Environment variables mapped
   - CORS enabled

5. **Vercel-specific handler (`apps/backend/api/index.go`):**
   - Serverless function entry point
   - Handles all API routes
   - Database and Redis connections managed

#### Using the Deployment Script

A helper script is provided for easier deployment:

```bash
# Make script executable (first time only)
chmod +x scripts/deploy-vercel.sh

# Deploy frontend only
./scripts/deploy-vercel.sh frontend

# Deploy backend only
./scripts/deploy-vercel.sh backend

# Deploy both to production
./scripts/deploy-vercel.sh all production
```

#### Database Options for Vercel

1. **Vercel Postgres** (Recommended for Vercel):
   - Create in Vercel Dashboard → Storage → Create Database
   - Automatically provides `DATABASE_URL`

2. **External PostgreSQL**:
   - Use services like Supabase, Neon, or Railway
   - Add connection string as environment variable

3. **Redis Options**:
   - **Upstash Redis** (Recommended for Vercel)
   - **Redis Cloud** or other external Redis services

#### Post-Deployment

1. **Update Frontend API URL:**
   - Set `REACT_APP_API_URL` to your deployed backend URL
   - Example: `https://your-backend.vercel.app`

2. **Test endpoints:**
   ```bash
   # Test backend
   curl https://your-backend.vercel.app/health
   curl https://your-backend.vercel.app/api/test-db
   
   # Frontend should be accessible at
   # https://your-frontend.vercel.app
   ```

3. **Monitor logs:**
   - View logs in Vercel Dashboard → Functions → Logs
   - Or use CLI: `vercel logs`

#### CI/CD with Vercel

Vercel automatically deploys when you push to GitHub:

1. Connect your GitHub repository in Vercel Dashboard
2. Configure build settings for monorepo:
   - Root Directory: `apps/frontend` or `apps/backend`
   - Build Command: Auto-detected from `vercel.json`
3. Every push to main deploys to production
4. Pull requests create preview deployments

## 💻 VS Code Development

This project includes DevContainer configuration for VS Code:

1. Install the "Dev Containers" extension
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted
4. VS Code will open inside the development container

### Included Extensions
- Go language support
- ESLint and Prettier
- Docker support
- Protocol Buffer support
- GitLens
- GitHub Copilot

## 🐛 Troubleshooting

### Docker daemon not running
```bash
# Mac: Open Docker Desktop from Applications
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop
```

### Port already in use
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9

# Or change the port in docker-compose.yml
```

### Database connection issues
```bash
# Reset the database
make db-reset

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection string in .env
```

### Permission issues
```bash
# Fix file ownership
sudo chown -R $USER:$USER .
```

### Clean slate start
```bash
# Remove everything and start fresh
make clean
make build
make up
```

### Docker build errors

#### Go version incompatibility with Air
```bash
# Error: Air requires go >= 1.22
# Solution: Use compatible Air version in docker/backend/Dockerfile.dev
RUN go install github.com/cosmtrek/air@v1.45.0
```

#### npm ci failures
```bash
# Error: package-lock.json out of sync
# Solution: Use npm install instead of npm ci in development
# Update docker/frontend/Dockerfile.dev:
RUN npm install
```

### Docker permissions error
```bash
# Error: permission denied on ~/.docker/buildx/activity/desktop-linux
# Fix ownership of Docker buildx directory
sudo chown -R $(whoami):staff ~/.docker/buildx/

# Or remove and recreate
rm -rf ~/.docker/buildx/
docker buildx prune -a
```

### Frontend can't connect to backend

#### CORS Issues
```bash
# Error: net::ERR_NAME_NOT_RESOLVED or CORS blocked
# The frontend is trying to reach http://backend:8080

# Solution 1: Update docker-compose.yml
# Change REACT_APP_API_URL from http://backend:8080 to http://localhost:8080

# Solution 2: Rebuild frontend container to pick up new env variables
docker-compose down frontend
docker-compose build frontend
docker-compose up -d frontend

# Solution 3: Force hard refresh in browser
# Mac: Cmd+Shift+R
# Windows/Linux: Ctrl+Shift+R

# Solution 4: Check environment variables
docker-compose exec frontend printenv | grep REACT_APP
```

#### Backend not accessible
```bash
# Verify backend is running and healthy
curl http://localhost:8080/health

# Check backend logs for errors
docker-compose logs backend

# Ensure CORS is enabled in backend
# The backend should have CORS middleware allowing requests from localhost:3000
```

### Services not starting
```bash
# Check all services status
docker-compose ps

# View logs for specific service
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>

# Rebuild and restart a service
docker-compose build <service-name> && docker-compose up -d <service-name>
```

## 📈 Monitoring

### Check Service Health
```bash
# Quick status check
make status

# Detailed health endpoints
curl http://localhost:8080/health
curl http://localhost:8080/ready
curl http://localhost:8080/api/test-db
curl http://localhost:8080/api/test-redis
```

### View Logs
```bash
# All services
make logs

# Specific service
docker-compose logs -f <service-name>
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `make test`
4. Ensure code quality
5. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

For issues and questions, please open an issue in the repository.

---

**Happy Coding!** 🚀