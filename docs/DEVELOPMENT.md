# Development Guide

This document provides comprehensive guidelines for adding new services, RPC methods, and following the established development patterns in this project.

> **Note**: For detailed information about the current backend architecture, service implementations, database schema, and API reference, see [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Adding a New RPC Method](#adding-a-new-rpc-method)
- [Adding a New Service](#adding-a-new-service)
- [Development Workflow](#development-workflow)
- [Code Organization](#code-organization)
- [Best Practices](#best-practices)

## Implementation Status

**Current Backend Status**:
- **AuthService**: 26/26 RPCs complete (100%)
- **UserService**: 15/15 RPCs complete (100%)
- **AdminService**: 40/40 RPCs complete (100%)
- **AvailabilityService**: 8/8 RPCs complete (100%)
- **DatesService**: 2/2 RPCs complete (100%) - AI-powered curation
- **Total API Surface**: 100 endpoints (34 HTTP REST + 66 gRPC RPCs)
- **Database**: 8 migrations with comprehensive schema
- **Email Service**: MailerSend integration complete
- **AI Integration**: Google Gemini 2.5-flash for compatibility analysis

---

## Architecture Overview

### Dual Server Design

The backend runs two servers simultaneously:

1. **gRPC Server** (Port 9090)
   - Primary interface for type-safe communication
   - All business logic implemented as gRPC services
   - Server reflection enabled for tooling

2. **HTTP/REST Server** (Port 8080)
   - Thin wrappers around gRPC services
   - Provides REST API for browser/curl access
   - CORS enabled for frontend

### Layer Architecture

```
┌─────────────────────────────────────┐
│     Proto Definitions (.proto)      │
│   - Messages, Enums, Services       │
└──────────────┬──────────────────────┘
               │ buf generate
               ↓
┌─────────────────────────────────────┐
│    Generated Code (gen/)            │
│   - Go stubs, TypeScript types      │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│    Service Layer (internal/service) │
│   - Business logic                  │
│   - RPC implementation              │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  Repository Layer (internal/repo)   │
│   - Database operations             │
│   - Data access                     │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      Database (PostgreSQL/Redis)    │
└─────────────────────────────────────┘
```

### Current Service Organization

The backend is organized into modular service files:

**Services** (`internal/service/`):
- `auth_service.go` - Authentication (26 RPCs): email/phone auth, sessions, passwords, devices
- `user_service.go` - User management (15 RPCs): profiles, photos, preferences, blocking
- `admin_service.go` - Admin operations (40 RPCs): user management, analytics, verification
- `availability_service.go` - Availability management (8 RPCs): date slots, scheduling
- `dates_service.go` - AI-powered date curation (2 RPCs): candidate matching, compatibility analysis
- `ai_*.go` - AI/Gemini integration for compatibility scoring

**Repositories** (`internal/repository/` - 6 repositories):
- `user_repository.go` - User CRUD operations
- `session_repository.go` - Session management
- `admin_repository.go` - Admin operations
- `availability_repository.go` - Availability slots
- `dates_repository.go` - Date matching
- `curated_matches_repository.go` - AI match storage

**Utilities**:
- `internal/auth/` - Password hashing, JWT tokens, session management
- `internal/email/` - Email service (MailerSend integration)

---

## Adding a New RPC Method

Follow these steps to add a new RPC method to an existing service (e.g., `LoginWithEmail` to `AuthService`).

### Step 1: Define Proto Message Types

**File**: `proto/auth/v1/messages.proto`

```protobuf
// Login credentials
message EmailPasswordLoginCredentials {
  string email = 1;
  string password = 2;
  DeviceInfo device_info = 3;
}

// Login response (reuse existing TokenPair, SessionInfo, UserProfile)
```

### Step 2: Add RPC Definition

**File**: `proto/auth/v1/auth.proto`

```protobuf
service AuthService {
  // ... existing RPCs

  // Login with email and password
  rpc LoginWithEmail(LoginWithEmailRequest) returns (LoginWithEmailResponse);
}

// Request message
message LoginWithEmailRequest {
  EmailPasswordLoginCredentials credentials = 1;
}

// Response message
message LoginWithEmailResponse {
  UserProfile user = 1;
  TokenPair tokens = 2;
  SessionInfo session = 3;
}
```

### Step 3: Generate Proto Code

```bash
make generate
```

This generates:
- Go code: `apps/backend/gen/auth/v1/*.pb.go`
- TypeScript: `apps/frontend/src/gen/auth/v1/*.ts`

### Step 4: Update Database Schema (If Needed)

**File**: `apps/backend/migrations/00X_add_login_fields.sql`

```sql
-- Example: Add last_login_at if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

Apply migration:
```bash
docker-compose restart backend  # Auto-runs migrations
```

### Step 5: Implement Repository Methods

**File**: `apps/backend/internal/repository/user_repository.go`

```go
// GetByEmailWithPassword retrieves user and validates credentials exist
func (r *UserRepository) GetByEmailWithPassword(ctx context.Context, email string) (*User, error) {
    query := `
        SELECT id, email, name, password_hash, account_status,
               email_verified, created_at, updated_at
        FROM users
        WHERE email = $1 AND password_hash IS NOT NULL
    `

    var user User
    err := r.db.QueryRowContext(ctx, query, email).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.PasswordHash,
        &user.AccountStatus,
        &user.EmailVerified,
        &user.CreatedAt,
        &user.UpdatedAt,
    )

    if err == sql.ErrNoRows {
        return nil, fmt.Errorf("user not found or password not set")
    }
    if err != nil {
        return nil, fmt.Errorf("database error: %w", err)
    }

    return &user, nil
}

// UpdateLastLogin updates the last login timestamp
func (r *UserRepository) UpdateLastLogin(ctx context.Context, userID int) error {
    query := `UPDATE users SET last_login_at = NOW() WHERE id = $1`
    _, err := r.db.ExecContext(ctx, query, userID)
    return err
}
```

### Step 6: Implement Service Logic

**File**: `apps/backend/internal/service/auth_service.go`

```go
func (s *AuthService) LoginWithEmail(ctx context.Context, req *authpb.LoginWithEmailRequest) (*authpb.LoginWithEmailResponse, error) {
    // 1. Validate input
    if err := auth.ValidateEmail(req.Credentials.Email); err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "invalid email: %v", err)
    }

    if req.Credentials.Password == "" {
        return nil, status.Errorf(codes.InvalidArgument, "password is required")
    }

    // 2. Get user from database
    user, err := s.userRepo.GetByEmailWithPassword(ctx, req.Credentials.Email)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "invalid credentials")
    }

    // 3. Verify password
    if err := auth.VerifyPassword(user.PasswordHash, req.Credentials.Password); err != nil {
        return nil, status.Errorf(codes.Unauthenticated, "invalid credentials")
    }

    // 4. Check account status
    if user.AccountStatus != "ACTIVE" && user.AccountStatus != "PENDING" {
        return nil, status.Errorf(codes.PermissionDenied, "account is %s", user.AccountStatus)
    }

    // 5. Create session and tokens
    tokens, sessionInfo, err := s.createSessionAndTokens(ctx, user, req.Credentials.DeviceInfo)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to create session: %v", err)
    }

    // 6. Update last login
    if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
        log.Printf("Warning: failed to update last login: %v", err)
    }

    // 7. Convert to proto response
    userProfile := &authpb.UserProfile{
        UserId:        fmt.Sprintf("%d", user.ID),
        Email:         user.Email,
        Name:          user.Name,
        AccountStatus: parseAccountStatus(user.AccountStatus),
        EmailVerified: parseVerificationStatus(user.EmailVerified),
        CreatedAt:     timeToProto(user.CreatedAt),
    }

    return &authpb.LoginWithEmailResponse{
        User:    userProfile,
        Tokens:  tokens,
        Session: sessionInfo,
    }, nil
}
```

### Step 7: Add HTTP REST Wrapper

**File**: `apps/backend/cmd/server/main.go`

```go
// In startHTTPServer function, add:
mux.HandleFunc("/api/v1/auth/login/email", createLoginHandler(authService))

