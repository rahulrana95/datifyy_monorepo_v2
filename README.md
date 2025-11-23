# Datifyy Monorepo

A production-ready AI-powered dating platform with React frontend, Go backend, PostgreSQL database, Redis cache, and Protocol Buffers for type-safe communication.

## 🚀 Features

- **AI-Powered Matching** - Google Gemini 2.5-flash integration for intelligent compatibility analysis
- **Comprehensive Admin Dashboard** - User management, analytics, AI-powered date curation
- **Slack Integration** - Real-time notifications for user events, admin activities, and system alerts
- **Full-Stack Development Environment** - React + Go + PostgreSQL + Redis
- **Hot Reload** - Automatic reload for both frontend (React) and backend (Go with Air)
- **Type Safety** - Protocol Buffers for API contracts with 100+ endpoints (38 HTTP REST + 66 gRPC)
- **Dual API Architecture** - Both HTTP/REST (port 8080) and gRPC (port 9090) servers
- **Database Ready** - PostgreSQL with 8 migrations and Redis for caching
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

3. **Generate proto types** (first time after clone):
   ```bash
   make generate
   ```
   Note: Generated files are not committed to git and need to be created locally.

4. **Start all services:**
   ```bash
   make up
   ```
   
   Or without make:
   ```bash
   docker-compose up -d
   ```

5. **Check service status:**
   ```bash
   make status
   ```

5. **Access the applications:**
   - 🌐 Frontend: http://localhost:3000
   - 👤 User Pages: http://localhost:3000/profile, /partner-preferences, /availability
   - 🔐 Admin Dashboard: http://localhost:3000/admin
   - 💝 AI Date Curation: http://localhost:3000/admin/curate
   - 🔧 Backend HTTP API: http://localhost:8080
   - 🚀 Backend gRPC API: localhost:9090
   - 🗄️ PostgreSQL: localhost:5432 (user: devuser, pass: devpass, db: monorepo_dev)
   - 📦 Redis: localhost:6379

6. **Test the APIs:**
   ```bash
   # REST API
   curl http://localhost:8080/health

   # Buf Studio (recommended - official modern UI)
   # Terminal 1: Start the agent
   make buf-studio-agent
   # Terminal 2: Open Buf Studio and connect to http://localhost:8081
   make buf-studio

   # Or use grpcui
   make grpc-ui

   # Or use the browser test page
   open grpc-test.html
   ```

## 🏗️ Project Structure

