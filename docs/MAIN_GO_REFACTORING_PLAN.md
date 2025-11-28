# Main.go Refactoring Plan

**Current State:** 3,939 lines with 64 functions - Too large and difficult to maintain
**Goal:** Modular, readable, and maintainable codebase following Go best practices

---

## 📊 Current Analysis

### File Statistics:
- **Total Lines:** 3,939
- **Total Functions:** 64
- **Main Concerns:**
  - All HTTP handlers in one file
  - All gRPC setup in one file
  - Mixed responsibilities (config, routing, handlers, conversions)
  - Hard to navigate and maintain
  - Difficult to test individual components

### Function Breakdown:
1. **Core Functions:** 3 (main, startGRPCServer, startHTTPServer)
2. **HTTP Handlers:** ~40 (createXxxHandler functions)
3. **Helper Functions:** ~15 (conversion, parsing, utilities)
4. **Server Methods:** 6 (healthHandler, readyHandler, etc.)

---

## 🎯 Refactoring Strategy

### Phase 1: Extract Configuration (Priority: HIGH)
**Goal:** Centralize all environment variable management

**New Structure:**
```
apps/backend/
├── cmd/server/
│   └── main.go                    # ~100 lines (just initialization)
└── internal/
    ├── config/
    │   └── config.go              # Configuration management
```

**Benefits:**
- Single source of truth for config
- Easy to test
- Clear defaults
- Better validation

---

### Phase 2: Extract HTTP Handlers (Priority: HIGH)
**Goal:** Move all REST handlers to organized handler packages

**New Structure:**
```
apps/backend/internal/
├── handler/
│   ├── http/
│   │   ├── auth/
│   │   │   ├── register.go       # Register handler
│   │   │   ├── login.go          # Login handler
│   │   │   ├── token.go          # Token handlers (refresh, revoke)
│   │   │   └── handler.go        # Auth handler struct
│   │   │
│   │   ├── user/
│   │   │   ├── profile.go        # Profile handlers
│   │   │   ├── preferences.go    # Preferences handlers
│   │   │   ├── suggestions.go    # Date suggestions
│   │   │   ├── love_zone.go      # Love Zone endpoints
│   │   │   └── handler.go        # User handler struct
│   │   │
│   │   ├── admin/
│   │   │   ├── auth.go           # Admin login
│   │   │   ├── users.go          # User management
│   │   │   ├── dates.go          # Date management
│   │   │   ├── curation.go       # AI curation
│   │   │   ├── analytics.go      # Analytics endpoints
│   │   │   ├── admins.go         # Admin management
│   │   │   └── handler.go        # Admin handler struct
│   │   │
│   │   ├── availability/
│   │   │   ├── availability.go   # Availability handlers
│   │   │   └── handler.go        # Availability handler struct
│   │   │
│   │   ├── slack/
│   │   │   ├── notifications.go  # Slack endpoints
│   │   │   └── handler.go        # Slack handler struct
│   │   │
│   │   └── health/
│   │       ├── health.go         # Health check handlers
│   │       └── handler.go        # Health handler struct
```

**Handler Pattern:**
```go
// apps/backend/internal/handler/http/auth/handler.go
package auth

import (
    "github.com/datifyy/backend/internal/service"
)

type Handler struct {
    authService *service.AuthService
}

func NewHandler(authService *service.AuthService) *Handler {
    return &Handler{
        authService: authService,
    }
}

// Individual handlers in separate files (register.go, login.go, etc.)
```

**Benefits:**
- Clear separation of concerns
- Easy to find specific handlers
- Testable in isolation
- Follows standard Go project layout

---

### Phase 3: Extract Routing (Priority: HIGH)
**Goal:** Centralized route registration

**New Structure:**
```
apps/backend/internal/
├── router/
│   ├── http.go          # HTTP router setup
│   ├── grpc.go          # gRPC server setup
│   └── middleware.go    # Middleware registration
```

**Example - http.go:**
```go
package router

import (
    "database/sql"
    "net/http"

    "github.com/datifyy/backend/internal/config"
    authHandler "github.com/datifyy/backend/internal/handler/http/auth"
    userHandler "github.com/datifyy/backend/internal/handler/http/user"
    // ... other handlers
)

type HTTPRouter struct {
    config   *config.Config
    mux      *http.ServeMux
    handlers *Handlers
}

type Handlers struct {
    Auth         *authHandler.Handler
    User         *userHandler.Handler
    Admin        *adminHandler.Handler
    Availability *availabilityHandler.Handler
    Health       *healthHandler.Handler
    Slack        *slackHandler.Handler
}

func NewHTTPRouter(cfg *config.Config, handlers *Handlers) *HTTPRouter {
    return &HTTPRouter{
        config:   cfg,
        mux:      http.NewServeMux(),
        handlers: handlers,
    }
}

func (r *HTTPRouter) RegisterRoutes() {
    // Health endpoints
    r.mux.HandleFunc("/health", r.handlers.Health.Health)
    r.mux.HandleFunc("/ready", r.handlers.Health.Ready)
    r.mux.HandleFunc("/", r.handlers.Health.Root)

    // Auth endpoints
    r.mux.HandleFunc("/api/v1/auth/register/email", r.handlers.Auth.Register)
    r.mux.HandleFunc("/api/v1/auth/login/email", r.handlers.Auth.Login)

    // ... more routes
}

func (r *HTTPRouter) Handler() http.Handler {
    return r.mux
}
```