// Create the handler function:
func createLoginHandler(authService *service.AuthService) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }

        // Parse JSON request
        var reqBody struct {
            Email    string `json:"email"`
            Password string `json:"password"`
            DeviceInfo *struct {
                Platform   int32  `json:"platform"`
                DeviceName string `json:"device_name"`
                OSVersion  string `json:"os_version"`
                DeviceID   string `json:"device_id"`
            } `json:"device_info,omitempty"`
        }

        if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
            http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
            return
        }

        // Convert to gRPC request
        grpcReq := &authpb.LoginWithEmailRequest{
            Credentials: &authpb.EmailPasswordLoginCredentials{
                Email:    reqBody.Email,
                Password: reqBody.Password,
            },
        }

        if reqBody.DeviceInfo != nil {
            grpcReq.Credentials.DeviceInfo = &authpb.DeviceInfo{
                Platform:   commonpb.DevicePlatform(reqBody.DeviceInfo.Platform),
                DeviceName: reqBody.DeviceInfo.DeviceName,
                OsVersion:  reqBody.DeviceInfo.OSVersion,
                DeviceId:   reqBody.DeviceInfo.DeviceID,
            }
        }

        // Call gRPC service
        resp, err := authService.LoginWithEmail(r.Context(), grpcReq)
        if err != nil {
            http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
            return
        }

        // Convert response to JSON (similar to registration)
        jsonResp := map[string]interface{}{
            "user": map[string]interface{}{
                "user_id":        resp.User.UserId,
                "email":          resp.User.Email,
                "name":           resp.User.Name,
                "account_status": resp.User.AccountStatus.String(),
                "email_verified": resp.User.EmailVerified.String(),
            },
            "tokens": map[string]interface{}{
                "access_token": map[string]interface{}{
                    "token":      resp.Tokens.AccessToken.Token,
                    "token_type": resp.Tokens.AccessToken.TokenType,
                    "expires_at": map[string]int64{
                        "seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
                        "nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
                    },
                },
                "refresh_token": map[string]interface{}{
                    "token": resp.Tokens.RefreshToken.Token,
                    "expires_at": map[string]int64{
                        "seconds": resp.Tokens.RefreshToken.ExpiresAt.Seconds,
                        "nanos":   int64(resp.Tokens.RefreshToken.ExpiresAt.Nanos),
                    },
                },
            },
            "session": map[string]interface{}{
                "session_id": resp.Session.SessionId,
                "user_id":    resp.Session.UserId,
            },
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(jsonResp)
    }
}
```

### Step 8: Write Unit Tests

**File**: `apps/backend/internal/service/auth_service_test.go`

See [TESTING.md](./TESTING.md) for detailed testing guidelines.

```go
func TestLoginWithEmail_Success(t *testing.T) {
    // Test successful login
}