```
.
├── apps/
│   ├── backend/                    # Go backend application
│   │   ├── cmd/server/             # Main server entry point
│   │   │   └── main.go             # HTTP & gRPC server setup (2,500+ lines)
│   │   ├── internal/               # Private application code
│   │   │   ├── service/            # Business logic layer
│   │   │   │   ├── auth_service.go          # Authentication service
│   │   │   │   ├── user_service.go          # User profile service
│   │   │   │   ├── admin_service.go         # Admin operations service
│   │   │   │   ├── availability_service.go  # User availability management
│   │   │   │   ├── dates_service.go         # AI-powered date curation
│   │   │   │   └── ai_*.go                  # AI/Gemini integration
│   │   │   ├── auth/               # JWT, session management
│   │   │   ├── email/              # Email service (MailerSend)
│   │   │   └── repository/         # Data access layer (6 repositories)
│   │   │       ├── user_repository.go
│   │   │       ├── session_repository.go
│   │   │       ├── admin_repository.go
│   │   │       ├── availability_repository.go
│   │   │       ├── dates_repository.go
│   │   │       └── curated_matches_repository.go
│   │   ├── gen/                    # Generated protobuf files
│   │   │   ├── auth/v1/            # Auth service definitions
│   │   │   ├── user/v1/            # User service definitions
│   │   │   ├── admin/v1/           # Admin service definitions
│   │   │   ├── availability/v1/    # Availability service definitions
│   │   │   ├── dates/v1/           # Dates service definitions
│   │   │   └── common/v1/          # Shared types
│   │   ├── migrations/             # Database migrations (8 files)
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_sessions.sql
│   │   │   ├── 003_add_admin_tables.sql
│   │   │   ├── 004_add_availability.sql
│   │   │   ├── 005_add_preferences.sql
│   │   │   ├── 006_add_dates_tables.sql
│   │   │   ├── 007_add_curated_matches.sql
│   │   │   └── 008_add_user_fields.sql
│   │   ├── api/                    # REST endpoint wrappers (Vercel)
│   │   └── tests/                  # Integration tests
│   └── frontend/                   # React frontend application
│       ├── src/
│       │   ├── gen/                # Generated protobuf TypeScript files
│       │   ├── pages/              # Page components
│       │   │   ├── LandingPage/
│       │   │   ├── ProfilePage/
│       │   │   ├── PartnerPreferencesPage/
│       │   │   ├── AvailabilityPage/
│       │   │   └── Admin/          # Admin dashboard
│       │   │       ├── Login/
│       │   │       ├── Analytics/
│       │   │       ├── Users/
│       │   │       ├── UserDetails/
│       │   │       ├── CurateDates/ # AI-powered date curation UI
│       │   │       ├── Profile/
│       │   │       ├── Admins/
│       │   │       └── Genie/
│       │   ├── components/         # Reusable components
│       │   ├── services/           # API client services
│       │   └── providers/          # Context providers
│       └── nginx.conf              # Production nginx configuration
├── proto/                          # Protocol buffer definitions
│   ├── auth/v1/                    # Auth service proto files
│   ├── user/v1/                    # User service proto files
│   ├── admin/v1/                   # Admin service proto files
│   ├── availability/v1/            # Availability service proto files
│   ├── dates/v1/                   # Dates service proto files
│   └── common/v1/                  # Shared type definitions
├── docker/                         # Docker configurations
│   ├── backend/                    # Backend Dockerfiles (dev & prod)
│   ├── frontend/                   # Frontend Dockerfiles (dev & prod)
│   └── proto/                      # Proto generation Dockerfile
├── docs/                           # Documentation
│   ├── BACKEND_ARCHITECTURE.md     # Comprehensive backend guide (2,043 lines)
│   ├── DEVELOPMENT.md              # Development guide
│   ├── TESTING.md                  # Testing guidelines
│   └── GRPC_TESTING.md             # gRPC testing tools
├── scripts/                        # Utility scripts
├── .devcontainer/                  # VS Code DevContainer configuration
├── docker-compose.yml              # Local development setup
├── docker-compose.test.yml         # Testing environment setup
├── Makefile                        # Helper commands
└── .env                            # Environment variables
```

## 📡 API Architecture

### Dual Server Design
The backend runs **two servers simultaneously**:

1. **HTTP/REST Server** (Port 8080)
   - RESTful endpoints with JSON
   - CORS enabled for browser access
   - Manual REST wrappers for gRPC services

2. **gRPC Server** (Port 9090)
   - High-performance RPC protocol
   - Server reflection enabled
   - Type-safe Protocol Buffers

### API Endpoints

The platform provides **104 endpoints total**:
- **38 HTTP REST endpoints** (port 8080) - JSON-based API for web/mobile clients
- **66 gRPC RPCs** (port 9090) - High-performance typed API

#### HTTP REST Endpoints (38 Total)

**Health & Diagnostics (5)**
- `GET /health` - Basic health check
- `GET /ready` - Readiness check (validates DB and Redis connections)
- `GET /` - Service information with connection status
- `GET /api/test-db` - Test PostgreSQL connection
- `GET /api/test-redis` - Test Redis connection

**Authentication (4)**
- `POST /api/v1/auth/register/email` - Register with email
- `POST /api/v1/auth/login/email` - Login with email
- `POST /api/v1/auth/token/refresh` - Refresh access token
- `POST /api/v1/auth/token/revoke` - Logout and revoke token

**User Profile (6)**
- `GET /api/v1/user/profile` - Get current user profile
- `PUT /api/v1/user/profile` - Update profile
- `POST /api/v1/user/photos/upload` - Upload profile photo
- `DELETE /api/v1/user/photos/:photoId` - Delete profile photo
- `GET /api/v1/user/preferences/partner` - Get partner preferences
- `PUT /api/v1/user/preferences/partner` - Update partner preferences

**Availability (4)**
- `GET /api/v1/availability` - Get user's availability
- `POST /api/v1/availability` - Add availability slot
- `PUT /api/v1/availability/:id` - Update availability slot
- `DELETE /api/v1/availability/:id` - Delete availability slot

