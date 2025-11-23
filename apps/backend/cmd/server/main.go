package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	adminpb "github.com/datifyy/backend/gen/admin/v1"
	authpb "github.com/datifyy/backend/gen/auth/v1"
	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/email"
	"github.com/datifyy/backend/internal/middleware"
	"github.com/datifyy/backend/internal/service"
	"github.com/datifyy/backend/internal/slack"
	"github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"google.golang.org/protobuf/encoding/protojson"
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

	// Create HTTP server
	httpServer := &Server{
		db:    db,
		redis: redisClient,
	}

	// Start gRPC server in a goroutine
	go startGRPCServer(grpcPort, db, redisClient)

	// Start HTTP server in a goroutine
	go startHTTPServer(httpPort, httpServer, db, redisClient)

	// Wait for interrupt signal to gracefully shutdown the servers
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down servers...")
}

// startGRPCServer starts the gRPC server
func startGRPCServer(port string, db *sql.DB, redisClient *redis.Client) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to listen on port %s: %v", port, err)
	}

	// Create gRPC server
	grpcServer := grpc.NewServer()

	// Initialize email client
	emailAPIKey := os.Getenv("MAILERSEND_API_KEY")
	emailFrom := os.Getenv("EMAIL_FROM")
	if emailFrom == "" {
		emailFrom = "noreply@datifyy.com"
	}
	emailFromName := os.Getenv("EMAIL_FROM_NAME")
	if emailFromName == "" {
		emailFromName = "Datifyy"
	}
	emailClient := email.NewMailerSendClient(emailAPIKey, emailFrom, emailFromName)

	// Register services
	authService := service.NewAuthService(db, redisClient, emailClient)
	authpb.RegisterAuthServiceServer(grpcServer, authService)

	userService := service.NewUserService(db, redisClient)
	userpb.RegisterUserServiceServer(grpcServer, userService)

	availabilityService := service.NewAvailabilityService(db)
	availabilitypb.RegisterAvailabilityServiceServer(grpcServer, availabilityService)

	adminService, err := service.NewAdminService(db, redisClient)
	if err != nil {
		log.Fatalf("Failed to create admin service: %v", err)
	}
	adminpb.RegisterAdminServiceServer(grpcServer, adminService)

	// Register reflection service (for grpcurl)
	reflection.Register(grpcServer)

	log.Printf("🚀 gRPC server listening on port %s", port)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}

