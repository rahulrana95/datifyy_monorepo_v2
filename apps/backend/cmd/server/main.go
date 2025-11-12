package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/datifyy/backend/internal/email"
	"github.com/datifyy/backend/internal/service"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type Server struct {
	db    *sql.DB
	redis *redis.Client
}

func main() {
	// Get configuration from environment
	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8080"
	}

	grpcPort := os.Getenv("GRPC_PORT")
	if grpcPort == "" {
		grpcPort = "9090"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	// MailerSend configuration
	mailerSendAPIKey := os.Getenv("MAILERSEND_API_KEY")
	mailerSendFromEmail := os.Getenv("MAILERSEND_FROM_EMAIL")
	if mailerSendFromEmail == "" {
		mailerSendFromEmail = "noreply@datifyy.com"
	}
	mailerSendFromName := os.Getenv("MAILERSEND_FROM_NAME")
	if mailerSendFromName == "" {
		mailerSendFromName = "Datifyy"
	}

	// Connect to PostgreSQL
	db, err := connectPostgres(dbURL)
	if err != nil {
		log.Printf("Warning: Could not connect to PostgreSQL: %v", err)
		log.Println("Running without database connection")
	} else {
		defer db.Close()
		log.Println("✓ Connected to PostgreSQL")
	}

	// Connect to Redis
	redisClient, err := connectRedis(redisURL)
	if err != nil {
		log.Printf("Warning: Could not connect to Redis: %v", err)
		log.Println("Running without Redis connection")
	} else {
		defer redisClient.Close()
		log.Println("✓ Connected to Redis")
	}

	// Initialize MailerSend email client
	var emailClient *email.MailerSendClient
	if mailerSendAPIKey != "" {
		emailClient = email.NewMailerSendClient(mailerSendAPIKey, mailerSendFromEmail, mailerSendFromName)
		log.Println("✓ MailerSend email client initialized")
	} else {
		log.Println("Warning: MAILERSEND_API_KEY not set - email sending will be disabled")
	}

	// Create HTTP server
	httpServer := &Server{
		db:    db,
		redis: redisClient,
	}

	// Start gRPC server in a goroutine
	go startGRPCServer(grpcPort, db, redisClient, emailClient)

	// Start HTTP server in a goroutine
	go startHTTPServer(httpPort, httpServer, db, redisClient, emailClient)

	// Wait for interrupt signal to gracefully shutdown the servers
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down servers...")
}

// startGRPCServer starts the gRPC server
func startGRPCServer(port string, db *sql.DB, redisClient *redis.Client, emailClient *email.MailerSendClient) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to listen on port %s: %v", port, err)
	}

	// Create gRPC server
	grpcServer := grpc.NewServer()

	// Register services
	authService := service.NewAuthService(db, redisClient, emailClient)
	authpb.RegisterAuthServiceServer(grpcServer, authService)

	// Register reflection service (for grpcurl)
	reflection.Register(grpcServer)

	log.Printf("🚀 gRPC server listening on port %s", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}

// startHTTPServer starts the HTTP/REST server
func startHTTPServer(port string, server *Server, db *sql.DB, redisClient *redis.Client, emailClient *email.MailerSendClient) {
	// Setup routes
	mux := http.NewServeMux()

	// Health & Info endpoints
	mux.HandleFunc("/health", server.healthHandler)
	mux.HandleFunc("/ready", server.readyHandler)
	mux.HandleFunc("/", server.rootHandler)
	mux.HandleFunc("/api/test-db", server.testDBHandler)
	mux.HandleFunc("/api/test-redis", server.testRedisHandler)

	// Auth REST endpoints (wrapper around gRPC)
	authService := service.NewAuthService(db, redisClient, emailClient)
	mux.HandleFunc("/api/v1/auth/register/email", createRegisterHandler(authService))
	mux.HandleFunc("/api/v1/auth/login/email", createLoginHandler(authService))
	mux.HandleFunc("/api/v1/auth/token/refresh", createRefreshTokenHandler(authService))
	mux.HandleFunc("/api/v1/auth/token/revoke", createRevokeTokenHandler(authService))

	// Add CORS middleware
	handler := enableCORS(mux)

	// Start server
	log.Printf("🌐 HTTP server listening on port %s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), handler); err != nil {
		log.Fatal(err)
	}
}