**Admin Operations (15)**
- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/admin/analytics` - Platform analytics
- `GET /api/v1/admin/users` - List all users with filters
- `GET /api/v1/admin/users/:userId` - Get user details
- `PUT /api/v1/admin/users/:userId/status` - Update user account status
- `PUT /api/v1/admin/users/:userId/verify/:verificationType` - Manually verify user
- `GET /api/v1/admin/users/:userId/activity` - Get user activity logs
- `POST /api/v1/admin/admins` - Create new admin
- `GET /api/v1/admin/admins` - List all admins
- `PUT /api/v1/admin/admins/:adminId/role` - Update admin role
- `DELETE /api/v1/admin/admins/:adminId` - Delete admin
- `GET /api/v1/admin/profile` - Get admin profile
- `PUT /api/v1/admin/profile` - Update admin profile
- `GET /api/v1/admin/curation/candidates` - Get users available for dates (AI curation)
- `POST /api/v1/admin/curation/analyze` - Analyze compatibility with AI (Gemini)

**Slack Integration (4)**
- `POST /api/v1/slack/send` - Send simple text message to Slack
- `POST /api/v1/slack/alert` - Send formatted alert (success/warning/danger/info)
- `POST /api/v1/slack/notification` - Send specialized notification (user_event/admin_activity/system_alert/ai_match)
- `GET/POST /api/v1/slack/test` - Test Slack integration status

#### gRPC Services (66 RPCs)

All gRPC services available at `localhost:9090`:

**AuthService (26 RPCs)**
- Email Authentication: `RegisterWithEmail`, `LoginWithEmail`, `VerifyEmail`, `ResendVerificationEmail`
- Phone Authentication: `RegisterWithPhone`, `LoginWithPhone`, `VerifyPhone`, `ResendPhoneVerification`
- Session Management: `RefreshToken`, `RevokeToken`, `Logout`, `ValidateSession`, `GetActiveSessions`, `RevokeSession`, `RevokeAllSessions`
- Password Management: `ChangePassword`, `RequestPasswordReset`, `ConfirmPasswordReset`
- Device Management: `RegisterDevice`, `UpdateDevice`, `UnregisterDevice`, `GetUserDevices`
- Profile: `GetProfile`, `UpdateProfile`, `DeleteAccount`

**UserService (15 RPCs)**
- Profile: `GetMyProfile`, `GetUserProfile`, `UpdateProfile`, `DeleteAccount`
- Photos: `UploadProfilePhoto`, `DeleteProfilePhoto`
- Preferences: `GetPartnerPreferences`, `UpdatePartnerPreferences`, `GetUserPreferences`, `UpdateUserPreferences`
- Discovery: `SearchUsers`
- Interactions: `BlockUser`, `UnblockUser`, `ListBlockedUsers`, `ReportUser`

**AdminService (40 RPCs)**
- Authentication: `AdminLogin`, `AdminLogout`, `GetAdminProfile`, `UpdateAdminProfile`
- User Management: `GetAllUsers`, `GetUserById`, `UpdateUserStatus`, `DeleteUser`, `SearchUsers`
- Verification: `ManuallyVerifyUser`, `GetVerificationRequests`, `ApproveVerification`, `RejectVerification`
- Analytics: `GetPlatformAnalytics`, `GetUserAnalytics`, `GetDateAnalytics`, `GetRevenueAnalytics`
- Admin Management: `CreateAdmin`, `UpdateAdmin`, `DeleteAdmin`, `ListAdmins`, `UpdateAdminRole`
- Activity Logs: `GetUserActivity`, `GetAdminActivity`, `GetSystemLogs`
- Date Curation: `GetCurationCandidates`, `CurateDates`
- And more...

**AvailabilityService (8 RPCs)**
- `GetAvailability` - Get user's availability slots
- `AddAvailability` - Add new availability slot
- `UpdateAvailability` - Update existing slot
- `DeleteAvailability` - Remove availability slot
- `GetAvailableUsers` - Find users available on specific dates
- `BulkAddAvailability` - Add multiple slots at once
- `GetUpcomingAvailability` - Get user's upcoming slots
- `ClearPastAvailability` - Remove expired slots

**DatesService (2 RPCs)**
- `GetCurationCandidates` - Get users available for AI-powered matching
- `CurateDates` - Analyze compatibility using Google Gemini AI

See [GRPC_TESTING.md](./docs/GRPC_TESTING.md) for testing gRPC endpoints and [BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md) for detailed service documentation with all 100 endpoints.

## 🎯 Key Features

### AI-Powered Date Curation
The platform includes an advanced AI-powered date curation system for admins:

- **Intelligent Matching**: Uses Google Gemini 2.5-flash to analyze user compatibility
- **Comprehensive Analysis**:
  - Compatibility scores (0-100)
  - Matched aspects highlighting
  - Mismatched aspects identification
  - Detailed reasoning for recommendations
- **Smart Filtering**: Automatically finds users available for dates starting tomorrow
- **Enhanced UX**:
  - Statistics dashboard (total analyzed, matches, avg score)
  - Match quality indicators (Excellent 🌟, Good 💙, Fair 🟡, Poor ⚠️)
  - Color-coded compatibility scores
  - Filter system (All, Matches, Non-Matches)
  - Action buttons (Approve, Review Later, Reject)

**Access**: Admin Dashboard → 💝 Curate Dates

### Admin Dashboard
Comprehensive admin panel with:
- **User Management**: View, search, filter, and manage all users
- **Analytics**: Platform-wide analytics and insights
- **Verification**: Manual user verification (email, Aadhar, work email)
- **Admin Management**: Create and manage admin accounts with role-based access
- **AI Genie**: AI-powered administrative assistant
- **Activity Logs**: Track user and admin activities

### User Features
- **Profile Management**: Complete profile with photos, preferences, and details
- **Partner Preferences**: Detailed partner preference settings
- **Availability Management**: Manage date availability with calendar integration
- **Account Verification**: Multi-level verification (email, Aadhar, work email)

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

### 📊 Monitoring Logs (Live/Real-time)

All log commands provide **LIVE, real-time output** that updates as events occur.

#### Quick Log Commands
```bash
# View all services logs in real-time (Ctrl+C to exit)
make logs

