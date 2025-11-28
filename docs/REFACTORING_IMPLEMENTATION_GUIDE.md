# Main.go Refactoring - Implementation Guide

**Step-by-step guide with code examples for refactoring main.go from 3,939 lines to a modular structure**

---

## 🎯 Quick Summary

We'll refactor main.go in **5 phases** with minimal risk:

1. **Phase 1**: Extract Configuration (~1 hour)
2. **Phase 2**: Extract Utilities (~2 hours)
3. **Phase 3**: Extract Handlers (~6 hours)
4. **Phase 4**: Extract Routing (~2 hours)
5. **Phase 5**: Cleanup main.go (~1 hour)

**Total Time**: ~12 hours of focused work
**Risk Level**: LOW (each phase is tested before moving to next)

---

## Phase 1: Extract Configuration (Start Here!)

### Step 1.1: Create Config Package

```bash
mkdir -p apps/backend/internal/config
```

### Step 1.2: Create config.go

**File: `apps/backend/internal/config/config.go`**

```go
package config

import (
	"fmt"
	"os"
)

// Config holds all application configuration
type Config struct {
	// Server Configuration
	HTTPPort string
	GRPCPort string

	// Database
	DatabaseURL string

	// Cache
	RedisURL string

	// Email Service
	MailerSendAPIKey string
	EmailFrom        string
	EmailFromName    string

	// AI Service
	GeminiAPIKey string

	// Notifications
	SlackWebhookURL string

	// Environment
	Environment string
}

// Load reads configuration from environment variables
func Load() *Config {
	return &Config{
		// Server
		HTTPPort: getEnv("PORT", "8080"),
		GRPCPort: getEnv("GRPC_PORT", "9090"),

		// Database
		DatabaseURL: getEnv(
			"DATABASE_URL",
			"postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable",
		),

		// Cache
		RedisURL: getEnv("REDIS_URL", "redis://localhost:6379"),

		// Email
		MailerSendAPIKey: os.Getenv("MAILERSEND_API_KEY"),
		EmailFrom:        getEnv("EMAIL_FROM", "noreply@datifyy.com"),
		EmailFromName:    getEnv("EMAIL_FROM_NAME", "Datifyy"),

		// AI
		GeminiAPIKey: os.Getenv("GEMINI_API_KEY"),

		// Notifications
		SlackWebhookURL: os.Getenv("SLACK_WEBHOOK_URL"),

		// Environment
		Environment: getEnv("ENV", "development"),
	}
}

// Validate checks if required configuration is present
func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.RedisURL == "" {
		return fmt.Errorf("REDIS_URL is required")
	}
	return nil
}

// IsDevelopment returns true if running in development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if running in production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// getEnv gets environment variable with fallback default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
```

### Step 1.3: Update main.go to Use Config

**Before:**
```go
func main() {
	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8080"
	}

	grpcPort := os.Getenv("GRPC_PORT")
	if grpcPort == "" {
		grpcPort = "9090"
	}

	// ... 20 more lines of config loading
}
```

**After:**
```go
import "github.com/datifyy/backend/internal/config"

func main() {
	// Load configuration
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Invalid configuration: %v", err)
	}

	log.Printf("Starting servers (HTTP: %s, gRPC: %s)", cfg.HTTPPort, cfg.GRPCPort)

	// Use cfg.DatabaseURL, cfg.RedisURL, etc.
}
```

### Step 1.4: Test Phase 1

```bash
cd apps/backend
go test ./internal/config/...
go run cmd/server/main.go
```

✅ **Checkpoint**: Application still starts and works

---

## Phase 2: Extract Utilities

### Step 2.1: Create Converter Package

```bash
mkdir -p apps/backend/internal/util/converter
```

**File: `apps/backend/internal/util/converter/user.go`**