// createRegisterHandler creates HTTP handler for registration
func createRegisterHandler(authService *service.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse JSON request
		var reqBody struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Name     string `json:"name"`
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
		grpcReq := &authpb.RegisterWithEmailRequest{
			Credentials: &authpb.EmailPasswordCredentials{
				Email:    reqBody.Email,
				Password: reqBody.Password,
				Name:     reqBody.Name,
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
		resp, err := authService.RegisterWithEmail(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Registration failed: %v", err), http.StatusBadRequest)
			return
		}

		// Convert response to JSON
		jsonResp := map[string]interface{}{
			"user": map[string]interface{}{
				"user_id":        resp.User.UserId,
				"email":          resp.User.Email,
				"name":           resp.User.Name,
				"account_status": resp.User.AccountStatus.String(),
				"email_verified": resp.User.EmailVerified.String(),
				"created_at": map[string]int64{
					"seconds": resp.User.CreatedAt.Seconds,
					"nanos":   int64(resp.User.CreatedAt.Nanos),
				},
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
			"requires_email_verification": resp.RequiresEmailVerification,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createLoginHandler creates HTTP handler for login
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
			Credentials: &authpb.EmailPasswordCredentials{
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

		// Convert response to JSON
		jsonResp := map[string]interface{}{
			"user": map[string]interface{}{
				"user_id":        resp.User.UserId,
				"email":          resp.User.Email,
				"name":           resp.User.Name,
				"account_status": resp.User.AccountStatus.String(),
				"email_verified": resp.User.EmailVerified.String(),
				"created_at": map[string]int64{
					"seconds": resp.User.CreatedAt.Seconds,
					"nanos":   int64(resp.User.CreatedAt.Nanos),
				},
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

// createRefreshTokenHandler creates HTTP handler for token refresh
func createRefreshTokenHandler(authService *service.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse JSON request
		var reqBody struct {
			RefreshToken string `json:"refresh_token"`
			DeviceInfo   *struct {
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
		grpcReq := &authpb.RefreshTokenRequest{
			RefreshToken: reqBody.RefreshToken,
		}

		if reqBody.DeviceInfo != nil {
			grpcReq.DeviceInfo = &authpb.DeviceInfo{
				Platform:   commonpb.DevicePlatform(reqBody.DeviceInfo.Platform),
				DeviceName: reqBody.DeviceInfo.DeviceName,
				OsVersion:  reqBody.DeviceInfo.OSVersion,
				DeviceId:   reqBody.DeviceInfo.DeviceID,
			}
		}

		// Call gRPC service
		resp, err := authService.RefreshToken(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Token refresh failed: %v", err), http.StatusUnauthorized)
			return
		}

		// Convert response to JSON
		jsonResp := map[string]interface{}{
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
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createRevokeTokenHandler creates HTTP handler for token revocation (logout)
func createRevokeTokenHandler(authService *service.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse JSON request
		var reqBody struct {
			RefreshToken string `json:"refresh_token"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Convert to gRPC request
		grpcReq := &authpb.RevokeTokenRequest{
			RefreshToken: reqBody.RefreshToken,
		}

		// Call gRPC service
		resp, err := authService.RevokeToken(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Token revocation failed: %v", err), http.StatusBadRequest)
			return
		}

		// Convert response to JSON
		jsonResp := map[string]interface{}{
			"message": resp.Message,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func connectPostgres(dbURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection with retries
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for i := 0; i < 10; i++ {
		if err := db.PingContext(ctx); err == nil {
			return db, nil
		}
		log.Printf("Waiting for database to be ready... attempt %d/10", i+1)
		time.Sleep(3 * time.Second)
	}

	return nil, fmt.Errorf("database not ready after 30 seconds")
}

func connectRedis(redisURL string) (*redis.Client, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis URL: %w", err)
	}

	client := redis.NewClient(opts)

	// Test connection with retries
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for i := 0; i < 10; i++ {
		if err := client.Ping(ctx).Err(); err == nil {
			return client, nil
		}
		log.Printf("Waiting for Redis to be ready... attempt %d/10", i+1)
		time.Sleep(3 * time.Second)
	}

	return nil, fmt.Errorf("redis not ready after 30 seconds")
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (s *Server) readyHandler(w http.ResponseWriter, r *http.Request) {
	// Check database connection
	if s.db != nil {
		if err := s.db.Ping(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Database not ready"))
			return
		}
	}

	// Check Redis connection
	if s.redis != nil {
		ctx := context.Background()
		if err := s.redis.Ping(ctx).Err(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Redis not ready"))
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("READY"))
}

func (s *Server) rootHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"service":   "Datifyy Backend API",
		"version":   "1.0.0",
		"timestamp": time.Now().UTC(),
		"endpoints": map[string]interface{}{
			"grpc": ":9090",
			"http": ":8080",
		},
		"status": map[string]bool{
			"database": s.db != nil && s.db.Ping() == nil,
			"redis":    s.redis != nil && s.redis.Ping(context.Background()).Err() == nil,
		},
		"available_services": []string{
			"AuthService (gRPC)",
			"UserService (gRPC - coming soon)",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) testDBHandler(w http.ResponseWriter, r *http.Request) {
	if s.db == nil {
		http.Error(w, "Database not connected", http.StatusServiceUnavailable)
		return
	}

	// Test query
	var now time.Time
	err := s.db.QueryRow("SELECT NOW()").Scan(&now)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"database": "connected",
		"time":     now,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) testRedisHandler(w http.ResponseWriter, r *http.Request) {
	if s.redis == nil {
		http.Error(w, "Redis not connected", http.StatusServiceUnavailable)
		return
	}

	ctx := context.Background()

	// Set a test value
	key := fmt.Sprintf("test:%d", time.Now().Unix())
	value := "Hello from Redis!"

	err := s.redis.Set(ctx, key, value, 10*time.Second).Err()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	// Get the value back
	result, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"redis":  "connected",
		"key":    key,
		"value":  result,
		"ttl":    "10 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