# View specific service logs (LIVE)
make logs-backend       # Backend logs only
make logs-frontend      # Frontend logs only

# Direct Docker commands for more control
docker-compose logs -f backend    # Follow backend logs
docker-compose logs -f frontend   # Follow frontend logs
docker-compose logs -f            # Follow ALL service logs
```

#### Advanced Log Monitoring
```bash
# Last 50 lines + follow new logs
docker-compose logs --tail=50 -f backend

# Logs from last 5 minutes
docker-compose logs --since 5m backend frontend

# Filter logs (watch for specific patterns)
docker-compose logs -f backend | grep -i error     # Watch for errors
docker-compose logs -f frontend | grep -i compiled # Watch compilation status

# Save logs to file while watching
docker-compose logs -f backend | tee backend.log

# Multiple services at once
docker-compose logs -f backend frontend postgres redis
```

#### Split Terminal Monitoring (Recommended)
For best development experience, open multiple terminals:

**Terminal 1 - Backend Logs:**
```bash
make logs-backend
```

**Terminal 2 - Frontend Logs:**
```bash
make logs-frontend
```

**Terminal 3 - Database Logs (optional):**
```bash
docker-compose logs -f postgres
```

#### What You'll See in Logs

**Backend Logs:**
- Air hot reload notifications
- Database connection status
- API request logs
- Error messages
- Server start/restart messages

**Frontend Logs:**
- Webpack compilation status
- TypeScript type checking
- Hot module replacement (HMR) updates
- Build errors and warnings
- Development server status

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

**Important**: Generated code (`apps/backend/gen/` and `apps/frontend/src/gen/`) is **NOT committed** to version control. These files are automatically generated from `.proto` sources.

##### Initial Setup
When cloning the repository or after pulling changes with proto updates:
```bash
# Generate types from proto files
make generate
```

##### Manual Generation
1. Edit `.proto` files in `proto/`
2. Generate types: `make generate`
3. Types are generated in:
   - Backend: `apps/backend/gen/` (Go)
   - Frontend: `apps/frontend/src/gen/` (TypeScript)

##### Automatic Generation (Recommended for Development)
The proto watcher service automatically regenerates types when `.proto` files change:

```bash
# Start the proto watcher (runs in foreground)
make proto-watch