**Benefits:**
- All routes visible in one place
- Easy to add/modify routes
- Clear API structure
- Middleware can be applied cleanly

---

### Phase 4: Extract Utilities (Priority: MEDIUM)
**Goal:** Move helper functions to utility packages

**New Structure:**
```
apps/backend/internal/
├── util/
│   ├── converter/
│   │   ├── user.go          # User conversion functions
│   │   ├── admin.go         # Admin conversion functions
│   │   ├── availability.go  # Availability conversions
│   │   └── date.go          # Date conversions
│   │
│   └── parser/
│       ├── parser.go        # String parsing utilities
│       └── enum.go          # Enum conversions
```

**Example:**
```go
// apps/backend/internal/util/converter/user.go
package converter

import (
    userpb "github.com/datifyy/backend/gen/user/v1"
)

func UserProfileToJSON(profile *userpb.UserProfile) map[string]interface{} {
    return map[string]interface{}{
        "id":       profile.Id,
        "email":    profile.Email,
        "name":     profile.Name,
        // ... rest of conversion
    }
}
```

**Benefits:**
- Reusable utility functions
- Easy to test
- Clear naming and organization

---

### Phase 5: Extract Server Initialization (Priority: MEDIUM)
**Goal:** Clean server setup and dependency injection

**New Structure:**
```
apps/backend/internal/
├── server/
│   ├── http.go     # HTTP server initialization
│   ├── grpc.go     # gRPC server initialization
│   └── deps.go     # Dependency injection
```

**Example - deps.go:**
```go
package server

import (
    "database/sql"
    "github.com/redis/go-redis/v9"
    "github.com/datifyy/backend/internal/service"
    "github.com/datifyy/backend/internal/repository"
    "github.com/datifyy/backend/internal/config"
)

type Dependencies struct {
    Config       *config.Config
    DB           *sql.DB
    Redis        *redis.Client

    // Repositories
    UserRepo         *repository.UserRepository
    AdminRepo        *repository.AdminRepository
    // ... more repos

    // Services
    AuthService      *service.AuthService
    UserService      *service.UserService
    AdminService     *service.AdminService
    // ... more services
}

func InitializeDependencies(cfg *config.Config) (*Dependencies, error) {
    // Connect to database
    db, err := connectDatabase(cfg.DatabaseURL)
    if err != nil {
        return nil, err
    }

    // Connect to Redis
    redis, err := connectRedis(cfg.RedisURL)
    if err != nil {
        return nil, err
    }

    // Initialize repositories
    userRepo := repository.NewUserRepository(db)
    adminRepo := repository.NewAdminRepository(db)
    // ... more repos

    // Initialize services
    authService := service.NewAuthService(db, redis, emailClient)
    userService := service.NewUserService(db, redis)
    // ... more services

    return &Dependencies{
        Config:      cfg,
        DB:          db,
        Redis:       redis,
        UserRepo:    userRepo,
        AuthService: authService,
        // ... populate all dependencies
    }, nil
}
```

**Benefits:**
- Clear dependency graph
- Easy to mock for testing
- Single initialization point

---

## 📁 Final Directory Structure

```
apps/backend/
├── cmd/
│   └── server/
│       └── main.go                    # ~100 lines
│
├── internal/
│   ├── config/
│   │   └── config.go                  # Configuration
│   │
│   ├── server/
│   │   ├── http.go                    # HTTP server
│   │   ├── grpc.go                    # gRPC server
│   │   └── deps.go                    # Dependency injection
│   │
│   ├── router/
│   │   ├── http.go                    # HTTP routing
│   │   ├── grpc.go                    # gRPC routing
│   │   └── middleware.go              # Middleware
│   │
│   ├── handler/
│   │   ├── http/
│   │   │   ├── auth/                  # Auth handlers
│   │   │   ├── user/                  # User handlers
│   │   │   ├── admin/                 # Admin handlers
│   │   │   ├── availability/          # Availability handlers
│   │   │   ├── slack/                 # Slack handlers
│   │   │   └── health/                # Health handlers
│   │   │
│   │   └── grpc/                      # (Future: if gRPC handlers need separation)
│   │
│   ├── service/                       # Existing services (no change)
│   │   ├── auth_service.go
│   │   ├── user_service.go
│   │   └── ...
│   │
│   ├── repository/                    # Existing repositories (no change)
│   │   ├── user_repository.go
│   │   └── ...
│   │
│   └── util/
│       ├── converter/                 # Conversion utilities
│       │   ├── user.go
│       │   ├── admin.go
│       │   └── ...
│       │
│       └── parser/                    # Parsing utilities
│           ├── parser.go
│           └── enum.go
```

---

## 🔄 Migration Steps

### Step 1: Create Configuration Package ✅
```bash
mkdir -p apps/backend/internal/config
touch apps/backend/internal/config/config.go
```

