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
	"syscall"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/email"
	"github.com/datifyy/backend/internal/service"
	_ "github.com/lib/pq"
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
			// Parse JSON request
			var reqBody struct {
				BasicInfo      *userpb.BasicInfo      `json:"basic_info"`
				ProfileDetails *userpb.ProfileDetails `json:"profile_details"`
				LifestyleInfo  *userpb.LifestyleInfo  `json:"lifestyle_info"`
				Prompts        []*userpb.ProfilePrompt `json:"prompts"`
				UpdateFields   []string               `json:"update_fields"`
			}

			if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
				http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
				return
			}

			// Convert to gRPC request
			grpcReq := &userpb.UpdateProfileRequest{
				BasicInfo:      reqBody.BasicInfo,
				ProfileDetails: reqBody.ProfileDetails,
				LifestyleInfo:  reqBody.LifestyleInfo,
				Prompts:        reqBody.Prompts,
				UpdateFields:   reqBody.UpdateFields,
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