// startHTTPServer starts the HTTP/REST server
func startHTTPServer(port string, server *Server, db *sql.DB, redisClient *redis.Client) {
	// Setup routes
	mux := http.NewServeMux()

	// Health & Info endpoints
	mux.HandleFunc("/health", server.healthHandler)
	mux.HandleFunc("/ready", server.readyHandler)
	mux.HandleFunc("/", server.rootHandler)
	mux.HandleFunc("/api/test-db", server.testDBHandler)
	mux.HandleFunc("/api/test-redis", server.testRedisHandler)

	// Initialize email client
	emailAPIKey := os.Getenv("MAILERSEND_API_KEY")
	emailFrom := os.Getenv("EMAIL_FROM")
	if emailFrom == "" {
		emailFrom = "noreply@datifyy.com"
	}
	emailFromName := os.Getenv("EMAIL_FROM_NAME")
	if emailFromName == "" {
		emailFromName = "Datifyy"
	}
	emailClient := email.NewMailerSendClient(emailAPIKey, emailFrom, emailFromName)

	// Initialize Slack client
	slackWebhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	slackService := slack.NewSlackService(slackWebhookURL)
	if slackService.IsEnabled() {
		log.Println("✓ Slack integration enabled")
	} else {
		log.Println("⚠ Slack integration disabled (SLACK_WEBHOOK_URL not set)")
	}

	// Initialize rate limiter
	rateLimiter := middleware.NewRateLimiter(redisClient)
	log.Println("✓ Rate limiter initialized")

	// Auth REST endpoints (wrapper around gRPC)
	authService := service.NewAuthService(db, redisClient, emailClient)
	mux.HandleFunc("/api/v1/auth/register/email", createRegisterHandler(authService))
	mux.HandleFunc("/api/v1/auth/login/email", createLoginHandler(authService))
	mux.HandleFunc("/api/v1/auth/token/refresh", createRefreshTokenHandler(authService))
	mux.HandleFunc("/api/v1/auth/token/revoke", createRevokeTokenHandler(authService))

	// User REST endpoints (wrapper around gRPC)
	userService := service.NewUserService(db, redisClient)
	mux.HandleFunc("/api/v1/user/me", createUserProfileHandler(userService))
	mux.HandleFunc("/api/v1/partner-preferences", createPartnerPreferencesHandler(userService))

	// Availability REST endpoints
	availabilityService := service.NewAvailabilityService(db)
	mux.HandleFunc("/api/v1/availability", createAvailabilityHandler(availabilityService))

	// Admin REST endpoints
	adminService, err := service.NewAdminService(db, redisClient)
	if err != nil {
		log.Fatalf("Failed to create admin service: %v", err)
	}

	// Dates service for curation functionality
	datesService, err := service.NewDatesService(db, redisClient)
	if err != nil {
		log.Fatalf("Failed to create dates service: %v", err)
	}
	defer datesService.Close()

	mux.HandleFunc("/api/v1/admin/login", createAdminLoginHandler(adminService))
	mux.HandleFunc("/api/v1/admin/users", createAdminGetAllUsersHandler(adminService))
	mux.HandleFunc("/api/v1/admin/users/search", createAdminSearchUsersHandler(adminService))
	mux.HandleFunc("/api/v1/admin/users/bulk", createAdminBulkUserActionHandler(adminService))
	mux.HandleFunc("/api/v1/admin/users/", createAdminGetUserDetailsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/suggestions/", createAdminGetSuggestionsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/dates", createAdminDatesHandler(adminService))
	mux.HandleFunc("/api/v1/admin/dates/", createAdminDateStatusHandler(adminService))

	// Admin Curation endpoints (AI-powered matching)
	mux.HandleFunc("/api/v1/admin/curation/candidates", createAdminGetCurationCandidatesHandler(adminService))
	mux.HandleFunc("/api/v1/admin/curation/analyze", createAdminCurateDatesHandler(adminService, db))
	mux.HandleFunc("/api/v1/admin/curation/action", createAdminUpdateCuratedMatchActionHandler(datesService))
	mux.HandleFunc("/api/v1/admin/curation/matches", createAdminGetCuratedMatchesByStatusHandler(datesService))
	mux.HandleFunc("/api/v1/admin/curation/matches/", createAdminCreateSuggestionsHandler(datesService))

	// User Date Suggestions endpoints
	mux.HandleFunc("/api/v1/user/suggestions", createUserGetSuggestionsHandler(datesService))
	mux.HandleFunc("/api/v1/user/suggestions/", createUserRespondToSuggestionHandler(datesService))

	// Admin Analytics endpoints
	mux.HandleFunc("/api/v1/admin/analytics/platform", createAdminGetPlatformStatsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/analytics/user-growth", createAdminGetUserGrowthHandler(adminService))
	mux.HandleFunc("/api/v1/admin/analytics/active-users", createAdminGetActiveUsersHandler(adminService))
	mux.HandleFunc("/api/v1/admin/analytics/signups", createAdminGetSignupsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/analytics/demographics", createAdminGetDemographicsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/analytics/locations", createAdminGetLocationStatsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/analytics/availability", createAdminGetAvailabilityStatsHandler(adminService))

	// Admin Management endpoints
	mux.HandleFunc("/api/v1/admin/admins", createAdminManageAdminsHandler(adminService))
	mux.HandleFunc("/api/v1/admin/admins/", createAdminManageAdminByIdHandler(adminService))
	mux.HandleFunc("/api/v1/admin/profile", createAdminUpdateProfileHandler(adminService))

	// Slack Integration endpoints
	mux.HandleFunc("/api/v1/slack/send", createSlackSendMessageHandler(slackService))
	mux.HandleFunc("/api/v1/slack/alert", createSlackAlertHandler(slackService))
	mux.HandleFunc("/api/v1/slack/notification", createSlackNotificationHandler(slackService))
	mux.HandleFunc("/api/v1/slack/test", createSlackTestHandler(slackService))

	// Apply middleware chain: Rate Limiter -> CORS -> Handlers
	handler := rateLimiter.Middleware(mux)
	handler = enableCORS(handler)

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
			Email      string `json:"email"`
			Password   string `json:"password"`
			Name       string `json:"name"`
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

		// Convert response to JSON (camelCase)
		jsonResp := map[string]interface{}{
			"user": map[string]interface{}{
				"userId":        resp.User.UserId,
				"email":         resp.User.Email,
				"name":          resp.User.Name,
				"accountStatus": resp.User.AccountStatus.String(),
				"emailVerified": resp.User.EmailVerified.String(),
				"createdAt": map[string]int64{
					"seconds": resp.User.CreatedAt.Seconds,
					"nanos":   int64(resp.User.CreatedAt.Nanos),
				},
			},
			"tokens": map[string]interface{}{
				"accessToken": map[string]interface{}{
					"token":     resp.Tokens.AccessToken.Token,
					"tokenType": resp.Tokens.AccessToken.TokenType,
					"expiresAt": map[string]int64{
						"seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
						"nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
					},
				},
				"refreshToken": map[string]interface{}{
					"token": resp.Tokens.RefreshToken.Token,
					"expiresAt": map[string]int64{
						"seconds": resp.Tokens.RefreshToken.ExpiresAt.Seconds,
						"nanos":   int64(resp.Tokens.RefreshToken.ExpiresAt.Nanos),
					},
				},
			},
			"session": map[string]interface{}{
				"sessionId": resp.Session.SessionId,
				"userId":    resp.Session.UserId,
			},
			"requiresEmailVerification": resp.RequiresEmailVerification,
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
			Email      string `json:"email"`
			Password   string `json:"password"`
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

		// Convert response to JSON (camelCase)
		jsonResp := map[string]interface{}{
			"user": map[string]interface{}{
				"userId":        resp.User.UserId,
				"email":         resp.User.Email,
				"name":          resp.User.Name,
				"accountStatus": resp.User.AccountStatus.String(),
				"emailVerified": resp.User.EmailVerified.String(),
				"createdAt": map[string]int64{
					"seconds": resp.User.CreatedAt.Seconds,
					"nanos":   int64(resp.User.CreatedAt.Nanos),
				},
			},
			"tokens": map[string]interface{}{
				"accessToken": map[string]interface{}{
					"token":     resp.Tokens.AccessToken.Token,
					"tokenType": resp.Tokens.AccessToken.TokenType,
					"expiresAt": map[string]int64{
						"seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
						"nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
					},
				},
				"refreshToken": map[string]interface{}{
					"token": resp.Tokens.RefreshToken.Token,
					"expiresAt": map[string]int64{
						"seconds": resp.Tokens.RefreshToken.ExpiresAt.Seconds,
						"nanos":   int64(resp.Tokens.RefreshToken.ExpiresAt.Nanos),
					},
				},
			},
			"session": map[string]interface{}{
				"sessionId": resp.Session.SessionId,
				"userId":    resp.Session.UserId,
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

		// Convert response to JSON (camelCase)
		jsonResp := map[string]interface{}{
			"tokens": map[string]interface{}{
				"accessToken": map[string]interface{}{
					"token":     resp.Tokens.AccessToken.Token,
					"tokenType": resp.Tokens.AccessToken.TokenType,
					"expiresAt": map[string]int64{
						"seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
						"nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
					},
				},
				"refreshToken": map[string]interface{}{
					"token": resp.Tokens.RefreshToken.Token,
					"expiresAt": map[string]int64{
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

// createUserProfileHandler creates HTTP handler for user profile (GET and PUT)
func createUserProfileHandler(userService *service.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract access token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix
		accessToken := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			accessToken = authHeader[7:]
		}

		// Parse access token to get user ID
		var userID int
		var timestamp int64
		_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
		if err != nil {
			http.Error(w, "Invalid access token format", http.StatusUnauthorized)
			return
		}

		// Add userID to context
		ctx := context.WithValue(r.Context(), "userID", userID)

		// Handle GET request (GetMyProfile)
		if r.Method == http.MethodGet {
			grpcReq := &userpb.GetMyProfileRequest{}

			// Call gRPC service
			resp, err := userService.GetMyProfile(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to get profile: %v", err), http.StatusInternalServerError)
				return
			}

			// Convert response to JSON
			jsonResp := map[string]interface{}{
				"profile": convertUserProfileToJSON(resp.Profile),
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		// Handle PUT request (UpdateProfile)
		if r.Method == http.MethodPut {
			// Read request body
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusBadRequest)
				return
			}

			// Parse using protojson to handle string enums
			grpcReq := &userpb.UpdateProfileRequest{}
			unmarshaler := protojson.UnmarshalOptions{
				DiscardUnknown: true,
			}
			if err := unmarshaler.Unmarshal(body, grpcReq); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			// Call gRPC service
			resp, err := userService.UpdateProfile(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to update profile: %v", err), http.StatusBadRequest)
				return
			}

			// Convert response to JSON
			jsonResp := map[string]interface{}{
				"profile": convertUserProfileToJSON(resp.Profile),
				"message": resp.Message,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// convertUserProfileToJSON converts UserProfile protobuf to JSON-compatible map (camelCase)
func convertUserProfileToJSON(profile *userpb.UserProfile) map[string]interface{} {
	if profile == nil {
		return nil
	}

	result := map[string]interface{}{
		"userId":               profile.UserId,
		"completionPercentage": profile.CompletionPercentage,
		"isPublic":             profile.IsPublic,
		"isVerified":           profile.IsVerified,
	}

	// Basic Info
	if profile.BasicInfo != nil {
		result["basicInfo"] = map[string]interface{}{
			"name":        profile.BasicInfo.Name,
			"email":       profile.BasicInfo.Email,
			"phoneNumber": profile.BasicInfo.PhoneNumber,
			"age":         profile.BasicInfo.Age,
			"gender":      profile.BasicInfo.Gender.String(),
		}
		if profile.BasicInfo.DateOfBirth != nil {
			result["basicInfo"].(map[string]interface{})["dateOfBirth"] = map[string]int64{
				"seconds": profile.BasicInfo.DateOfBirth.Seconds,
				"nanos":   int64(profile.BasicInfo.DateOfBirth.Nanos),
			}
		}
	}

	// Profile Details
	if profile.ProfileDetails != nil {
		result["profileDetails"] = map[string]interface{}{
			"bio":      profile.ProfileDetails.Bio,
			"company":  profile.ProfileDetails.Company,
			"jobTitle": profile.ProfileDetails.JobTitle,
			"school":   profile.ProfileDetails.School,
			"height":   profile.ProfileDetails.Height,
			"hometown": profile.ProfileDetails.Hometown,
		}
	}

	// Lifestyle Info
	if profile.LifestyleInfo != nil {
		result["lifestyleInfo"] = map[string]interface{}{
			"drinking":           profile.LifestyleInfo.Drinking.String(),
			"smoking":            profile.LifestyleInfo.Smoking.String(),
			"workout":            profile.LifestyleInfo.Workout.String(),
			"dietaryPreference":  profile.LifestyleInfo.DietaryPreference.String(),
			"religion":           profile.LifestyleInfo.Religion.String(),
			"religionImportance": profile.LifestyleInfo.ReligionImportance.String(),
			"politicalView":      profile.LifestyleInfo.PoliticalView.String(),
			"pets":               profile.LifestyleInfo.Pets.String(),
			"children":           profile.LifestyleInfo.Children.String(),
			"personalityType":    profile.LifestyleInfo.PersonalityType,
			"communicationStyle": profile.LifestyleInfo.CommunicationStyle.String(),
			"loveLanguage":       profile.LifestyleInfo.LoveLanguage.String(),
			"sleepSchedule":      profile.LifestyleInfo.SleepSchedule.String(),
		}
	}

	// Photos
	if len(profile.Photos) > 0 {
		photos := make([]map[string]interface{}, len(profile.Photos))
		for i, photo := range profile.Photos {
			photos[i] = map[string]interface{}{
				"photoId":      photo.PhotoId,
				"url":          photo.Url,
				"thumbnailUrl": photo.ThumbnailUrl,
				"order":        photo.Order,
				"isPrimary":    photo.IsPrimary,
				"caption":      photo.Caption,
			}
		}
		result["photos"] = photos
	}

	// Prompts
	if len(profile.Prompts) > 0 {
		result["prompts"] = profile.Prompts
	}

	// Partner Preferences - use protojson to serialize with string enums
	if profile.PartnerPreferences != nil {
		marshaler := protojson.MarshalOptions{
			EmitUnpopulated: true,
		}
		prefsJSON, err := marshaler.Marshal(profile.PartnerPreferences)
		if err == nil {
			var prefsMap map[string]interface{}
			if json.Unmarshal(prefsJSON, &prefsMap) == nil {
				result["partnerPreferences"] = prefsMap
			}
		}
	}

	// User Preferences
	if profile.UserPreferences != nil {
		result["userPreferences"] = profile.UserPreferences
	}

	// Metadata
	if profile.Metadata != nil {
		result["metadata"] = map[string]interface{}{
			"status":        profile.Metadata.Status.String(),
			"emailVerified": profile.Metadata.EmailVerified.String(),
			"phoneVerified": profile.Metadata.PhoneVerified.String(),
			"isVerified":    profile.Metadata.IsVerified,
		}
		if profile.Metadata.CreatedAt != nil {
			result["metadata"].(map[string]interface{})["createdAt"] = map[string]int64{
				"seconds": profile.Metadata.CreatedAt.Seconds,
				"nanos":   int64(profile.Metadata.CreatedAt.Nanos),
			}
		}
		if profile.Metadata.UpdatedAt != nil {
			result["metadata"].(map[string]interface{})["updatedAt"] = map[string]int64{
				"seconds": profile.Metadata.UpdatedAt.Seconds,
				"nanos":   int64(profile.Metadata.UpdatedAt.Nanos),
			}
		}
	}

	return result
}

// createPartnerPreferencesHandler creates HTTP handler for partner preferences (GET and PUT)
func createPartnerPreferencesHandler(userService *service.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract access token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix
		accessToken := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			accessToken = authHeader[7:]
		}

		// Parse access token to get user ID
		var userID int
		var timestamp int64
		_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
		if err != nil {
			http.Error(w, "Invalid access token format", http.StatusUnauthorized)
			return
		}

		// Add userID to context
		ctx := context.WithValue(r.Context(), "userID", userID)

		// Handle GET request (GetPartnerPreferences)
		if r.Method == http.MethodGet {
			grpcReq := &userpb.GetPartnerPreferencesRequest{}

			// Call gRPC service
			resp, err := userService.GetPartnerPreferences(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to get partner preferences: %v", err), http.StatusInternalServerError)
				return
			}

			// Use protojson to marshal with all fields (including zero values) in camelCase
			marshaler := protojson.MarshalOptions{
				EmitUnpopulated: true,
			}

			prefsJSON, err := marshaler.Marshal(resp.Preferences)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to marshal preferences: %v", err), http.StatusInternalServerError)
				return
			}

			// Wrap in response object
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, `{"preferences":%s}`, prefsJSON)
			return
		}

		// Handle PUT request (UpdatePartnerPreferences)
		if r.Method == http.MethodPut {
			// Read request body
			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusBadRequest)
				return
			}

			// Parse JSON to extract update_fields first
			var rawReq map[string]json.RawMessage
			if err := json.Unmarshal(body, &rawReq); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			// Extract update_fields if present
			var updateFields []string
			if uf, ok := rawReq["update_fields"]; ok {
				if err := json.Unmarshal(uf, &updateFields); err != nil {
					http.Error(w, fmt.Sprintf("Invalid update_fields: %v", err), http.StatusBadRequest)
					return
				}
			}

			// Parse preferences using protojson
			preferences := &userpb.PartnerPreferences{}
			if prefsJSON, ok := rawReq["preferences"]; ok {
				unmarshaler := protojson.UnmarshalOptions{
					DiscardUnknown: true,
				}
				if err := unmarshaler.Unmarshal(prefsJSON, preferences); err != nil {
					http.Error(w, fmt.Sprintf("Invalid preferences: %v", err), http.StatusBadRequest)
					return
				}
			}

			// If no update fields specified, update all fields
			if len(updateFields) == 0 {
				updateFields = []string{
					"looking_for_gender",
					"age_range",
					"distance_preference",
					"height_range",
					"relationship_goals",
					"education_levels",
					"occupations",
					"religions",
					"children_preferences",
					"drinking_preferences",
					"smoking_preferences",
					"dietary_preferences",
					"pet_preferences",
					"verified_only",
					"dealbreakers",
				}
			}

			// Convert to gRPC request
			grpcReq := &userpb.UpdatePartnerPreferencesRequest{
				Preferences:  preferences,
				UpdateFields: updateFields,
			}

			// Call gRPC service
			resp, err := userService.UpdatePartnerPreferences(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to update partner preferences: %v", err), http.StatusBadRequest)
				return
			}

			// Use protojson to marshal with all fields (including zero values) in camelCase
			marshaler := protojson.MarshalOptions{
				EmitUnpopulated: true,
			}

			prefsJSON, err := marshaler.Marshal(resp.Preferences)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to marshal preferences: %v", err), http.StatusInternalServerError)
				return
			}

			// Wrap in response object with message
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, `{"preferences":%s,"message":"%s"}`, prefsJSON, resp.Message)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// createAvailabilityHandler creates HTTP handler for availability (GET, POST, DELETE)
func createAvailabilityHandler(availabilityService *service.AvailabilityService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract access token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix
		accessToken := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			accessToken = authHeader[7:]
		}

		// Parse access token to get user ID
		var userID int
		var timestamp int64
		_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
		if err != nil {
			http.Error(w, "Invalid access token format", http.StatusUnauthorized)
			return
		}

		// Add userID to context
		ctx := context.WithValue(r.Context(), "userID", userID)

		// Handle GET request (GetAvailability)
		if r.Method == http.MethodGet {
			// Parse query parameters
			fromTime := int64(0)
			toTime := int64(0)
			if ft := r.URL.Query().Get("from_time"); ft != "" {
				fromTime, _ = parseInt64(ft)
			}
			if tt := r.URL.Query().Get("to_time"); tt != "" {
				toTime, _ = parseInt64(tt)
			}

			grpcReq := &availabilitypb.GetAvailabilityRequest{
				FromTime: fromTime,
				ToTime:   toTime,
			}

			resp, err := availabilityService.GetAvailability(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to get availability: %v", err), http.StatusInternalServerError)
				return
			}

			// Convert to camelCase JSON
			slots := make([]map[string]interface{}, len(resp.Slots))
			for i, slot := range resp.Slots {
				slots[i] = convertSlotToJSON(slot)
			}

			jsonResp := map[string]interface{}{
				"slots":      slots,
				"totalCount": len(slots),
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		// Handle POST request (SubmitAvailability)
		if r.Method == http.MethodPost {
			var reqBody struct {
				Slots []struct {
					StartTime       int64  `json:"startTime"`
					EndTime         int64  `json:"endTime"`
					DateType        string `json:"dateType"`
					Notes           string `json:"notes"`
					OfflineLocation *struct {
						PlaceName     string  `json:"placeName"`
						Address       string  `json:"address"`
						City          string  `json:"city"`
						State         string  `json:"state"`
						Country       string  `json:"country"`
						Zipcode       string  `json:"zipcode"`
						Latitude      float64 `json:"latitude"`
						Longitude     float64 `json:"longitude"`
						GooglePlaceId string  `json:"googlePlaceId"`
						GoogleMapsUrl string  `json:"googleMapsUrl"`
					} `json:"offlineLocation"`
				} `json:"slots"`
			}

			if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			// Convert to gRPC request
			pbSlots := make([]*availabilitypb.AvailabilitySlotInput, len(reqBody.Slots))
			for i, slot := range reqBody.Slots {
				pbSlot := &availabilitypb.AvailabilitySlotInput{
					StartTime: slot.StartTime,
					EndTime:   slot.EndTime,
					DateType:  stringToDateTypeEnum(slot.DateType),
					Notes:     slot.Notes,
				}

				if slot.OfflineLocation != nil {
					pbSlot.OfflineLocation = &availabilitypb.OfflineLocation{
						PlaceName:     slot.OfflineLocation.PlaceName,
						Address:       slot.OfflineLocation.Address,
						City:          slot.OfflineLocation.City,
						State:         slot.OfflineLocation.State,
						Country:       slot.OfflineLocation.Country,
						Zipcode:       slot.OfflineLocation.Zipcode,
						Latitude:      slot.OfflineLocation.Latitude,
						Longitude:     slot.OfflineLocation.Longitude,
						GooglePlaceId: slot.OfflineLocation.GooglePlaceId,
						GoogleMapsUrl: slot.OfflineLocation.GoogleMapsUrl,
					}
				}

				pbSlots[i] = pbSlot
			}

			grpcReq := &availabilitypb.SubmitAvailabilityRequest{
				Slots: pbSlots,
			}

			resp, err := availabilityService.SubmitAvailability(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to submit availability: %v", err), http.StatusBadRequest)
				return
			}

			// Convert to camelCase JSON
			createdSlots := make([]map[string]interface{}, len(resp.CreatedSlots))
			for i, slot := range resp.CreatedSlots {
				createdSlots[i] = convertSlotToJSON(slot)
			}

			// Convert validation errors map
			validationErrors := make(map[string]string)
			for k, v := range resp.ValidationErrors {
				validationErrors[fmt.Sprintf("%d", k)] = v
			}

			jsonResp := map[string]interface{}{
				"createdSlots":     createdSlots,
				"createdCount":     resp.CreatedCount,
				"validationErrors": validationErrors,
				"message":          resp.Message,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		// Handle DELETE request (DeleteAvailability)
		if r.Method == http.MethodDelete {
			slotID := r.URL.Query().Get("slot_id")
			if slotID == "" {
				http.Error(w, "slot_id query parameter required", http.StatusBadRequest)
				return
			}

			grpcReq := &availabilitypb.DeleteAvailabilityRequest{
				SlotId: slotID,
			}

			resp, err := availabilityService.DeleteAvailability(ctx, grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to delete availability: %v", err), http.StatusBadRequest)
				return
			}

			jsonResp := map[string]interface{}{
				"success": resp.Success,
				"message": resp.Message,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// Helper functions for availability
func parseInt64(s string) (int64, error) {
	var n int64
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}

func stringToDateTypeEnum(s string) availabilitypb.DateType {
	switch s {
	case "online", "DATE_TYPE_ONLINE":
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	case "offline", "DATE_TYPE_OFFLINE":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE
	case "offline_event", "DATE_TYPE_OFFLINE_EVENT":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE_EVENT
	default:
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	}
}

func convertSlotToJSON(slot *availabilitypb.AvailabilitySlot) map[string]interface{} {
	result := map[string]interface{}{
		"slotId":    slot.SlotId,
		"userId":    slot.UserId,
		"startTime": slot.StartTime,
		"endTime":   slot.EndTime,
		"dateType":  slot.DateType.String(),
		"notes":     slot.Notes,
	}

	if slot.CreatedAt != nil {
		result["createdAt"] = map[string]int64{
			"seconds": slot.CreatedAt.Seconds,
		}
	}

	if slot.UpdatedAt != nil {
		result["updatedAt"] = map[string]int64{
			"seconds": slot.UpdatedAt.Seconds,
		}
	}

	if slot.OfflineLocation != nil {
		result["offlineLocation"] = map[string]interface{}{
			"placeName":     slot.OfflineLocation.PlaceName,
			"address":       slot.OfflineLocation.Address,
			"city":          slot.OfflineLocation.City,
			"state":         slot.OfflineLocation.State,
			"country":       slot.OfflineLocation.Country,
			"zipcode":       slot.OfflineLocation.Zipcode,
			"latitude":      slot.OfflineLocation.Latitude,
			"longitude":     slot.OfflineLocation.Longitude,
			"googlePlaceId": slot.OfflineLocation.GooglePlaceId,
			"googleMapsUrl": slot.OfflineLocation.GoogleMapsUrl,
		}
	}

	return result
}

// =============================================================================
// Admin HTTP Handlers
// =============================================================================

// createAdminLoginHandler handles admin login
func createAdminLoginHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var reqBody struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		grpcReq := &adminpb.AdminLoginRequest{
			Email:    reqBody.Email,
			Password: reqBody.Password,
		}

		resp, err := adminService.AdminLogin(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
			return
		}

		jsonResp := map[string]interface{}{
			"admin": map[string]interface{}{
				"adminId": resp.Admin.AdminId,
				"userId":  resp.Admin.UserId,
				"email":   resp.Admin.Email,
				"name":    resp.Admin.Name,
				"role":    resp.Admin.Role.String(),
				"isGenie": resp.Admin.IsGenie,
			},
			"tokens": map[string]interface{}{
				"accessToken":  resp.Tokens.AccessToken,
				"refreshToken": resp.Tokens.RefreshToken,
				"expiresIn":    resp.Tokens.ExpiresIn,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetAllUsersHandler handles fetching all users with pagination
func createAdminGetAllUsersHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse query params
		page := 1
		pageSize := 20
		if p := r.URL.Query().Get("page"); p != "" {
			fmt.Sscanf(p, "%d", &page)
		}
		if ps := r.URL.Query().Get("page_size"); ps != "" {
			fmt.Sscanf(ps, "%d", &pageSize)
		}

		sortBy := adminpb.UserSortField_USER_SORT_FIELD_CREATED_AT
		if sb := r.URL.Query().Get("sort_by"); sb != "" {
			switch sb {
			case "name":
				sortBy = adminpb.UserSortField_USER_SORT_FIELD_NAME
			case "email":
				sortBy = adminpb.UserSortField_USER_SORT_FIELD_EMAIL
			case "last_login":
				sortBy = adminpb.UserSortField_USER_SORT_FIELD_LAST_LOGIN
			case "age":
				sortBy = adminpb.UserSortField_USER_SORT_FIELD_AGE
			}
		}

		sortOrder := adminpb.SortOrder_SORT_ORDER_DESC
		if so := r.URL.Query().Get("sort_order"); so == "asc" {
			sortOrder = adminpb.SortOrder_SORT_ORDER_ASC
		}

		grpcReq := &adminpb.GetAllUsersRequest{
			Page:                int32(page),
			PageSize:            int32(pageSize),
			SortBy:              sortBy,
			SortOrder:           sortOrder,
			AccountStatusFilter: r.URL.Query().Get("account_status"),
			GenderFilter:        r.URL.Query().Get("gender"),
		}

		resp, err := adminService.GetAllUsers(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get users: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert users to JSON
		users := make([]map[string]interface{}, len(resp.Users))
		for i, user := range resp.Users {
			users[i] = convertUserFullDetailsToJSON(user)
		}

		jsonResp := map[string]interface{}{
			"users":      users,
			"totalCount": resp.TotalCount,
			"page":       resp.Page,
			"pageSize":   resp.PageSize,
			"totalPages": resp.TotalPages,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminSearchUsersHandler handles searching users
func createAdminSearchUsersHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		query := r.URL.Query().Get("q")
		if query == "" {
			http.Error(w, "Search query required", http.StatusBadRequest)
			return
		}

		page := 1
		pageSize := 20
		if p := r.URL.Query().Get("page"); p != "" {
			fmt.Sscanf(p, "%d", &page)
		}
		if ps := r.URL.Query().Get("page_size"); ps != "" {
			fmt.Sscanf(ps, "%d", &pageSize)
		}

		grpcReq := &adminpb.SearchUsersRequest{
			Query:    query,
			Page:     int32(page),
			PageSize: int32(pageSize),
		}

		resp, err := adminService.SearchUsers(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Search failed: %v", err), http.StatusInternalServerError)
			return
		}

		users := make([]map[string]interface{}, len(resp.Users))
		for i, user := range resp.Users {
			users[i] = convertUserFullDetailsToJSON(user)
		}

		jsonResp := map[string]interface{}{
			"users":      users,
			"totalCount": resp.TotalCount,
			"page":       resp.Page,
			"pageSize":   resp.PageSize,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetUserDetailsHandler handles getting user details
func createAdminGetUserDetailsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract user ID from path: /api/v1/admin/users/{id}
		userID := r.URL.Path[len("/api/v1/admin/users/"):]
		if userID == "" {
			http.Error(w, "User ID required", http.StatusBadRequest)
			return
		}

		grpcReq := &adminpb.GetUserDetailsRequest{
			UserId: userID,
		}

		resp, err := adminService.GetUserDetails(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get user details: %v", err), http.StatusInternalServerError)
			return
		}

		jsonResp := map[string]interface{}{
			"user": convertUserFullDetailsToJSON(resp.User),
		}

		// Add availability, past dates, upcoming dates if present
		if len(resp.Availability) > 0 {
			slots := make([]map[string]interface{}, len(resp.Availability))
			for i, slot := range resp.Availability {
				slots[i] = map[string]interface{}{
					"startTime": slot.StartTime.Seconds,
					"endTime":   slot.EndTime.Seconds,
					"dateType":  slot.DateType,
				}
			}
			jsonResp["availability"] = slots
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetSuggestionsHandler handles getting date suggestions for a user
func createAdminGetSuggestionsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract user ID from path: /api/v1/admin/suggestions/{id}
		userID := r.URL.Path[len("/api/v1/admin/suggestions/"):]
		if userID == "" {
			http.Error(w, "User ID required", http.StatusBadRequest)
			return
		}

		limit := 10
		if l := r.URL.Query().Get("limit"); l != "" {
			fmt.Sscanf(l, "%d", &limit)
		}

		grpcReq := &adminpb.GetDateSuggestionsRequest{
			UserId: userID,
			Limit:  int32(limit),
		}

		resp, err := adminService.GetDateSuggestions(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get suggestions: %v", err), http.StatusInternalServerError)
			return
		}

		suggestions := make([]map[string]interface{}, len(resp.Suggestions))
		for i, suggestion := range resp.Suggestions {
			suggestions[i] = map[string]interface{}{
				"user": map[string]interface{}{
					"userId":     suggestion.User.UserId,
					"name":       suggestion.User.Name,
					"email":      suggestion.User.Email,
					"phone":      suggestion.User.Phone,
					"photoUrl":   suggestion.User.PhotoUrl,
					"age":        suggestion.User.Age,
					"gender":     suggestion.User.Gender,
					"city":       suggestion.User.City,
					"occupation": suggestion.User.Occupation,
				},
				"compatibilityScore": suggestion.CompatibilityScore,
				"commonInterests":    suggestion.CommonInterests,
				"suggestedDateType":  suggestion.SuggestedDateType,
			}

			if len(suggestion.MatchingSlots) > 0 {
				slots := make([]map[string]interface{}, len(suggestion.MatchingSlots))
				for j, slot := range suggestion.MatchingSlots {
					slots[j] = map[string]interface{}{
						"startTime": slot.StartTime.Seconds,
						"endTime":   slot.EndTime.Seconds,
						"dateType":  slot.DateType,
					}
				}
				suggestions[i]["matchingSlots"] = slots
			}
		}

		jsonResp := map[string]interface{}{
			"suggestions": suggestions,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminDatesHandler handles scheduling dates and getting genie dates
func createAdminDatesHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// POST - Schedule a date
		if r.Method == http.MethodPost {
			var reqBody struct {
				User1ID         string `json:"user1Id"`
				User2ID         string `json:"user2Id"`
				ScheduledTime   int64  `json:"scheduledTime"`
				DurationMinutes int64  `json:"durationMinutes"`
				DateType        string `json:"dateType"`
				Notes           string `json:"notes"`
				Location        *struct {
					PlaceName string  `json:"placeName"`
					Address   string  `json:"address"`
					City      string  `json:"city"`
					State     string  `json:"state"`
					Country   string  `json:"country"`
					Zipcode   string  `json:"zipcode"`
					Latitude  float64 `json:"latitude"`
					Longitude float64 `json:"longitude"`
				} `json:"location"`
			}

			if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			grpcReq := &adminpb.ScheduleDateRequest{
				User1Id:         reqBody.User1ID,
				User2Id:         reqBody.User2ID,
				ScheduledTime:   &commonpb.Timestamp{Seconds: reqBody.ScheduledTime},
				DurationMinutes: reqBody.DurationMinutes,
				DateType:        reqBody.DateType,
				Notes:           reqBody.Notes,
			}

			if reqBody.Location != nil {
				grpcReq.Location = &adminpb.OfflineLocation{
					PlaceName: reqBody.Location.PlaceName,
					Address:   reqBody.Location.Address,
					City:      reqBody.Location.City,
					State:     reqBody.Location.State,
					Country:   reqBody.Location.Country,
					Zipcode:   reqBody.Location.Zipcode,
					Latitude:  reqBody.Location.Latitude,
					Longitude: reqBody.Location.Longitude,
				}
			}

			resp, err := adminService.ScheduleDate(r.Context(), grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to schedule date: %v", err), http.StatusBadRequest)
				return
			}

			jsonResp := map[string]interface{}{
				"date": convertScheduledDateToJSON(resp.Date),
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		// GET - Get genie dates
		if r.Method == http.MethodGet {
			genieID := r.URL.Query().Get("genie_id")

			page := 1
			pageSize := 20
			if p := r.URL.Query().Get("page"); p != "" {
				fmt.Sscanf(p, "%d", &page)
			}
			if ps := r.URL.Query().Get("page_size"); ps != "" {
				fmt.Sscanf(ps, "%d", &pageSize)
			}

			var statusFilter adminpb.DateStatus
			if sf := r.URL.Query().Get("status"); sf != "" {
				switch sf {
				case "scheduled":
					statusFilter = adminpb.DateStatus_DATE_STATUS_SCHEDULED
				case "confirmed":
					statusFilter = adminpb.DateStatus_DATE_STATUS_CONFIRMED
				case "in_progress":
					statusFilter = adminpb.DateStatus_DATE_STATUS_IN_PROGRESS
				case "completed":
					statusFilter = adminpb.DateStatus_DATE_STATUS_COMPLETED
				case "cancelled":
					statusFilter = adminpb.DateStatus_DATE_STATUS_CANCELLED
				}
			}

			grpcReq := &adminpb.GetGenieDatesRequest{
				GenieId:      genieID,
				StatusFilter: statusFilter,
				Page:         int32(page),
				PageSize:     int32(pageSize),
			}

			resp, err := adminService.GetGenieDates(r.Context(), grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to get dates: %v", err), http.StatusInternalServerError)
				return
			}

			dates := make([]map[string]interface{}, len(resp.Dates))
			for i, date := range resp.Dates {
				dates[i] = convertScheduledDateToJSON(date)
			}

			jsonResp := map[string]interface{}{
				"dates":      dates,
				"totalCount": resp.TotalCount,
				"page":       resp.Page,
				"pageSize":   resp.PageSize,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// createAdminDateStatusHandler handles updating date status
func createAdminDateStatusHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract date ID from path: /api/v1/admin/dates/{id}
		dateID := r.URL.Path[len("/api/v1/admin/dates/"):]
		if dateID == "" {
			http.Error(w, "Date ID required", http.StatusBadRequest)
			return
		}

		var reqBody struct {
			Status string `json:"status"`
			Notes  string `json:"notes"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		var status adminpb.DateStatus
		switch reqBody.Status {
		case "scheduled":
			status = adminpb.DateStatus_DATE_STATUS_SCHEDULED
		case "confirmed":
			status = adminpb.DateStatus_DATE_STATUS_CONFIRMED
		case "in_progress":
			status = adminpb.DateStatus_DATE_STATUS_IN_PROGRESS
		case "completed":
			status = adminpb.DateStatus_DATE_STATUS_COMPLETED
		case "cancelled":
			status = adminpb.DateStatus_DATE_STATUS_CANCELLED
		case "no_show":
			status = adminpb.DateStatus_DATE_STATUS_NO_SHOW
		default:
			http.Error(w, "Invalid status", http.StatusBadRequest)
			return
		}

		grpcReq := &adminpb.UpdateDateStatusRequest{
			DateId: dateID,
			Status: status,
			Notes:  reqBody.Notes,
		}

		resp, err := adminService.UpdateDateStatus(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update status: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"date": convertScheduledDateToJSON(resp.Date),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// Helper functions for admin handlers
func convertUserFullDetailsToJSON(user *adminpb.UserFullDetails) map[string]interface{} {
	if user == nil {
		return nil
	}

	result := map[string]interface{}{
		"userId":            user.UserId,
		"email":             user.Email,
		"name":              user.Name,
		"phone":             user.Phone,
		"photoUrl":          user.PhotoUrl,
		"age":               user.Age,
		"gender":            user.Gender,
		"accountStatus":     user.AccountStatus,
		"emailVerified":     user.EmailVerified,
		"phoneVerified":     user.PhoneVerified,
		"photoCount":        user.PhotoCount,
		"availabilityCount": user.AvailabilityCount,
	}

	if user.DateOfBirth != nil {
		result["dateOfBirth"] = user.DateOfBirth.Seconds
	}
	if user.CreatedAt != nil {
		result["createdAt"] = user.CreatedAt.Seconds
	}
	if user.LastLoginAt != nil {
		result["lastLoginAt"] = user.LastLoginAt.Seconds
	}

	return result
}

func convertScheduledDateToJSON(date *adminpb.ScheduledDate) map[string]interface{} {
	if date == nil {
		return nil
	}

	result := map[string]interface{}{
		"dateId":          date.DateId,
		"user1Id":         date.User1Id,
		"user2Id":         date.User2Id,
		"genieId":         date.GenieId,
		"durationMinutes": date.DurationMinutes,
		"status":          date.Status.String(),
		"dateType":        date.DateType,
		"notes":           date.Notes,
	}

	if date.User1 != nil {
		result["user1"] = map[string]interface{}{
			"userId":     date.User1.UserId,
			"name":       date.User1.Name,
			"email":      date.User1.Email,
			"phone":      date.User1.Phone,
			"photoUrl":   date.User1.PhotoUrl,
			"age":        date.User1.Age,
			"gender":     date.User1.Gender,
			"city":       date.User1.City,
			"occupation": date.User1.Occupation,
		}
	}

	if date.User2 != nil {
		result["user2"] = map[string]interface{}{
			"userId":     date.User2.UserId,
			"name":       date.User2.Name,
			"email":      date.User2.Email,
			"phone":      date.User2.Phone,
			"photoUrl":   date.User2.PhotoUrl,
			"age":        date.User2.Age,
			"gender":     date.User2.Gender,
			"city":       date.User2.City,
			"occupation": date.User2.Occupation,
		}
	}

	if date.ScheduledTime != nil {
		result["scheduledTime"] = date.ScheduledTime.Seconds
	}
	if date.CreatedAt != nil {
		result["createdAt"] = date.CreatedAt.Seconds
	}
	if date.UpdatedAt != nil {
		result["updatedAt"] = date.UpdatedAt.Seconds
	}

	if date.Location != nil {
		result["location"] = map[string]interface{}{
			"placeName": date.Location.PlaceName,
			"address":   date.Location.Address,
			"city":      date.Location.City,
			"state":     date.Location.State,
			"country":   date.Location.Country,
			"zipcode":   date.Location.Zipcode,
			"latitude":  date.Location.Latitude,
			"longitude": date.Location.Longitude,
		}
	}

	return result
}

// =============================================================================
// Admin Curation HTTP Handlers (AI-Powered Matching)
// =============================================================================

// createAdminGetCurationCandidatesHandler handles getting users available for curation
func createAdminGetCurationCandidatesHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		grpcReq := &adminpb.GetCurationCandidatesRequest{}

		resp, err := adminService.GetCurationCandidates(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get curation candidates: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert candidates to JSON (camelCase)
		var candidates []map[string]interface{}
		for _, candidate := range resp.Candidates {
			candidates = append(candidates, map[string]interface{}{
				"userId":              candidate.UserId,
				"email":               candidate.Email,
				"name":                candidate.Name,
				"age":                 candidate.Age,
				"gender":              candidate.Gender,
				"profileCompletion":   candidate.ProfileCompletion,
				"emailVerified":       candidate.EmailVerified,
				"aadharVerified":      candidate.AadharVerified,
				"workEmailVerified":   candidate.WorkEmailVerified,
				"availableSlotsCount": candidate.AvailableSlotsCount,
				"nextAvailableDate":   candidate.NextAvailableDate,
			})
		}

		jsonResp := map[string]interface{}{
			"candidates": candidates,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminCurateDatesHandler handles AI-powered compatibility analysis
func createAdminCurateDatesHandler(adminService *service.AdminService, db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var reqBody struct {
			UserID string `json:"userId"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Get user's partner preferences (preferred genders)
		userID, err := strconv.Atoi(reqBody.UserID)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		var preferredGendersJSON []byte
		err = db.QueryRowContext(r.Context(),
			`SELECT looking_for_gender FROM partner_preferences WHERE user_id = $1`,
			userID,
		).Scan(&preferredGendersJSON)

		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get partner preferences: %v", err), http.StatusInternalServerError)
			return
		}

		// Parse preferred genders from JSONB (stored as strings like "MALE", "FEMALE", "NON_BINARY")
		var preferredGenders []string
		if err := json.Unmarshal(preferredGendersJSON, &preferredGenders); err != nil {
			http.Error(w, fmt.Sprintf("Failed to parse preferred genders: %v", err), http.StatusBadRequest)
			return
		}

		if len(preferredGenders) == 0 {
			http.Error(w, "User has no gender preferences set", http.StatusBadRequest)
			return
		}

		// Find users matching the preferred genders who have availability starting tomorrow
		tomorrow := time.Now().AddDate(0, 0, 1)
		startOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, tomorrow.Location())

		// Build query to find matching users with availability
		query := `
			SELECT DISTINCT u.id
			FROM users u
			INNER JOIN availability_slots a ON u.id = a.user_id
			WHERE u.id != $1
			  AND u.account_status = 'ACTIVE'
			  AND u.date_of_birth IS NOT NULL
			  AND u.gender = ANY($2)
			  AND a.start_time >= $3
			ORDER BY u.id
		`

		rows, err := db.QueryContext(r.Context(), query, userID, pq.Array(preferredGenders), startOfDay.Unix())
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to fetch candidate users: %v", err), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var candidateIDs []string
		for rows.Next() {
			var id int
			if err := rows.Scan(&id); err != nil {
				http.Error(w, fmt.Sprintf("Failed to scan candidate ID: %v", err), http.StatusInternalServerError)
				return
			}
			candidateIDs = append(candidateIDs, strconv.Itoa(id))
		}

		if len(candidateIDs) == 0 {
			jsonResp := map[string]interface{}{
				"matches": []map[string]interface{}{},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		// Call AI curation service with matched candidates
		grpcReq := &adminpb.CurateDatesRequest{
			UserId:       reqBody.UserID,
			CandidateIds: candidateIDs,
		}

		resp, err := adminService.CurateDates(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to curate dates: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert matches to JSON (camelCase)
		var matches []map[string]interface{}
		for _, match := range resp.Matches {
			matches = append(matches, map[string]interface{}{
				"userId":             match.UserId,
				"name":               match.Name,
				"age":                match.Age,
				"gender":             match.Gender,
				"compatibilityScore": match.CompatibilityScore,
				"isMatch":            match.IsMatch,
				"reasoning":          match.Reasoning,
				"matchedAspects":     match.MatchedAspects,
				"mismatchedAspects":  match.MismatchedAspects,
			})
		}

		jsonResp := map[string]interface{}{
			"matches": matches,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminUpdateCuratedMatchActionHandler handles admin actions on curated matches
func createAdminUpdateCuratedMatchActionHandler(datesService *service.DatesService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var reqBody struct {
			CuratedMatchID int    `json:"curatedMatchId"`
			Action         string `json:"action"`
			Notes          string `json:"notes,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		if reqBody.CuratedMatchID <= 0 {
			http.Error(w, "Invalid curated match ID", http.StatusBadRequest)
			return
		}

		if reqBody.Action == "" {
			http.Error(w, "Action is required", http.StatusBadRequest)
			return
		}

		// Update the curated match status
		newStatus, err := datesService.UpdateCuratedMatchAction(r.Context(), reqBody.CuratedMatchID, reqBody.Action)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update curated match: %v", err), http.StatusInternalServerError)
			return
		}

		jsonResp := map[string]interface{}{
			"success":   true,
			"message":   fmt.Sprintf("Curated match %s successfully", newStatus),
			"newStatus": newStatus,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetCuratedMatchesByStatusHandler handles fetching curated matches by status
func createAdminGetCuratedMatchesByStatusHandler(datesService *service.DatesService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse query parameters
		status := r.URL.Query().Get("status")
		if status == "" {
			status = "accepted" // Default to accepted matches
		}

		page := 1
		pageSize := 20
		if pageStr := r.URL.Query().Get("page"); pageStr != "" {
			if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
				page = p
			}
		}
		if sizeStr := r.URL.Query().Get("pageSize"); sizeStr != "" {
			if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 && s <= 100 {
				pageSize = s
			}
		}

		offset := (page - 1) * pageSize

		// Fetch matches with user details
		matches, totalCount, err := datesService.GetCuratedMatchesByStatus(r.Context(), status, pageSize, offset)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to fetch curated matches: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert to JSON response
		var matchesJSON []map[string]interface{}
		for _, match := range matches {
			matchesJSON = append(matchesJSON, map[string]interface{}{
				"id": match.ID,
				"user1": map[string]interface{}{
					"userId": match.User1ID,
					"name":   match.User1Name,
					"email":  match.User1Email,
					"age":    match.User1Age,
					"gender": match.User1Gender,
				},
				"user2": map[string]interface{}{
					"userId": match.User2ID,
					"name":   match.User2Name,
					"email":  match.User2Email,
					"age":    match.User2Age,
					"gender": match.User2Gender,
				},
				"compatibilityScore": match.CompatibilityScore,
				"isMatch":            match.IsMatch,
				"reasoning":          match.Reasoning,
				"matchedAspects":     match.MatchedAspects,
				"mismatchedAspects":  match.MismatchedAspects,
				"status":             match.Status,
				"createdByAdmin":     match.CreatedByAdmin,
				"scheduledDateId":    match.ScheduledDateID,
				"createdAt":          match.CreatedAt.Unix(),
				"updatedAt":          match.UpdatedAt.Unix(),
			})
		}

		totalPages := (totalCount + pageSize - 1) / pageSize

		jsonResp := map[string]interface{}{
			"matches":    matchesJSON,
			"totalCount": totalCount,
			"page":       page,
			"pageSize":   pageSize,
			"totalPages": totalPages,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminCreateSuggestionsHandler creates date suggestions from an accepted match
func createAdminCreateSuggestionsHandler(datesService *service.DatesService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract match ID from path /api/v1/admin/curation/matches/{id}/suggest
		pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(pathParts) < 6 {
			http.Error(w, "Invalid URL format", http.StatusBadRequest)
			return
		}

		matchIDStr := pathParts[5]
		matchID, err := strconv.Atoi(matchIDStr)
		if err != nil {
			http.Error(w, "Invalid match ID", http.StatusBadRequest)
			return
		}

		// Create suggestions for both users
		err = datesService.CreateSuggestionsFromMatch(r.Context(), matchID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create suggestions: %v", err), http.StatusInternalServerError)
			return
		}

		jsonResp := map[string]interface{}{
			"success": true,
			"message": fmt.Sprintf("Date suggestions created for match %d", matchID),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// =============================================================================
// User Date Suggestion HTTP Handlers
// =============================================================================

// createUserGetSuggestionsHandler gets date suggestions for a user
func createUserGetSuggestionsHandler(datesService *service.DatesService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// TODO: Get user ID from authentication token
		// For now, get from query parameter
		userIDStr := r.URL.Query().Get("userId")
		if userIDStr == "" {
			http.Error(w, "User ID is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		status := r.URL.Query().Get("status") // Optional: pending, accepted, rejected

		// Get suggestions
		suggestions, err := datesService.GetUserSuggestions(r.Context(), userID, status)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get suggestions: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert to JSON
		var suggestionsJSON []map[string]interface{}
		for _, sugg := range suggestions {
			suggestionsJSON = append(suggestionsJSON, map[string]interface{}{
				"id": sugg.ID,
				"suggestedUser": map[string]interface{}{
					"userId": sugg.SuggestedUserID,
					"name":   sugg.SuggestedUserName,
					"email":  sugg.SuggestedUserEmail,
					"age":    sugg.SuggestedUserAge,
					"gender": sugg.SuggestedUserGender,
				},
				"compatibilityScore": sugg.CompatibilityScore,
				"reasoning":          sugg.Reasoning,
				"status":             sugg.Status,
				"createdAt":          sugg.CreatedAt.Unix(),
			})
		}

		jsonResp := map[string]interface{}{
			"suggestions": suggestionsJSON,
			"count":       len(suggestionsJSON),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createUserRespondToSuggestionHandler allows users to accept/reject suggestions
func createUserRespondToSuggestionHandler(datesService *service.DatesService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract suggestion ID from path /api/v1/user/suggestions/{id}/respond
		pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(pathParts) < 5 {
			http.Error(w, "Invalid URL format", http.StatusBadRequest)
			return
		}

		suggestionIDStr := pathParts[4]
		suggestionID, err := strconv.Atoi(suggestionIDStr)
		if err != nil {
			http.Error(w, "Invalid suggestion ID", http.StatusBadRequest)
			return
		}

		var reqBody struct {
			UserID int  `json:"userId"` // TODO: Get from auth token
			Accept bool `json:"accept"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		if reqBody.UserID <= 0 {
			http.Error(w, "User ID is required", http.StatusBadRequest)
			return
		}

		// Respond to suggestion
		err = datesService.RespondToSuggestion(r.Context(), suggestionID, reqBody.UserID, reqBody.Accept)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to respond to suggestion: %v", err), http.StatusInternalServerError)
			return
		}

		action := "rejected"
		if reqBody.Accept {
			action = "accepted"
		}

		jsonResp := map[string]interface{}{
			"success": true,
			"message": fmt.Sprintf("Suggestion %s successfully", action),
			"action":  action,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// =============================================================================
// Admin Analytics HTTP Handlers
// =============================================================================

// createAdminGetPlatformStatsHandler handles getting platform statistics
func createAdminGetPlatformStatsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		grpcReq := &adminpb.PlatformStatsRequest{}
		resp, err := adminService.GetPlatformStats(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get platform stats: %v", err), http.StatusInternalServerError)
			return
		}

		jsonResp := map[string]interface{}{
			"totalUsers":          resp.TotalUsers,
			"activeUsers":         resp.ActiveUsers,
			"verifiedUsers":       resp.VerifiedUsers,
			"availableForDating":  resp.AvailableForDating,
			"totalDatesScheduled": resp.TotalDatesScheduled,
			"totalDatesCompleted": resp.TotalDatesCompleted,
			"todaySignups":        resp.TodaySignups,
			"thisWeekSignups":     resp.ThisWeekSignups,
			"thisMonthSignups":    resp.ThisMonthSignups,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetUserGrowthHandler handles getting user growth analytics
func createAdminGetUserGrowthHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse query parameters
		period := adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY
		if p := r.URL.Query().Get("period"); p != "" {
			switch p {
			case "daily":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_DAILY
			case "weekly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_WEEKLY
			case "monthly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY
			case "yearly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_YEARLY
			}
		}

		var startTime, endTime int64
		if st := r.URL.Query().Get("start_time"); st != "" {
			fmt.Sscanf(st, "%d", &startTime)
		}
		if et := r.URL.Query().Get("end_time"); et != "" {
			fmt.Sscanf(et, "%d", &endTime)
		}

		grpcReq := &adminpb.UserGrowthRequest{
			Period: period,
		}
		if startTime > 0 && endTime > 0 {
			grpcReq.TimeRange = &adminpb.TimeRange{
				StartTime: &commonpb.Timestamp{Seconds: startTime},
				EndTime:   &commonpb.Timestamp{Seconds: endTime},
			}
		}

		resp, err := adminService.GetUserGrowth(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get user growth: %v", err), http.StatusInternalServerError)
			return
		}

		dataPoints := make([]map[string]interface{}, len(resp.DataPoints))
		for i, dp := range resp.DataPoints {
			dataPoints[i] = map[string]interface{}{
				"label":     dp.Label,
				"value":     dp.Value,
				"timestamp": dp.Timestamp.Seconds,
			}
		}

		jsonResp := map[string]interface{}{
			"dataPoints": dataPoints,
			"totalUsers": resp.TotalUsers,
			"growthRate": resp.GrowthRate,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetActiveUsersHandler handles getting active users analytics
func createAdminGetActiveUsersHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse query parameters
		period := adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY
		if p := r.URL.Query().Get("period"); p != "" {
			switch p {
			case "daily":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_DAILY
			case "weekly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_WEEKLY
			case "monthly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY
			case "yearly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_YEARLY
			}
		}

		var startTime, endTime int64
		if st := r.URL.Query().Get("start_time"); st != "" {
			fmt.Sscanf(st, "%d", &startTime)
		}
		if et := r.URL.Query().Get("end_time"); et != "" {
			fmt.Sscanf(et, "%d", &endTime)
		}

		grpcReq := &adminpb.ActiveUsersRequest{
			Period: period,
		}
		if startTime > 0 && endTime > 0 {
			grpcReq.TimeRange = &adminpb.TimeRange{
				StartTime: &commonpb.Timestamp{Seconds: startTime},
				EndTime:   &commonpb.Timestamp{Seconds: endTime},
			}
		}

		resp, err := adminService.GetActiveUsers(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get active users: %v", err), http.StatusInternalServerError)
			return
		}

		dataPoints := make([]map[string]interface{}, len(resp.DataPoints))
		for i, dp := range resp.DataPoints {
			dataPoints[i] = map[string]interface{}{
				"label":     dp.Label,
				"value":     dp.Value,
				"timestamp": dp.Timestamp.Seconds,
			}
		}

		jsonResp := map[string]interface{}{
			"dataPoints":    dataPoints,
			"currentActive": resp.CurrentActive,
			"activityRate":  resp.ActivityRate,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetSignupsHandler handles getting signups analytics
func createAdminGetSignupsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse query parameters
		period := adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY
		if p := r.URL.Query().Get("period"); p != "" {
			switch p {
			case "daily":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_DAILY
			case "weekly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_WEEKLY
			case "monthly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY
			case "yearly":
				period = adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_YEARLY
			}
		}

		var startTime, endTime int64
		if st := r.URL.Query().Get("start_time"); st != "" {
			fmt.Sscanf(st, "%d", &startTime)
		}
		if et := r.URL.Query().Get("end_time"); et != "" {
			fmt.Sscanf(et, "%d", &endTime)
		}

		grpcReq := &adminpb.SignupsRequest{
			Period: period,
		}
		if startTime > 0 && endTime > 0 {
			grpcReq.TimeRange = &adminpb.TimeRange{
				StartTime: &commonpb.Timestamp{Seconds: startTime},
				EndTime:   &commonpb.Timestamp{Seconds: endTime},
			}
		}

		resp, err := adminService.GetSignups(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get signups: %v", err), http.StatusInternalServerError)
			return
		}

		dataPoints := make([]map[string]interface{}, len(resp.DataPoints))
		for i, dp := range resp.DataPoints {
			dataPoints[i] = map[string]interface{}{
				"label":     dp.Label,
				"value":     dp.Value,
				"timestamp": dp.Timestamp.Seconds,
			}
		}

		jsonResp := map[string]interface{}{
			"dataPoints":   dataPoints,
			"totalSignups": resp.TotalSignups,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetDemographicsHandler handles getting demographics analytics
func createAdminGetDemographicsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		metricType := r.URL.Query().Get("metric_type")
		if metricType == "" {
			metricType = "gender"
		}

		grpcReq := &adminpb.DemographicsRequest{
			MetricType: metricType,
		}

		resp, err := adminService.GetDemographics(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get demographics: %v", err), http.StatusInternalServerError)
			return
		}

		data := make([]map[string]interface{}, len(resp.Data))
		for i, item := range resp.Data {
			data[i] = map[string]interface{}{
				"category":   item.Category,
				"count":      item.Count,
				"percentage": item.Percentage,
			}
		}

		jsonResp := map[string]interface{}{
			"data": data,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetLocationStatsHandler handles getting location statistics
func createAdminGetLocationStatsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		level := r.URL.Query().Get("level")
		if level == "" {
			level = "country"
		}

		grpcReq := &adminpb.LocationStatsRequest{
			Level:          level,
			ParentLocation: r.URL.Query().Get("parent_location"),
		}

		resp, err := adminService.GetLocationStats(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get location stats: %v", err), http.StatusInternalServerError)
			return
		}

		locations := make([]map[string]interface{}, len(resp.Locations))
		for i, loc := range resp.Locations {
			locations[i] = map[string]interface{}{
				"locationName": loc.LocationName,
				"locationCode": loc.LocationCode,
				"userCount":    loc.UserCount,
				"percentage":   loc.Percentage,
			}
		}

		jsonResp := map[string]interface{}{
			"locations": locations,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminGetAvailabilityStatsHandler handles getting availability statistics
func createAdminGetAvailabilityStatsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		grpcReq := &adminpb.AvailabilityStatsRequest{}
		resp, err := adminService.GetAvailabilityStats(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get availability stats: %v", err), http.StatusInternalServerError)
			return
		}

		jsonResp := map[string]interface{}{
			"availableUsers":   resp.AvailableUsers,
			"unavailableUsers": resp.UnavailableUsers,
			"availabilityRate": resp.AvailabilityRate,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// =============================================================================
// Admin Bulk Actions HTTP Handlers
// =============================================================================

// createAdminBulkUserActionHandler handles bulk user actions
func createAdminBulkUserActionHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var reqBody struct {
			UserIds []string `json:"userIds"`
			Action  string   `json:"action"`
			Reason  string   `json:"reason"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		var action adminpb.BulkUserAction
		switch reqBody.Action {
		case "activate":
			action = adminpb.BulkUserAction_BULK_USER_ACTION_ACTIVATE
		case "suspend":
			action = adminpb.BulkUserAction_BULK_USER_ACTION_SUSPEND
		case "delete":
			action = adminpb.BulkUserAction_BULK_USER_ACTION_DELETE
		case "verify":
			action = adminpb.BulkUserAction_BULK_USER_ACTION_VERIFY
		case "unverify":
			action = adminpb.BulkUserAction_BULK_USER_ACTION_UNVERIFY
		default:
			http.Error(w, "Invalid action", http.StatusBadRequest)
			return
		}

		grpcReq := &adminpb.BulkUserActionRequest{
			UserIds: reqBody.UserIds,
			Action:  action,
			Reason:  reqBody.Reason,
		}

		resp, err := adminService.BulkUserAction(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Bulk action failed: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"successCount":  resp.SuccessCount,
			"failedCount":   resp.FailedCount,
			"failedUserIds": resp.FailedUserIds,
			"errorMessages": resp.ErrorMessages,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// =============================================================================
// Admin Management HTTP Handlers
// =============================================================================

// createAdminManageAdminsHandler handles GET (list all admins) and POST (create admin)
func createAdminManageAdminsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			// Get all admins
			page := 1
			pageSize := 20
			if p := r.URL.Query().Get("page"); p != "" {
				fmt.Sscanf(p, "%d", &page)
			}
			if ps := r.URL.Query().Get("page_size"); ps != "" {
				fmt.Sscanf(ps, "%d", &pageSize)
			}

			grpcReq := &adminpb.GetAllAdminsRequest{
				Page:     int32(page),
				PageSize: int32(pageSize),
			}

			resp, err := adminService.GetAllAdmins(r.Context(), grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to get admins: %v", err), http.StatusInternalServerError)
				return
			}

			admins := make([]map[string]interface{}, len(resp.Admins))
			for i, admin := range resp.Admins {
				admins[i] = map[string]interface{}{
					"adminId": admin.AdminId,
					"userId":  admin.UserId,
					"email":   admin.Email,
					"name":    admin.Name,
					"role":    admin.Role.String(),
					"isGenie": admin.IsGenie,
				}
			}

			jsonResp := map[string]interface{}{
				"admins":     admins,
				"totalCount": resp.TotalCount,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		if r.Method == http.MethodPost {
			// Create admin
			var reqBody struct {
				Email    string `json:"email"`
				Password string `json:"password"`
				Name     string `json:"name"`
				Role     string `json:"role"`
				IsGenie  bool   `json:"isGenie"`
			}

			if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			var role adminpb.AdminRole
			switch reqBody.Role {
			case "super_admin", "ADMIN_ROLE_SUPER_ADMIN":
				role = adminpb.AdminRole_ADMIN_ROLE_SUPER_ADMIN
			case "genie", "ADMIN_ROLE_GENIE":
				role = adminpb.AdminRole_ADMIN_ROLE_GENIE
			case "support", "ADMIN_ROLE_SUPPORT":
				role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
			case "moderator", "ADMIN_ROLE_MODERATOR":
				role = adminpb.AdminRole_ADMIN_ROLE_MODERATOR
			default:
				role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
			}

			grpcReq := &adminpb.CreateAdminUserRequest{
				Email:    reqBody.Email,
				Password: reqBody.Password,
				Name:     reqBody.Name,
				Role:     role,
				IsGenie:  reqBody.IsGenie,
			}

			resp, err := adminService.CreateAdminUser(r.Context(), grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to create admin: %v", err), http.StatusBadRequest)
				return
			}

			jsonResp := map[string]interface{}{
				"admin": map[string]interface{}{
					"adminId": resp.Admin.AdminId,
					"userId":  resp.Admin.UserId,
					"email":   resp.Admin.Email,
					"name":    resp.Admin.Name,
					"role":    resp.Admin.Role.String(),
					"isGenie": resp.Admin.IsGenie,
				},
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// createAdminManageAdminByIdHandler handles PUT (update) and DELETE operations on specific admin
func createAdminManageAdminByIdHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract admin ID from path: /api/v1/admin/admins/{id}
		adminID := r.URL.Path[len("/api/v1/admin/admins/"):]
		if adminID == "" {
			http.Error(w, "Admin ID required", http.StatusBadRequest)
			return
		}

		if r.Method == http.MethodPut {
			// Update admin
			var reqBody struct {
				Name  string `json:"name"`
				Email string `json:"email"`
				Role  string `json:"role"`
			}

			if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			var role adminpb.AdminRole
			switch reqBody.Role {
			case "super_admin", "ADMIN_ROLE_SUPER_ADMIN":
				role = adminpb.AdminRole_ADMIN_ROLE_SUPER_ADMIN
			case "genie", "ADMIN_ROLE_GENIE":
				role = adminpb.AdminRole_ADMIN_ROLE_GENIE
			case "support", "ADMIN_ROLE_SUPPORT":
				role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
			case "moderator", "ADMIN_ROLE_MODERATOR":
				role = adminpb.AdminRole_ADMIN_ROLE_MODERATOR
			default:
				role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
			}

			grpcReq := &adminpb.UpdateAdminRequest{
				AdminId: adminID,
				Name:    reqBody.Name,
				Email:   reqBody.Email,
				Role:    role,
			}

			resp, err := adminService.UpdateAdmin(r.Context(), grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to update admin: %v", err), http.StatusBadRequest)
				return
			}

			jsonResp := map[string]interface{}{
				"admin": map[string]interface{}{
					"adminId": resp.Admin.AdminId,
					"userId":  resp.Admin.UserId,
					"email":   resp.Admin.Email,
					"name":    resp.Admin.Name,
					"role":    resp.Admin.Role.String(),
					"isGenie": resp.Admin.IsGenie,
				},
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		if r.Method == http.MethodDelete {
			// Delete admin
			grpcReq := &adminpb.DeleteAdminRequest{
				AdminId: adminID,
			}

			resp, err := adminService.DeleteAdmin(r.Context(), grpcReq)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to delete admin: %v", err), http.StatusBadRequest)
				return
			}

			jsonResp := map[string]interface{}{
				"success": resp.Success,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(jsonResp)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// createAdminGetAllAdminsHandler handles getting all admins
func createAdminGetAllAdminsHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		page := 1
		pageSize := 20
		if p := r.URL.Query().Get("page"); p != "" {
			fmt.Sscanf(p, "%d", &page)
		}
		if ps := r.URL.Query().Get("page_size"); ps != "" {
			fmt.Sscanf(ps, "%d", &pageSize)
		}

		grpcReq := &adminpb.GetAllAdminsRequest{
			Page:     int32(page),
			PageSize: int32(pageSize),
		}

		resp, err := adminService.GetAllAdmins(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get admins: %v", err), http.StatusInternalServerError)
			return
		}

		admins := make([]map[string]interface{}, len(resp.Admins))
		for i, admin := range resp.Admins {
			admins[i] = map[string]interface{}{
				"adminId": admin.AdminId,
				"userId":  admin.UserId,
				"email":   admin.Email,
				"name":    admin.Name,
				"role":    admin.Role.String(),
				"isGenie": admin.IsGenie,
			}
		}

		jsonResp := map[string]interface{}{
			"admins":     admins,
			"totalCount": resp.TotalCount,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminCreateAdminUserHandler handles creating a new admin user
func createAdminCreateAdminUserHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var reqBody struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Name     string `json:"name"`
			Role     string `json:"role"`
			IsGenie  bool   `json:"isGenie"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		var role adminpb.AdminRole
		switch reqBody.Role {
		case "super_admin", "ADMIN_ROLE_SUPER_ADMIN":
			role = adminpb.AdminRole_ADMIN_ROLE_SUPER_ADMIN
		case "genie", "ADMIN_ROLE_GENIE":
			role = adminpb.AdminRole_ADMIN_ROLE_GENIE
		case "support", "ADMIN_ROLE_SUPPORT":
			role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
		case "moderator", "ADMIN_ROLE_MODERATOR":
			role = adminpb.AdminRole_ADMIN_ROLE_MODERATOR
		default:
			role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
		}

		grpcReq := &adminpb.CreateAdminUserRequest{
			Email:    reqBody.Email,
			Password: reqBody.Password,
			Name:     reqBody.Name,
			Role:     role,
			IsGenie:  reqBody.IsGenie,
		}

		resp, err := adminService.CreateAdminUser(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create admin: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"admin": map[string]interface{}{
				"adminId": resp.Admin.AdminId,
				"userId":  resp.Admin.UserId,
				"email":   resp.Admin.Email,
				"name":    resp.Admin.Name,
				"role":    resp.Admin.Role.String(),
				"isGenie": resp.Admin.IsGenie,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminUpdateAdminHandler handles updating an admin user
func createAdminUpdateAdminHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract admin ID from path: /api/v1/admin/admins/{id}
		adminID := r.URL.Path[len("/api/v1/admin/admins/"):]
		if adminID == "" {
			http.Error(w, "Admin ID required", http.StatusBadRequest)
			return
		}

		var reqBody struct {
			Name  string `json:"name"`
			Email string `json:"email"`
			Role  string `json:"role"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		var role adminpb.AdminRole
		switch reqBody.Role {
		case "super_admin", "ADMIN_ROLE_SUPER_ADMIN":
			role = adminpb.AdminRole_ADMIN_ROLE_SUPER_ADMIN
		case "genie", "ADMIN_ROLE_GENIE":
			role = adminpb.AdminRole_ADMIN_ROLE_GENIE
		case "support", "ADMIN_ROLE_SUPPORT":
			role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
		case "moderator", "ADMIN_ROLE_MODERATOR":
			role = adminpb.AdminRole_ADMIN_ROLE_MODERATOR
		default:
			role = adminpb.AdminRole_ADMIN_ROLE_SUPPORT
		}

		grpcReq := &adminpb.UpdateAdminRequest{
			AdminId: adminID,
			Name:    reqBody.Name,
			Email:   reqBody.Email,
			Role:    role,
		}

		resp, err := adminService.UpdateAdmin(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update admin: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"admin": map[string]interface{}{
				"adminId": resp.Admin.AdminId,
				"userId":  resp.Admin.UserId,
				"email":   resp.Admin.Email,
				"name":    resp.Admin.Name,
				"role":    resp.Admin.Role.String(),
				"isGenie": resp.Admin.IsGenie,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminDeleteAdminHandler handles deleting an admin user
func createAdminDeleteAdminHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract admin ID from path: /api/v1/admin/admins/{id}
		adminID := r.URL.Path[len("/api/v1/admin/admins/"):]
		if adminID == "" {
			http.Error(w, "Admin ID required", http.StatusBadRequest)
			return
		}

		grpcReq := &adminpb.DeleteAdminRequest{
			AdminId: adminID,
		}

		resp, err := adminService.DeleteAdmin(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to delete admin: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"success": resp.Success,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
	}
}

// createAdminUpdateProfileHandler handles updating admin profile
func createAdminUpdateProfileHandler(adminService *service.AdminService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var reqBody struct {
			AdminId string `json:"adminId"`
			Name    string `json:"name"`
			Email   string `json:"email"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		grpcReq := &adminpb.UpdateAdminProfileRequest{
			AdminId: reqBody.AdminId,
			Name:    reqBody.Name,
			Email:   reqBody.Email,
		}

		resp, err := adminService.UpdateAdminProfile(r.Context(), grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update profile: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"admin": map[string]interface{}{
				"adminId": resp.Admin.AdminId,
				"userId":  resp.Admin.UserId,
				"email":   resp.Admin.Email,
				"name":    resp.Admin.Name,
				"role":    resp.Admin.Role.String(),
				"isGenie": resp.Admin.IsGenie,
			},
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
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Connect-Protocol-Version, Connect-Timeout-Ms")
		w.Header().Set("Access-Control-Expose-Headers", "Connect-Protocol-Version, Connect-Timeout-Ms")

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
		"availableServices": []string{
			"AuthService (gRPC)",
			"UserService (gRPC)",
			"AvailabilityService (gRPC)",
			"AdminService (gRPC)",
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
		"redis": "connected",
		"key":   key,
		"value": result,
		"ttl":   "10 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ==============================================================================
// Slack Integration Handlers
// ==============================================================================

// createSlackSendMessageHandler creates HTTP handler for sending simple Slack messages
func createSlackSendMessageHandler(slackService *slack.SlackService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if !slackService.IsEnabled() {
			http.Error(w, "Slack integration is not enabled", http.StatusServiceUnavailable)
			return
		}

		var reqBody struct {
			Message string `json:"message"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		if reqBody.Message == "" {
			http.Error(w, "Message is required", http.StatusBadRequest)
			return
		}

		ctx := r.Context()
		if err := slackService.SendMessage(ctx, reqBody.Message); err != nil {
			http.Error(w, fmt.Sprintf("Failed to send message: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Message sent to Slack",
		})
	}
}

// createSlackAlertHandler creates HTTP handler for sending Slack alerts
func createSlackAlertHandler(slackService *slack.SlackService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if !slackService.IsEnabled() {
			http.Error(w, "Slack integration is not enabled", http.StatusServiceUnavailable)
			return
		}

		var reqBody struct {
			Title   string            `json:"title"`
			Message string            `json:"message"`
			Details map[string]string `json:"details,omitempty"`
			Type    string            `json:"type,omitempty"` // alert, success, warning, info
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		if reqBody.Title == "" || reqBody.Message == "" {
			http.Error(w, "Title and message are required", http.StatusBadRequest)
			return
		}

		ctx := r.Context()
		var err error

		switch reqBody.Type {
		case "success":
			err = slackService.SendSuccess(ctx, reqBody.Title, reqBody.Message, reqBody.Details)
		case "warning":
			err = slackService.SendWarning(ctx, reqBody.Title, reqBody.Message, reqBody.Details)
		case "info":
			err = slackService.SendInfo(ctx, reqBody.Title, reqBody.Message, reqBody.Details)
		default: // "alert" or empty
			err = slackService.SendAlert(ctx, reqBody.Title, reqBody.Message, reqBody.Details)
		}

		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to send alert: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": fmt.Sprintf("Alert sent to Slack (type: %s)", reqBody.Type),
		})
	}
}

// createSlackNotificationHandler creates HTTP handler for sending various Slack notifications
func createSlackNotificationHandler(slackService *slack.SlackService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if !slackService.IsEnabled() {
			http.Error(w, "Slack integration is not enabled", http.StatusServiceUnavailable)
			return
		}

		var reqBody struct {
			NotificationType string            `json:"notification_type"` // user_event, admin_activity, system_alert, ai_match
			Title            string            `json:"title,omitempty"`
			Message          string            `json:"message,omitempty"`
			Details          map[string]string `json:"details,omitempty"`

			// User event fields
			EventType string `json:"event_type,omitempty"` // registration, verification, deletion, suspension
			UserEmail string `json:"user_email,omitempty"`
			UserName  string `json:"user_name,omitempty"`

			// Admin activity fields
			AdminEmail string `json:"admin_email,omitempty"`
			Action     string `json:"action,omitempty"`
			Target     string `json:"target,omitempty"`

			// System alert fields
			Component string `json:"component,omitempty"`
			ErrorMsg  string `json:"error_msg,omitempty"`
			Severity  string `json:"severity,omitempty"` // critical, high, medium, low

			// AI match fields
			UserID   string  `json:"user_id,omitempty"`
			Matches  int     `json:"matches,omitempty"`
			AvgScore float64 `json:"avg_score,omitempty"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		ctx := r.Context()
		var err error

		switch reqBody.NotificationType {
		case "user_event":
			if reqBody.EventType == "" || reqBody.UserEmail == "" {
				http.Error(w, "event_type and user_email are required for user_event", http.StatusBadRequest)
				return
			}
			err = slackService.SendUserEvent(ctx, reqBody.EventType, reqBody.UserEmail, reqBody.UserName, reqBody.Details)

		case "admin_activity":
			if reqBody.AdminEmail == "" || reqBody.Action == "" {
				http.Error(w, "admin_email and action are required for admin_activity", http.StatusBadRequest)
				return
			}
			err = slackService.SendAdminActivity(ctx, reqBody.AdminEmail, reqBody.Action, reqBody.Target, reqBody.Details)

		case "system_alert":
			if reqBody.Component == "" || reqBody.ErrorMsg == "" {
				http.Error(w, "component and error_msg are required for system_alert", http.StatusBadRequest)
				return
			}
			severity := reqBody.Severity
			if severity == "" {
				severity = "medium"
			}
			err = slackService.SendSystemAlert(ctx, reqBody.Component, reqBody.ErrorMsg, severity)

		case "ai_match":
			if reqBody.UserID == "" {
				http.Error(w, "user_id is required for ai_match", http.StatusBadRequest)
				return
			}
			err = slackService.SendAIMatchEvent(ctx, reqBody.UserID, reqBody.Matches, reqBody.AvgScore)

		default:
			http.Error(w, "Invalid notification_type. Must be: user_event, admin_activity, system_alert, or ai_match", http.StatusBadRequest)
			return
		}

		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to send notification: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": fmt.Sprintf("Notification sent to Slack (type: %s)", reqBody.NotificationType),
		})
	}
}

// createSlackTestHandler creates HTTP handler for testing Slack integration
func createSlackTestHandler(slackService *slack.SlackService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		if !slackService.IsEnabled() {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"enabled": false,
				"message": "Slack integration is not enabled. Set SLACK_WEBHOOK_URL environment variable.",
			})
			return
		}

		ctx := r.Context()

		// Send test message
		testMessage := fmt.Sprintf("🧪 Slack Integration Test - %s", time.Now().Format("2006-01-02 15:04:05"))
		err := slackService.SendInfo(ctx, "Test Notification", testMessage, map[string]string{
			"Environment": os.Getenv("ENV"),
			"Server":      "Datifyy Backend",
			"Status":      "✅ Working",
		})

		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"enabled": true,
				"success": false,
				"error":   err.Error(),
				"message": "Failed to send test message to Slack",
			})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"enabled": true,
			"success": true,
			"message": "Test message sent successfully to Slack!",
			"sent_at": time.Now().Format("2006-01-02 15:04:05"),
		})
	}
}