func TestLoginWithEmail_InvalidEmail(t *testing.T) {
    // Test with invalid email format
}

func TestLoginWithEmail_WrongPassword(t *testing.T) {
    // Test with incorrect password
}

func TestLoginWithEmail_UserNotFound(t *testing.T) {
    // Test with non-existent email
}

func TestLoginWithEmail_SuspendedAccount(t *testing.T) {
    // Test with suspended account
}
```

### Step 9: Write Integration Tests

**File**: `apps/backend/tests/integration/auth_test.go`

```go
func TestLoginWithEmail_Integration(t *testing.T) {
    // 1. Create test user via RegisterWithEmail
    // 2. Login with correct credentials
    // 3. Verify tokens and session created
    // 4. Verify last_login_at updated
}
```

### Step 10: Test with Tools

```bash
# Test REST endpoint
curl -X POST http://localhost:8080/api/v1/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123*"}'

# Test gRPC endpoint
echo '{"credentials":{"email":"test@example.com","password":"TestPass123*"}}' | \
  grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/LoginWithEmail

# Test with grpcui
grpcui -plaintext localhost:9090
```

---

## Adding a New Service

Follow these steps to create an entirely new service (e.g., `UserService`).

### Step 1: Create Proto Files

**File**: `proto/user/v1/messages.proto`

```protobuf
syntax = "proto3";