```go
package converter

import (
	userpb "github.com/datifyy/backend/gen/user/v1"
)

// UserProfileToJSON converts protobuf UserProfile to JSON map
func UserProfileToJSON(profile *userpb.UserProfile) map[string]interface{} {
	if profile == nil {
		return nil
	}

	return map[string]interface{}{
		"id":            profile.Id,
		"email":         profile.Email,
		"name":          profile.Name,
		"phoneNumber":   profile.PhoneNumber,
		"dateOfBirth":   profile.DateOfBirth,
		"gender":        profile.Gender.String(),
		"bio":           profile.Bio,
		"location":      profile.Location,
		"occupation":    profile.Occupation,
		"education":     profile.Education,
		"height":        profile.Height,
		"drinking":      profile.Drinking.String(),
		"smoking":       profile.Smoking.String(),
		"interests":     profile.Interests,
		"languages":     profile.Languages,
		"pronouns":      profile.Pronouns,
		"zodiacSign":    profile.ZodiacSign,
		"accountStatus": profile.AccountStatus.String(),
		"createdAt":     profile.CreatedAt,
		"updatedAt":     profile.UpdatedAt,
	}
}

// PartnerPreferencesToJSON converts protobuf PartnerPreferences to JSON
func PartnerPreferencesToJSON(prefs *userpb.PartnerPreferences) map[string]interface{} {
	if prefs == nil {
		return nil
	}

	preferredGenders := make([]string, len(prefs.PreferredGenders))
	for i, gender := range prefs.PreferredGenders {
		preferredGenders[i] = gender.String()
	}

	return map[string]interface{}{
		"ageMin":           prefs.AgeMin,
		"ageMax":           prefs.AgeMax,
		"preferredGenders": preferredGenders,
		"maxDistance":      prefs.MaxDistance,
		"interests":        prefs.Interests,
		"dealbreakers":     prefs.Dealbreakers,
	}
}
```

**File: `apps/backend/internal/util/converter/availability.go`**

```go
package converter

import (
	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
)

// AvailabilitySlotToJSON converts protobuf slot to JSON
func AvailabilitySlotToJSON(slot *availabilitypb.AvailabilitySlot) map[string]interface{} {
	if slot == nil {
		return nil
	}

	return map[string]interface{}{
		"id":        slot.Id,
		"userId":    slot.UserId,
		"startTime": slot.StartTime,
		"endTime":   slot.EndTime,
		"dateType":  slot.DateType.String(),
		"location":  slot.Location,
		"notes":     slot.Notes,
		"createdAt": slot.CreatedAt,
	}
}

// AvailabilitySlotsToJSON converts multiple slots
func AvailabilitySlotsToJSON(slots []*availabilitypb.AvailabilitySlot) []map[string]interface{} {
	result := make([]map[string]interface{}, len(slots))
	for i, slot := range slots {
		result[i] = AvailabilitySlotToJSON(slot)
	}
	return result
}
```

### Step 2.2: Create Parser Package

```bash
mkdir -p apps/backend/internal/util/parser
```

**File: `apps/backend/internal/util/parser/parser.go`**

```go
package parser

import (
	"strconv"
	"strings"

	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
)

// ParseInt64 safely parses string to int64
func ParseInt64(s string) (int64, error) {
	if s == "" {
		return 0, nil
	}
	return strconv.ParseInt(s, 10, 64)
}

// ParseInt32 safely parses string to int32
func ParseInt32(s string) (int32, error) {
	if s == "" {
		return 0, nil
	}
	val, err := strconv.ParseInt(s, 10, 32)
	return int32(val), err
}

// ParseBool safely parses string to bool
func ParseBool(s string) bool {
	val, _ := strconv.ParseBool(s)
	return val
}

// StringToDateType converts string to DateType enum
func StringToDateType(s string) availabilitypb.DateType {
	switch strings.ToUpper(s) {
	case "ONLINE":
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	case "OFFLINE":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE
	case "EVENT":
		return availabilitypb.DateType_DATE_TYPE_EVENT
	default:
		return availabilitypb.DateType_DATE_TYPE_UNSPECIFIED
	}
}
```

### Step 2.3: Update main.go to Use Utilities

**Before (in main.go):**
```go
func parseInt64(s string) (int64, error) {
	if s == "" {
		return 0, nil
	}
	return strconv.ParseInt(s, 10, 64)
}

func convertUserProfileToJSON(profile *userpb.UserProfile) map[string]interface{} {
	// 50 lines of conversion logic
}
```

**After (in main.go):**
```go
import (
	"github.com/datifyy/backend/internal/util/converter"
	"github.com/datifyy/backend/internal/util/parser"
)

// Use converter.UserProfileToJSON(profile)
// Use parser.ParseInt64(str)
```