# Or run in background using Docker Compose
docker-compose --profile dev-tools up -d proto-watcher

# View watcher logs
docker-compose logs -f proto-watcher
```

When the watcher is running:
1. Any changes to `.proto` files are detected automatically
2. Types are regenerated for both backend and frontend
3. Backend types: `apps/backend/gen/` (Go)
4. Frontend types: `apps/frontend/src/gen/` (TypeScript)

Note: The watcher checks for changes every 2 seconds and only regenerates when files actually change.

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
make logs               # View all logs (LIVE - follows in real-time)
make logs-backend       # View backend logs (LIVE - follows in real-time)
make logs-frontend      # View frontend logs (LIVE - follows in real-time)

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

# gRPC Testing (New!)
make buf-studio-agent   # Start Buf Studio Agent (official Buf web UI)
make buf-studio         # Open Buf Studio web app
make grpc-ui            # Launch grpcui web interface
make grpc-list          # List all available gRPC services
make grpc-list-auth     # List all AuthService methods
make grpc-describe      # Describe RegisterWithEmail method
make grpc-test-register # Test registration via gRPC
make rest-test-register # Test registration via REST
make grpc-test-page     # Open browser test page

# Development
make generate           # Generate proto types
make proto-watch        # Watch proto files and auto-generate types
make shell-backend      # Open backend shell
make shell-frontend     # Open frontend shell
make shell-db           # Open database shell

# Maintenance
make clean              # Remove all containers and volumes
make prune              # Remove unused Docker resources
```

## 🔐 Environment Variables

Environment variables are configured in `.env` file and `docker-compose.yml`:

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

# AI Integration (Required for Date Curation)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080

# Test Environment
TEST_DATABASE_URL=postgres://testuser:testpass@localhost:5433/monorepo_test
TEST_REDIS_URL=redis://localhost:6380
```

### Required Environment Variables

**For Production:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `GEMINI_API_KEY` - Google Gemini API key for AI-powered matching
- `PORT` - Server port (default: 8080)
- `ENV` - Environment name (development/production)

**Optional:**
- `MAILERSEND_API_KEY` - Email service API key
- `JWT_SECRET` - Custom JWT signing secret (auto-generated if not provided)
- `SLACK_WEBHOOK_URL` - Slack webhook URL for notifications and alerts

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

### 🚀 Quick Deploy to Production

Complete deployment guides for production environments:

- **[QUICK_DEPLOY.md](./docs/QUICK_DEPLOY.md)** - **⚡ Deploy in 15 minutes** - Fast reference guide
  - Step-by-step quick start
  - Vercel (frontend) + Render (backend)
  - Database and Redis setup
  - Common issues and fixes

- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - **📖 Complete Guide** - Comprehensive deployment overview
  - Production checklist
  - Security best practices
  - Monitoring and logging
  - Performance optimization
  - Troubleshooting guide
  - Cost estimation ($0-24/month)

- **[FRONTEND_DEPLOYMENT.md](./docs/FRONTEND_DEPLOYMENT.md)** - **⚛️ React Frontend** - Deploy to Vercel or Render
  - Vercel deployment (recommended)
  - Render static site deployment
  - Environment configuration
  - Custom domain setup
  - Performance optimization
  - Debugging production issues

- **[BACKEND_DEPLOYMENT.md](./docs/BACKEND_DEPLOYMENT.md)** - **🔧 Go Backend** - Deploy to Render
  - Render web service setup
  - PostgreSQL configuration
  - Redis setup (Upstash)
  - Environment variables
  - Health checks
  - Scaling and monitoring

- **[DATABASE_MIGRATIONS.md](./docs/DATABASE_MIGRATIONS.md)** - **🗄️ Database Management** - Schema changes
  - Running migrations
  - Creating new migrations
  - Migration best practices
  - Production migration workflow
  - Rollback procedures
  - Troubleshooting

### Docker Deployment (Alternative)

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

### Vercel Deployment (Development/Testing)

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

### AI Curation Not Working

#### Error: "AI provider not initialized"
```bash
# Check if GEMINI_API_KEY is set
docker-compose exec backend printenv | grep GEMINI

# If missing, add to docker-compose.yml under backend environment:
# - GEMINI_API_KEY=your_api_key_here