package datifyy.user.v1;

import "common/v1/types.proto";

option go_package = "github.com/datifyy/backend/gen/user/v1";

// User profile update request
message UpdateProfileRequest {
  string user_id = 1;
  string bio = 2;
  repeated string interests = 3;
  // ... other fields
}

message UpdateProfileResponse {
  UserProfile profile = 1;
  string message = 2;
}
```

**File**: `proto/user/v1/user.proto` (if not exists, or add to existing)

```protobuf
syntax = "proto3";

package datifyy.user.v1;

import "user/v1/messages.proto";

option go_package = "github.com/datifyy/backend/gen/user/v1";

service UserService {
  // Get user profile
  rpc GetProfile(GetProfileRequest) returns (GetProfileResponse);

  // Update user profile
  rpc UpdateProfile(UpdateProfileRequest) returns (UpdateProfileResponse);

  // Upload profile photo
  rpc UploadPhoto(UploadPhotoRequest) returns (UploadPhotoResponse);
}

// ... message definitions
```

### Step 2: Generate Code

```bash
make generate
```

### Step 3: Create Repository

**File**: `apps/backend/internal/repository/profile_repository.go`

```go
package repository

import (
    "context"
    "database/sql"
    "fmt"
)

type ProfileRepository struct {
    db *sql.DB
}

func NewProfileRepository(db *sql.DB) *ProfileRepository {
    return &ProfileRepository{db: db}
}

func (r *ProfileRepository) GetByUserID(ctx context.Context, userID int) (*UserProfile, error) {
    // Implementation
}

func (r *ProfileRepository) Update(ctx context.Context, profile *UserProfile) error {
    // Implementation
}
```

### Step 4: Create Service Implementation

**File**: `apps/backend/internal/service/user_service.go`

```go
package service