✅ **Checkpoint**: Utilities tested and working

---

## Phase 3: Extract HTTP Handlers

### Step 3.1: Create Auth Handler Package

```bash
mkdir -p apps/backend/internal/handler/http/auth
```

**File: `apps/backend/internal/handler/http/auth/handler.go`**

```go
package auth

import (
	"github.com/datifyy/backend/internal/service"
)

// Handler handles authentication HTTP requests
type Handler struct {
	authService *service.AuthService
}

// NewHandler creates a new auth handler
func NewHandler(authService *service.AuthService) *Handler {
	return &Handler{
		authService: authService,
	}
}
```

**File: `apps/backend/internal/handler/http/auth/register.go`**

```go
package auth

import (
	"encoding/json"
	"net/http"

	authpb "github.com/datifyy/backend/gen/auth/v1"
)

// Register handles user registration
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req authpb.RegisterWithEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.authService.RegisterWithEmail(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"userId":       resp.UserId,
		"accessToken":  resp.AccessToken,
		"refreshToken": resp.RefreshToken,
		"expiresIn":    resp.ExpiresIn,
	})
}
```

**File: `apps/backend/internal/handler/http/auth/login.go`**

```go
package auth

import (
	"encoding/json"
	"net/http"

	authpb "github.com/datifyy/backend/gen/auth/v1"
)

// Login handles user login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req authpb.LoginWithEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.authService.LoginWithEmail(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"userId":       resp.UserId,
		"accessToken":  resp.AccessToken,
		"refreshToken": resp.RefreshToken,
		"expiresIn":    resp.ExpiresIn,
	})
}
```

**File: `apps/backend/internal/handler/http/auth/token.go`**

```go
package auth

import (
	"encoding/json"
	"net/http"

	authpb "github.com/datifyy/backend/gen/auth/v1"
)

// RefreshToken handles token refresh
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req authpb.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.authService.RefreshToken(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"accessToken": resp.AccessToken,
		"expiresIn":   resp.ExpiresIn,
	})
}

// RevokeToken handles token revocation
func (h *Handler) RevokeToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req authpb.RevokeTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := h.authService.RevokeToken(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Token revoked successfully",
	})
}
```

### Step 3.2: Create User Handler Package

```bash
mkdir -p apps/backend/internal/handler/http/user
```

**File: `apps/backend/internal/handler/http/user/handler.go`**

```go
package user

import (
	"github.com/datifyy/backend/internal/service"
)

// Handler handles user HTTP requests
type Handler struct {
	userService *service.UserService
}

// NewHandler creates a new user handler
func NewHandler(userService *service.UserService) *Handler {
	return &Handler{
		userService: userService,
	}
}
```

**File: `apps/backend/internal/handler/http/user/profile.go`**

```go
package user

import (
	"encoding/json"
	"net/http"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/util/converter"
)

// GetProfile handles GET profile requests
func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// TODO: Extract user ID from auth token
	userId := r.Header.Get("X-User-ID") // Temporary

	req := &userpb.GetMyProfileRequest{UserId: userId}
	resp, err := h.userService.GetMyProfile(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(converter.UserProfileToJSON(resp.Profile))
}

// UpdateProfile handles PUT profile requests
func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req userpb.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	resp, err := h.userService.UpdateProfile(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(converter.UserProfileToJSON(resp.Profile))
}
```

### Step 3.3: Pattern for Remaining Handlers

Follow the same pattern for:
- `internal/handler/http/admin/` (6 files: handler.go, auth.go, users.go, dates.go, curation.go, analytics.go)
- `internal/handler/http/availability/` (2 files: handler.go, availability.go)
- `internal/handler/http/health/` (2 files: handler.go, health.go)
- `internal/handler/http/slack/` (2 files: handler.go, notifications.go)

✅ **Checkpoint**: Each handler package tested individually

---

## Phase 4: Extract Routing

### Step 4.1: Create Router Package

```bash
mkdir -p apps/backend/internal/router
```

**File: `apps/backend/internal/router/http.go`**