# Restart backend
docker-compose stop backend && docker-compose up -d backend
```

#### Error: "No users available for dates"
```bash
# Check database for users with availability
docker-compose exec postgres psql -U devuser -d monorepo_dev

# In psql:
SELECT u.id, u.email, u.name, u.account_status, COUNT(a.id) as availability_count
FROM users u
LEFT JOIN availability a ON u.id = a.user_id
WHERE a.start_time >= NOW()
GROUP BY u.id;

# Make sure users have:
# 1. account_status = 'ACTIVE'
# 2. date_of_birth is set (for age calculation)
# 3. gender is set correctly
# 4. At least one availability slot starting tomorrow or later
```

#### Test Gemini API directly
```bash
# Test if your API key works
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY"
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

## 📚 Documentation

Comprehensive guides for development, testing, deployment, and debugging:

### 🚀 Deployment Guides

- **[QUICK_DEPLOY.md](./docs/QUICK_DEPLOY.md)** - **⚡ Quick Start** - Deploy to production in 15 minutes
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - **📖 Complete Guide** - Production deployment overview
- **[FRONTEND_DEPLOYMENT.md](./docs/FRONTEND_DEPLOYMENT.md)** - **⚛️ Frontend** - Vercel & Render deployment
- **[BACKEND_DEPLOYMENT.md](./docs/BACKEND_DEPLOYMENT.md)** - **🔧 Backend** - Render deployment guide
- **[DATABASE_MIGRATIONS.md](./docs/DATABASE_MIGRATIONS.md)** - **🗄️ Migrations** - Database schema management

### Backend Documentation

- **[BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md)** - **⭐ Backend Guide** - Comprehensive backend architecture (2,043 lines)
  - Complete architecture overview with diagrams
  - All 100 endpoints documented (34 HTTP + 66 gRPC)
  - **Step-by-step guide: Adding new gRPC endpoints**
  - **Step-by-step guide: Adding new services**
  - **Debugging guide** with common issues and solutions
  - Database schema (8 migrations explained)
  - Testing guide with examples
  - Best practices and conventions
  - File change summary for common tasks

- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development workflow and patterns
  - Code organization patterns
  - Proto-first development
  - Repository pattern implementation

### Frontend Documentation

- **[FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md)** - **⭐ Frontend Guide** - Comprehensive frontend architecture
  - Complete project structure (17 pages, 30+ components)
  - All 5 services documented (auth, user, admin, availability, base)
  - State management with Zustand (4 stores)
  - **Step-by-step guide: Adding new pages**
  - **Step-by-step guide: Creating reusable components**
  - **Step-by-step guide: Adding admin features**
  - Theme system (Chakra UI v3)
  - Common patterns and best practices
  - Debugging guide for frontend issues
  - Performance optimization tips

### Testing & API Documentation

- **[TESTING.md](./docs/TESTING.md)** - Testing guidelines and examples
  - Unit testing guide with examples
  - Integration testing workflows
  - Code coverage requirements
  - Test-driven development practices

- **[GRPC_TESTING.md](./docs/GRPC_TESTING.md)** - gRPC testing tools and usage
  - Buf Studio (official web UI)
  - grpcui web interface
  - grpcurl command-line testing
  - Postman integration

- **[POSTMAN_GUIDE.md](./docs/POSTMAN_GUIDE.md)** - Complete Postman testing guide
  - Setup and configuration
  - All 38 HTTP REST endpoints
  - Authentication workflows
  - AI curation testing
  - Environment variables
  - Common issues and solutions

- **[SLACK_INTEGRATION.md](./docs/SLACK_INTEGRATION.md)** - Slack integration guide
  - Setup Slack webhook URL
  - Send notifications and alerts
  - User events, admin activities, system alerts
  - API endpoints with curl examples
  - Testing and troubleshooting
  - Best practices for production

## 🤝 Contributing

1. Create a feature branch
2. Make your changes following [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
3. Write tests following [TESTING.md](./docs/TESTING.md)
4. Run tests: `make test`
5. Ensure code quality
6. Submit a pull request

## 📝 License

[Your License Here]

## 🆘 Support

For issues and questions, please open an issue in the repository.

---

**Happy Coding!** 🚀