**File: config.go**
```go
package config

import (
    "fmt"
    "os"
)

type Config struct {
    // Server
    HTTPPort string
    GRPCPort string

    // Database
    DatabaseURL string

    // Cache
    RedisURL string

    // Email
    MailerSendAPIKey string
    EmailFrom        string
    EmailFromName    string

    // AI
    GeminiAPIKey string

    // Slack
    SlackWebhookURL string

    // Environment
    Environment string
}

func Load() *Config {
    cfg := &Config{
        HTTPPort:         getEnv("PORT", "8080"),
        GRPCPort:         getEnv("GRPC_PORT", "9090"),
        DatabaseURL:      getEnv("DATABASE_URL", "postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"),
        RedisURL:         getEnv("REDIS_URL", "redis://localhost:6379"),
        MailerSendAPIKey: os.Getenv("MAILERSEND_API_KEY"),
        EmailFrom:        getEnv("EMAIL_FROM", "noreply@datifyy.com"),
        EmailFromName:    getEnv("EMAIL_FROM_NAME", "Datifyy"),
        GeminiAPIKey:     os.Getenv("GEMINI_API_KEY"),
        SlackWebhookURL:  os.Getenv("SLACK_WEBHOOK_URL"),
        Environment:      getEnv("ENV", "development"),
    }

    return cfg
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func (c *Config) Validate() error {
    if c.DatabaseURL == "" {
        return fmt.Errorf("DATABASE_URL is required")
    }
    return nil
}
```

### Step 2: Create Handler Packages ✅
```bash
mkdir -p apps/backend/internal/handler/http/{auth,user,admin,availability,health,slack}
```

### Step 3: Create Utility Packages ✅
```bash
mkdir -p apps/backend/internal/util/{converter,parser}
```

### Step 4: Create Router Package ✅
```bash
mkdir -p apps/backend/internal/router
```

### Step 5: Create Server Package ✅
```bash
mkdir -p apps/backend/internal/server
```

### Step 6: Move Code Gradually (Phase by Phase)
1. Move config first (least risky)
2. Move utilities (no dependencies)
3. Move handlers (one domain at a time)
4. Update routing
5. Simplify main.go last

---

## ✅ Testing Strategy

### Unit Tests:
- Each handler package should have `*_test.go`
- Mock services using interfaces
- Test HTTP responses

### Integration Tests:
- Keep existing integration tests
- Update imports as packages move
- Ensure all endpoints still work

### Validation:
```bash
# After each phase
make test
make test-integration

# Verify endpoints still work
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/auth/login/email
```

---

## 📈 Expected Improvements

### Before Refactoring:
- main.go: 3,939 lines
- 64 functions in one file
- Hard to navigate
- Difficult to test handlers

### After Refactoring:
- main.go: ~100 lines
- Config: ~50 lines
- Each handler file: 50-150 lines
- Clear organization
- Easy to test
- Easy to find code

### Code Organization:
```
Before: Everything in main.go (3,939 lines)

After:
- main.go                  ~100 lines
- config/config.go         ~80 lines
- server/deps.go           ~150 lines
- server/http.go           ~100 lines
- server/grpc.go           ~80 lines
- router/http.go           ~200 lines
- router/grpc.go           ~100 lines
- handler/http/auth/*.go   ~400 lines (across 4 files)
- handler/http/user/*.go   ~500 lines (across 5 files)
- handler/http/admin/*.go  ~800 lines (across 6 files)
- util/converter/*.go      ~400 lines (across 4 files)
- util/parser/*.go         ~100 lines (across 2 files)
```

**Total:** Same functionality, but organized into ~30 files averaging ~100-200 lines each

---

## 🎯 Success Criteria

✅ main.go reduced to < 150 lines
✅ No file > 500 lines
✅ Each domain has its own handler package
✅ All tests pass
✅ All endpoints work
✅ Code coverage maintained or improved
✅ Clear separation of concerns
✅ Easy to find any handler
✅ Easy to add new endpoints

---

## 🚀 Quick Start (Recommended Order)

### Week 1: Foundation
1. Create config package
2. Create utility packages
3. Update main.go to use config

### Week 2: Handlers
4. Create handler packages
5. Move auth handlers
6. Move user handlers
7. Test thoroughly

### Week 3: Complete Migration
8. Move admin handlers
9. Move availability handlers
10. Move health/slack handlers
11. Create router package
12. Final main.go cleanup

### Week 4: Polish
13. Add handler tests
14. Update documentation
15. Code review
16. Deploy to staging

---

## 📚 Additional Benefits

1. **Easier Onboarding**: New developers can find code quickly
2. **Better Testing**: Each handler can be tested in isolation
3. **Code Reuse**: Utilities available across handlers
4. **Maintainability**: Changes isolated to specific files
5. **Scalability**: Easy to add new domains/features
6. **Standards**: Follows Go community best practices

---

## 🔗 References

- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Go Best Practices](https://go.dev/doc/effective_go)
- [Clean Architecture in Go](https://github.com/bxcodec/go-clean-arch)

---

**Ready to Start?** See the implementation guide in the next section for step-by-step code examples!