```go
package router

import (
	"net/http"

	authHandler "github.com/datifyy/backend/internal/handler/http/auth"
	userHandler "github.com/datifyy/backend/internal/handler/http/user"
	adminHandler "github.com/datifyy/backend/internal/handler/http/admin"
	availabilityHandler "github.com/datifyy/backend/internal/handler/http/availability"
	healthHandler "github.com/datifyy/backend/internal/handler/http/health"
	slackHandler "github.com/datifyy/backend/internal/handler/http/slack"
)

// HTTPRouter manages HTTP routes
type HTTPRouter struct {
	mux *http.ServeMux

	// Handlers
	auth         *authHandler.Handler
	user         *userHandler.Handler
	admin        *adminHandler.Handler
	availability *availabilityHandler.Handler
	health       *healthHandler.Handler
	slack        *slackHandler.Handler
}

// NewHTTPRouter creates a new HTTP router
func NewHTTPRouter(
	auth *authHandler.Handler,
	user *userHandler.Handler,
	admin *adminHandler.Handler,
	availability *availabilityHandler.Handler,
	health *healthHandler.Handler,
	slack *slackHandler.Handler,
) *HTTPRouter {
	router := &HTTPRouter{
		mux:          http.NewServeMux(),
		auth:         auth,
		user:         user,
		admin:        admin,
		availability: availability,
		health:       health,
		slack:        slack,
	}

	router.registerRoutes()
	return router
}

// registerRoutes registers all HTTP routes
func (r *HTTPRouter) registerRoutes() {
	// Health endpoints
	r.mux.HandleFunc("/health", r.health.Health)
	r.mux.HandleFunc("/ready", r.health.Ready)
	r.mux.HandleFunc("/", r.health.Root)

	// Auth endpoints
	r.mux.HandleFunc("/api/v1/auth/register/email", r.auth.Register)
	r.mux.HandleFunc("/api/v1/auth/login/email", r.auth.Login)
	r.mux.HandleFunc("/api/v1/auth/token/refresh", r.auth.RefreshToken)
	r.mux.HandleFunc("/api/v1/auth/token/revoke", r.auth.RevokeToken)

	// User endpoints
	r.mux.HandleFunc("/api/v1/user/me", r.user.GetProfile)
	r.mux.HandleFunc("/api/v1/partner-preferences", r.user.PartnerPreferences)

	// Availability endpoints
	r.mux.HandleFunc("/api/v1/availability", r.availability.Availability)

	// Admin endpoints
	r.mux.HandleFunc("/api/v1/admin/login", r.admin.Login)
	r.mux.HandleFunc("/api/v1/admin/users", r.admin.GetAllUsers)
	// ... more admin routes

	// Slack endpoints
	r.mux.HandleFunc("/api/v1/slack/send", r.slack.SendMessage)
	r.mux.HandleFunc("/api/v1/slack/alert", r.slack.SendAlert)
	r.mux.HandleFunc("/api/v1/slack/notification", r.slack.SendNotification)
	r.mux.HandleFunc("/api/v1/slack/test", r.slack.Test)
}

// Handler returns the HTTP handler
func (r *HTTPRouter) Handler() http.Handler {
	return r.mux
}
```

✅ **Checkpoint**: All routes registered and working

---

## Phase 5: Cleanup main.go

### Final main.go Structure

**File: `apps/backend/cmd/server/main.go`**