import (
    "context"
    "fmt"

    userpb "github.com/datifyy/backend/gen/user/v1"
    "github.com/datifyy/backend/internal/repository"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

type UserService struct {
    userpb.UnimplementedUserServiceServer
    profileRepo *repository.ProfileRepository
}

func NewUserService(profileRepo *repository.ProfileRepository) *UserService {
    return &UserService{
        profileRepo: profileRepo,
    }
}

func (s *UserService) GetProfile(ctx context.Context, req *userpb.GetProfileRequest) (*userpb.GetProfileResponse, error) {
    // Implementation
}

func (s *UserService) UpdateProfile(ctx context.Context, req *userpb.UpdateProfileRequest) (*userpb.UpdateProfileResponse, error) {
    // Implementation
}
```

### Step 5: Register Service in Main

**File**: `apps/backend/cmd/server/main.go`

```go
// In startGRPCServer function:
func startGRPCServer(port string, db *sql.DB, redisClient *redis.Client) {
    // ... existing code

    // Register services
    authService := service.NewAuthService(db, redisClient)
    authpb.RegisterAuthServiceServer(grpcServer, authService)

    // NEW: Register UserService
    profileRepo := repository.NewProfileRepository(db)
    userService := service.NewUserService(profileRepo)
    userpb.RegisterUserServiceServer(grpcServer, userService)

    // ... rest of code
}
```

### Step 6: Add HTTP Wrappers (Optional)

```go
// In startHTTPServer function:
mux.HandleFunc("/api/v1/user/profile", createGetProfileHandler(userService))
mux.HandleFunc("/api/v1/user/profile/update", createUpdateProfileHandler(userService))
```

### Step 7: Write Tests

Create test files following the same pattern as AuthService.

---

## Development Workflow

### Daily Development

1. **Start services**:
   ```bash
   make up
   ```

2. **Enable proto watcher** (auto-regenerate on .proto changes):
   ```bash
   make proto-watch
   ```

3. **Monitor logs** (separate terminals):
   ```bash
   make logs-backend   # Terminal 1
   make logs-frontend  # Terminal 2
   ```

4. **Make changes** - files auto-reload via Air (backend) and CRA (frontend)

5. **Test as you go**:
   ```bash
   # Quick REST test
   curl http://localhost:8080/api/v1/auth/register/email -d '{...}'

   # Interactive gRPC testing
   grpcui -plaintext localhost:9090
   ```

6. **Run tests before commit**:
   ```bash
   make test
   ```

### Pre-Commit Checklist

- [ ] Proto files validated: `buf lint proto`
- [ ] Code generated: `make generate`
- [ ] Unit tests pass: `make test-backend`
- [ ] Integration tests pass: `make test-integration`
- [ ] Frontend tests pass: `make test-frontend`
- [ ] No linting errors
- [ ] Documentation updated

---

## Code Organization

### Directory Structure

```
apps/backend/
├── cmd/server/           # Entry point
│   └── main.go          # Server setup, HTTP/gRPC registration
├── internal/
│   ├── auth/            # Auth utilities (password, tokens)
│   ├── repository/      # Data access layer
│   │   ├── user_repository.go
│   │   └── profile_repository.go
│   └── service/         # Business logic (gRPC implementations)
│       ├── auth_service.go
│       └── user_service.go
├── migrations/          # SQL migrations
├── tests/
│   └── integration/     # Integration tests
└── gen/                 # Generated proto code (not committed)
```

### Naming Conventions

- **Proto files**: `snake_case.proto` (e.g., `auth.proto`, `user_messages.proto`)
- **Go files**: `snake_case.go` (e.g., `auth_service.go`, `user_repository.go`)
- **Go types**: `PascalCase` (e.g., `AuthService`, `UserRepository`)
- **Proto messages**: `PascalCase` (e.g., `RegisterWithEmailRequest`)
- **Proto fields**: `snake_case` (e.g., `email_verified`, `user_id`)
- **Database tables**: `snake_case` (e.g., `users`, `user_profiles`)
- **Database columns**: `snake_case` (e.g., `created_at`, `email_verified`)

---

## Best Practices

### Proto Design

1. **Use semantic versioning** in package names (`v1`, `v2`)
2. **Never remove or renumber fields** - only add new ones
3. **Use `google.protobuf.Timestamp`** for dates (or custom common.v1.Timestamp)
4. **Group related messages** in separate files (e.g., `messages.proto`, `auth.proto`)
5. **Add comments** to all public services and methods

### Service Implementation

1. **Validate all inputs** at the service layer
2. **Use proper gRPC status codes**:
   - `codes.InvalidArgument` for bad input
   - `codes.NotFound` for missing resources
   - `codes.Unauthenticated` for auth failures
   - `codes.PermissionDenied` for authorization failures
3. **Log errors** but return user-friendly messages
4. **Use context** for timeouts and cancellation
5. **Implement idempotency** for state-changing operations

### Repository Pattern

1. **One repository per aggregate root** (e.g., UserRepository, OrderRepository)
2. **Return domain errors**, not database errors
3. **Use transactions** for multi-step operations
4. **Add database indexes** for all query fields
5. **Use prepared statements** (automatically done with `$1, $2` placeholders)

### Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guidelines.

---

## Quick Reference

### Common Commands

```bash
# Development
make up                    # Start all services
make down                  # Stop all services
make logs-backend          # View backend logs
make generate              # Generate proto code
make proto-watch           # Auto-generate on changes

# Testing
make test                  # Run all tests
make test-backend          # Backend unit tests
make test-integration      # Integration tests
grpcui -plaintext :9090    # Interactive gRPC testing

# Database
make db-reset              # Reset database
make db-console            # PostgreSQL console
make redis-cli             # Redis console

# Code Quality
buf lint proto             # Lint proto files
go vet ./...               # Go static analysis
go test ./... -race        # Race condition detection
```

### File Templates

See the `templates/` directory for:
- Proto service template
- Repository template
- Service implementation template
- Test template

---

For more details:
- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [GRPC_TESTING.md](./GRPC_TESTING.md) - gRPC testing tools and workflows
- [README.md](../README.md) - Project overview and setup