```go
package main

import (
	"context"
	"database/sql"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	adminpb "github.com/datifyy/backend/gen/admin/v1"
	authpb "github.com/datifyy/backend/gen/auth/v1"
	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"

	"github.com/datifyy/backend/internal/config"
	"github.com/datifyy/backend/internal/email"
	adminHandler "github.com/datifyy/backend/internal/handler/http/admin"
	authHandler "github.com/datifyy/backend/internal/handler/http/auth"
	availabilityHandler "github.com/datifyy/backend/internal/handler/http/availability"
	healthHandler "github.com/datifyy/backend/internal/handler/http/health"
	slackHandler "github.com/datifyy/backend/internal/handler/http/slack"
	userHandler "github.com/datifyy/backend/internal/handler/http/user"
	"github.com/datifyy/backend/internal/router"
	"github.com/datifyy/backend/internal/service"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	// Load configuration
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Invalid configuration: %v", err)
	}

	log.Printf("🚀 Starting Datifyy Backend (env: %s)", cfg.Environment)

	// Connect to database
	db, err := connectDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("✓ Connected to PostgreSQL")

	// Connect to Redis
	redisClient, err := connectRedis(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()
	log.Println("✓ Connected to Redis")

	// Initialize services
	emailClient := email.NewMailerSendClient(
		cfg.MailerSendAPIKey,
		cfg.EmailFrom,
		cfg.EmailFromName,
	)
	authService := service.NewAuthService(db, redisClient, emailClient)
	userService := service.NewUserService(db, redisClient)
	availService := service.NewAvailabilityService(db)
	adminService, err := service.NewAdminService(db, redisClient)
	if err != nil {
		log.Fatalf("Failed to create admin service: %v", err)
	}

	// Start servers
	go startGRPCServer(cfg.GRPCPort, authService, userService, availService, adminService)
	go startHTTPServer(cfg, db, redisClient, authService, userService, availService, adminService)

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down servers...")
}

func startGRPCServer(
	port string,
	authSvc *service.AuthService,
	userSvc *service.UserService,
	availSvc *service.AvailabilityService,
	adminSvc *service.AdminService,
) {
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	authpb.RegisterAuthServiceServer(grpcServer, authSvc)
	userpb.RegisterUserServiceServer(grpcServer, userSvc)
	availabilitypb.RegisterAvailabilityServiceServer(grpcServer, availSvc)
	adminpb.RegisterAdminServiceServer(grpcServer, adminSvc)
	reflection.Register(grpcServer)

	log.Printf("🚀 gRPC server listening on port %s", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}

func startHTTPServer(
	cfg *config.Config,
	db *sql.DB,
	redisClient *redis.Client,
	authSvc *service.AuthService,
	userSvc *service.UserService,
	availSvc *service.AvailabilityService,
	adminSvc *service.AdminService,
) {
	// Create handlers
	authHdlr := authHandler.NewHandler(authSvc)
	userHdlr := userHandler.NewHandler(userSvc)
	adminHdlr := adminHandler.NewHandler(adminSvc)
	availHdlr := availabilityHandler.NewHandler(availSvc)
	healthHdlr := healthHandler.NewHandler(db, redisClient)
	slackHdlr := slackHandler.NewHandler(cfg.SlackWebhookURL)

	// Setup router
	httpRouter := router.NewHTTPRouter(
		authHdlr,
		userHdlr,
		adminHdlr,
		availHdlr,
		healthHdlr,
		slackHdlr,
	)

	// Apply CORS middleware
	handler := enableCORS(httpRouter.Handler())

	// Start server
	server := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Printf("🌐 HTTP server listening on port %s", cfg.HTTPPort)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to serve HTTP: %v", err)
	}
}

func connectDatabase(dbURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func connectRedis(redisURL string) (*redis.Client, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opts)
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}
	return client, nil
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
```

**Result:** main.go is now ~150 lines instead of 3,939! 🎉

---

## Testing Each Phase

### Test Checklist

After each phase:

```bash
# 1. Build check
cd apps/backend
go build ./cmd/server

# 2. Run tests
go test ./...

# 3. Start server
go run cmd/server/main.go

# 4. Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/ready

# 5. Test auth
curl -X POST http://localhost:8080/api/v1/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

## Migration Timeline

### Day 1: Foundation
- ✅ Phase 1: Config (1 hour)
- ✅ Phase 2: Utilities (2 hours)
- ✅ Test and verify

### Day 2-3: Handlers
- ✅ Phase 3: Auth handlers (2 hours)
- ✅ Phase 3: User handlers (2 hours)
- ✅ Phase 3: Admin handlers (3 hours)
- ✅ Phase 3: Other handlers (1 hour)
- ✅ Test each domain

### Day 4: Finalize
- ✅ Phase 4: Routing (2 hours)
- ✅ Phase 5: Cleanup main.go (1 hour)
- ✅ Full integration testing
- ✅ Update documentation

---

## Success! 🎉

You've successfully refactored main.go from 3,939 lines to a clean, modular structure with:

- ✅ main.go: ~150 lines
- ✅ Config package: Centralized configuration
- ✅ Handler packages: Organized by domain
- ✅ Utility packages: Reusable helpers
- ✅ Router package: Clear route registration
- ✅ Easy to test, maintain, and extend

**Next Steps:**
1. Add unit tests for each handler
2. Add integration tests
3. Update documentation
4. Deploy to staging for validation
