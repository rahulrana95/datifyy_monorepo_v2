package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/datifyy/backend/internal/auth"
	"github.com/datifyy/backend/internal/repository"
	"github.com/redis/go-redis/v9"
)

// AuthService handles authentication operations
type AuthService struct {
	authpb.UnimplementedAuthServiceServer
	userRepo *repository.UserRepository
	db       *sql.DB
	redis    *redis.Client
}

// NewAuthService creates a new auth service
func NewAuthService(db *sql.DB, redisClient *redis.Client) *AuthService {
	return &AuthService{
		userRepo: repository.NewUserRepository(db),
		db:       db,
		redis:    redisClient,
	}
}

// RegisterWithEmail implements email/password registration
func (s *AuthService) RegisterWithEmail(
	ctx context.Context,
	req *authpb.RegisterWithEmailRequest,
) (*authpb.RegisterWithEmailResponse, error) {
	// Validate input
	if req.Credentials == nil {
		return nil, fmt.Errorf("credentials are required")
	}

	if err := auth.ValidateEmail(req.Credentials.Email); err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	if err := auth.ValidatePassword(req.Credentials.Password); err != nil {
		return nil, fmt.Errorf("invalid password: %w", err)
	}

	if req.Credentials.Name == "" {
		return nil, fmt.Errorf("name is required")
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Credentials.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Generate verification token
	verificationToken, err := auth.GenerateVerificationToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate verification token: %w", err)
	}

	// Create user
	user, err := s.userRepo.Create(ctx, repository.CreateUserInput{
		Email:             req.Credentials.Email,
		Name:              req.Credentials.Name,
		PasswordHash:      passwordHash,
		VerificationToken: verificationToken,
		TokenExpiresAt:    time.Now().Add(24 * time.Hour), // Token valid for 24 hours
	})

	if err != nil {
		if err == repository.ErrEmailExists {
			return nil, fmt.Errorf("email already registered")
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// TODO: Send verification email with token
	// emailService.SendVerificationEmail(user.Email, verificationToken)

	// Create session and tokens
	tokens, sessionInfo, err := s.createSessionAndTokens(ctx, user, req.Credentials.DeviceInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Build user profile response
	userProfile := &authpb.UserProfile{
		UserId:        fmt.Sprintf("%d", user.ID),
		Email:         user.Email,
		Name:          user.Name,
		AccountStatus: accountStatusToProto(user.AccountStatus),
		EmailVerified: emailVerificationStatusToProto(user.EmailVerified),
		CreatedAt:     timeToProto(user.CreatedAt),
	}

	if user.LastLoginAt.Valid {
		userProfile.LastLoginAt = timeToProto(user.LastLoginAt.Time)
	}

	return &authpb.RegisterWithEmailResponse{
		User:                       userProfile,
		Tokens:                     tokens,
		Session:                    sessionInfo,
		RequiresEmailVerification:  true,
	}, nil
}

// LoginWithEmail implements email/password login
func (s *AuthService) LoginWithEmail(
	ctx context.Context,
	req *authpb.LoginWithEmailRequest,
) (*authpb.LoginWithEmailResponse, error) {
	// Validate credentials
	if req.Credentials == nil {
		return nil, fmt.Errorf("credentials are required")
	}

	if err := auth.ValidateEmail(req.Credentials.Email); err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	if req.Credentials.Password == "" {
		return nil, fmt.Errorf("password is required")
	}

	// Get user from database
	user, err := s.userRepo.GetByEmail(ctx, req.Credentials.Email)
	if err != nil {
		if err == repository.ErrUserNotFound {
			return nil, fmt.Errorf("invalid email or password")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Verify password
	if !user.PasswordHash.Valid {
		return nil, fmt.Errorf("account does not have password set")
	}

	if err := auth.VerifyPassword(user.PasswordHash.String, req.Credentials.Password); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check account status
	if user.AccountStatus == "SUSPENDED" || user.AccountStatus == "BANNED" || user.AccountStatus == "DELETED" {
		return nil, fmt.Errorf("account is %s", user.AccountStatus)
	}

	// Create session and tokens
	tokens, sessionInfo, err := s.createSessionAndTokens(ctx, user, req.Credentials.DeviceInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Update last login timestamp
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log but don't fail the request
		fmt.Printf("Warning: failed to update last login: %v\n", err)
	}

	// Build user profile response
	userProfile := &authpb.UserProfile{
		UserId:        fmt.Sprintf("%d", user.ID),
		Email:         user.Email,
		Name:          user.Name,
		AccountStatus: accountStatusToProto(user.AccountStatus),
		EmailVerified: emailVerificationStatusToProto(user.EmailVerified),
		CreatedAt:     timeToProto(user.CreatedAt),
	}

	if user.LastLoginAt.Valid {
		userProfile.LastLoginAt = timeToProto(user.LastLoginAt.Time)
	}

	return &authpb.LoginWithEmailResponse{
		User:    userProfile,
		Tokens:  tokens,
		Session: sessionInfo,
	}, nil
}

// RefreshToken implements token refresh using a refresh token
func (s *AuthService) RefreshToken(
	ctx context.Context,
	req *authpb.RefreshTokenRequest,
) (*authpb.RefreshTokenResponse, error) {
	// Validate input
	if req.RefreshToken == "" {
		return nil, fmt.Errorf("refresh token is required")
	}

	// Parse refresh token to extract user ID and timestamp
	// Format: "refresh_token_{userID}_{timestamp}"
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(req.RefreshToken, "refresh_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token format")
	}

	// Look up the session from database using token timestamp
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	var session struct {
		ID           string
		UserID       int
		ExpiresAt    time.Time
		IsActive     bool
		LastActiveAt time.Time
	}

	query := `
		SELECT id, user_id, expires_at, is_active, last_active_at
		FROM sessions
		WHERE id = $1 AND user_id = $2
	`

	err = s.db.QueryRowContext(ctx, query, sessionID, userID).Scan(
		&session.ID,
		&session.UserID,
		&session.ExpiresAt,
		&session.IsActive,
		&session.LastActiveAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found or expired")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to validate session: %w", err)
	}

	// Check if session is still active
	if !session.IsActive {
		return nil, fmt.Errorf("session has been revoked")
	}

	// Check if session has expired
	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("session has expired")
	}

	// Get user details
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Check account status
	if user.AccountStatus == "SUSPENDED" || user.AccountStatus == "BANNED" || user.AccountStatus == "DELETED" {
		return nil, fmt.Errorf("account is %s", user.AccountStatus)
	}

	// Generate new tokens (reuse existing session ID)
	accessToken := &authpb.AccessToken{
		Token:     generatePlaceholderToken(userID, "access"),
		ExpiresAt: timeToProto(time.Now().Add(15 * time.Minute)),
		TokenType: "Bearer",
	}

	refreshToken := &authpb.RefreshToken{
		Token:     req.RefreshToken, // Keep same refresh token
		ExpiresAt: timeToProto(session.ExpiresAt),
	}

	tokens := &authpb.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	// Update session's last_active_at
	_, err = s.db.ExecContext(ctx,
		"UPDATE sessions SET last_active_at = NOW() WHERE id = $1",
		sessionID,
	)

	if err != nil {
		// Log but don't fail the request
		fmt.Printf("Warning: failed to update session activity: %v\n", err)
	}

	return &authpb.RefreshTokenResponse{
		Tokens: tokens,
	}, nil
}

// RevokeToken implements token revocation (logout)
func (s *AuthService) RevokeToken(
	ctx context.Context,
	req *authpb.RevokeTokenRequest,
) (*authpb.RevokeTokenResponse, error) {
	// Validate input
	if req.RefreshToken == "" {
		return nil, fmt.Errorf("refresh token is required")
	}

	// Parse refresh token to extract user ID and timestamp
	// Format: "refresh_token_{userID}_{timestamp}"
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(req.RefreshToken, "refresh_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token format")
	}

	// Construct session ID from token
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Revoke the session in database by setting is_active = false
	query := `
		UPDATE sessions
		SET is_active = false
		WHERE id = $1 AND user_id = $2 AND is_active = true
	`

	result, err := s.db.ExecContext(ctx, query, sessionID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to revoke session: %w", err)
	}

	// Check if session was found and updated
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check revocation result: %w", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("session not found or already revoked")
	}

	// Remove session from Redis cache
	if s.redis != nil {
		redisKey := fmt.Sprintf("session:%s", sessionID)
		err = s.redis.Del(ctx, redisKey).Err()
		if err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: failed to remove session from Redis: %v\n", err)
		}
	}

	return &authpb.RevokeTokenResponse{
		Message: "Token revoked successfully",
	}, nil
}

// ValidateToken implements access token validation
func (s *AuthService) ValidateToken(
	ctx context.Context,
	req *authpb.ValidateTokenRequest,
) (*authpb.ValidateTokenResponse, error) {
	// Validate input
	if req.AccessToken == "" {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Parse access token to extract user ID and timestamp
	// Format: "access_token_{userID}_{timestamp}"
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(req.AccessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Calculate token expiration (15 minutes from issue time)
	issueTime := time.Unix(timestamp, 0)
	expiresAt := issueTime.Add(15 * time.Minute)

	// Check if token has expired
	if time.Now().After(expiresAt) {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Construct session ID from token timestamp
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Verify session exists and is active
	var isActive bool
	var sessionExpiresAt time.Time
	query := `
		SELECT is_active, expires_at
		FROM sessions
		WHERE id = $1 AND user_id = $2
	`

	err = s.db.QueryRowContext(ctx, query, sessionID, userID).Scan(&isActive, &sessionExpiresAt)
	if err == sql.ErrNoRows {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to validate session: %w", err)
	}

	// Check if session is active
	if !isActive {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Check if session has expired
	if time.Now().After(sessionExpiresAt) {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Get user to verify account status
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Check account status
	if user.AccountStatus == "SUSPENDED" || user.AccountStatus == "BANNED" || user.AccountStatus == "DELETED" {
		return &authpb.ValidateTokenResponse{
			Valid: false,
		}, nil
	}

	// Token is valid
	return &authpb.ValidateTokenResponse{
		Valid:     true,
		UserId:    fmt.Sprintf("%d", userID),
		SessionId: sessionID,
		ExpiresAt: timeToProto(expiresAt),
	}, nil
}

// Logout implements logout for the current session
// Extracts access token from gRPC metadata "authorization" header
func (s *AuthService) Logout(
	ctx context.Context,
	req *authpb.LogoutRequest,
) (*authpb.LogoutResponse, error) {
	// Extract access token from context
	// In production with auth middleware, this would be pre-validated
	// For now, we extract it from metadata directly

	// Get metadata from context
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to extract user ID and timestamp
	// Format: "access_token_{userID}_{timestamp}"
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	// Construct session ID from token
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Revoke the session
	query := `
		UPDATE sessions
		SET is_active = false
		WHERE id = $1 AND user_id = $2 AND is_active = true
	`

	result, err := s.db.ExecContext(ctx, query, sessionID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to logout: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check logout result: %w", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("session not found or already logged out")
	}

	// Remove session from Redis cache
	if s.redis != nil {
		redisKey := fmt.Sprintf("session:%s", sessionID)
		err = s.redis.Del(ctx, redisKey).Err()
		if err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: failed to remove session from Redis: %v\n", err)
		}
	}

	return &authpb.LogoutResponse{
		Message: "Logged out successfully",
	}, nil
}

// LoginWithOAuth logs in or registers user with OAuth provider
func (s *AuthService) LoginWithOAuth(
	ctx context.Context,
	req *authpb.LoginWithOAuthRequest,
) (*authpb.LoginWithOAuthResponse, error) {
	// Validate credentials
	if req.Credentials == nil {
		return nil, fmt.Errorf("credentials are required")
	}
	if req.Credentials.AccessToken == "" {
		return nil, fmt.Errorf("access_token is required")
	}

	// TODO: Verify OAuth token with the provider
	// For now, this is a placeholder implementation
	// In production, you would:
	// 1. Verify the access_token with the OAuth provider (Google, Facebook, etc.)
	// 2. Get user info from the provider
	// 3. Extract email, name, and other profile data

	// Placeholder user info (would come from OAuth provider)
	var oauthEmail string
	var oauthName string
	var oauthProviderID string // TODO: Use this when storing OAuth connection

	switch req.Credentials.Provider {
	case authpb.OAuthProvider_OAUTH_PROVIDER_GOOGLE:
		// TODO: Call Google OAuth API to verify token and get user info
		oauthEmail = "oauth_user@gmail.com" // Placeholder
		oauthName = "OAuth User"
		oauthProviderID = "google_123456"
	case authpb.OAuthProvider_OAUTH_PROVIDER_FACEBOOK:
		// TODO: Call Facebook Graph API
		oauthEmail = "oauth_user@facebook.com"
		oauthName = "OAuth User"
		oauthProviderID = "fb_123456"
	case authpb.OAuthProvider_OAUTH_PROVIDER_APPLE:
		// TODO: Verify Apple Sign In token
		oauthEmail = "oauth_user@privaterelay.appleid.com"
		oauthName = "OAuth User"
		oauthProviderID = "apple_123456"
	default:
		return nil, fmt.Errorf("unsupported OAuth provider")
	}
	_ = oauthProviderID // Will be used when we add OAuth accounts table

	// Check if user exists with this email
	user, err := s.userRepo.GetByEmail(ctx, oauthEmail)
	isNewUser := false

	if err != nil {
		// User doesn't exist - create new account
		isNewUser = true

		// Create user account
		// OAuth users don't have passwords, so we'll use an empty password hash
		newUserInput := repository.CreateUserInput{
			Email:        oauthEmail,
			Name:         oauthName,
			PasswordHash: "", // No password for OAuth users
			// Email verification not needed for OAuth
			VerificationToken: "",
			TokenExpiresAt:    time.Now(),
		}

		user, err = s.userRepo.Create(ctx, newUserInput)
		if err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}

		// OAuth users have verified email by default
		// TODO: Update email_verified to true in the database
		// TODO: Store OAuth provider info in oauth_accounts table
		// oauth_accounts(user_id, provider, provider_user_id, connected_at)
	} else {
		// Existing user - verify account status
		if user.AccountStatus != "active" {
			return nil, fmt.Errorf("account is %s", user.AccountStatus)
		}

		// Update last login
		if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
			fmt.Printf("Warning: failed to update last login: %v\n", err)
		}
	}

	// Create session and tokens
	tokens, session, err := s.createSessionAndTokens(ctx, user, req.Credentials.DeviceInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Build user profile
	userProfile := buildUserProfile(user)

	return &authpb.LoginWithOAuthResponse{
		User:      userProfile,
		Tokens:    tokens,
		Session:   session,
		IsNewUser: isNewUser,
	}, nil
}

// extractTokenFromContext extracts the access token from gRPC metadata
// Looks for "authorization" key with format "Bearer {token}" or just "{token}"
func extractTokenFromContext(ctx context.Context) string {
	// TODO: Import google.golang.org/grpc/metadata when implementing
	// For now, return empty string - this will be implemented with auth middleware
	// md, ok := metadata.FromIncomingContext(ctx)
	// if !ok {
	//     return ""
	// }
	//
	// authHeaders := md.Get("authorization")
	// if len(authHeaders) == 0 {
	//     return ""
	// }
	//
	// // Handle "Bearer {token}" format
	// token := strings.TrimPrefix(authHeaders[0], "Bearer ")
	// return token

	return "" // Placeholder until we add gRPC metadata support
}

// createSessionAndTokens creates a session and generates access/refresh tokens
func (s *AuthService) createSessionAndTokens(
	ctx context.Context,
	user *repository.User,
	deviceInfo *authpb.DeviceInfo,
) (*authpb.TokenPair, *authpb.SessionInfo, error) {
	// For now, we'll use simple JWT tokens (to be implemented with proper JWT library)
	// This is a placeholder implementation

	sessionID := fmt.Sprintf("sess_%d_%d", user.ID, time.Now().Unix())

	// Create tokens (placeholder)
	accessToken := &authpb.AccessToken{
		Token:     generatePlaceholderToken(user.ID, "access"),
		ExpiresAt: timeToProto(time.Now().Add(15 * time.Minute)),
		TokenType: "Bearer",
	}

	refreshToken := &authpb.RefreshToken{
		Token:     generatePlaceholderToken(user.ID, "refresh"),
		ExpiresAt: timeToProto(time.Now().Add(7 * 24 * time.Hour)),
	}

	tokens := &authpb.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	// Create session info
	sessionInfo := &authpb.SessionInfo{
		SessionId: sessionID,
		UserId:    fmt.Sprintf("%d", user.ID),
		CreatedAt: timeToProto(time.Now()),
		ExpiresAt: refreshToken.ExpiresAt,
		IsCurrent: true,
	}

	if deviceInfo != nil {
		sessionInfo.DeviceInfo = deviceInfo
	}

	// Store session in database
	deviceIDStr := ""
	if deviceInfo != nil && deviceInfo.DeviceId != "" {
		deviceIDStr = deviceInfo.DeviceId
	}

	expiresAt := time.Unix(refreshToken.ExpiresAt.Seconds, int64(refreshToken.ExpiresAt.Nanos))

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO sessions (id, user_id, device_id, expires_at, is_active, last_active_at)
		 VALUES ($1, $2, $3, $4, true, NOW())`,
		sessionID,
		user.ID,
		sql.NullString{String: deviceIDStr, Valid: deviceIDStr != ""},
		expiresAt,
	)

	if err != nil {
		return nil, nil, fmt.Errorf("failed to store session: %w", err)
	}

	// Store session in Redis for fast lookup
	if s.redis != nil {
		sessionData := fmt.Sprintf("%d:%s", user.ID, sessionID)
		err = s.redis.Set(ctx, fmt.Sprintf("session:%s", sessionID), sessionData, 7*24*time.Hour).Err()
		if err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: failed to store session in Redis: %v\n", err)
		}
	}

	return tokens, sessionInfo, nil
}

// generatePlaceholderToken generates a simple placeholder token
// TODO: Replace with proper JWT implementation
func generatePlaceholderToken(userID int, tokenType string) string {
	return fmt.Sprintf("%s_token_%d_%d", tokenType, userID, time.Now().Unix())
}

// Helper functions to convert database values to proto enums

func accountStatusToProto(status string) commonpb.AccountStatus {
	switch status {
	case "ACTIVE":
		return commonpb.AccountStatus_ACCOUNT_STATUS_ACTIVE
	case "PENDING":
		return commonpb.AccountStatus_ACCOUNT_STATUS_PENDING
	case "SUSPENDED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_SUSPENDED
	case "BANNED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_BANNED
	case "DELETED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_DELETED
	default:
		return commonpb.AccountStatus_ACCOUNT_STATUS_UNSPECIFIED
	}
}

func emailVerificationStatusToProto(verified bool) commonpb.VerificationStatus {
	if verified {
		return commonpb.VerificationStatus_VERIFICATION_STATUS_VERIFIED
	}
	return commonpb.VerificationStatus_VERIFICATION_STATUS_UNVERIFIED
}

// timeToProto converts a Go time.Time to our custom Timestamp proto
func timeToProto(t time.Time) *commonpb.Timestamp {
	return &commonpb.Timestamp{
		Seconds: t.Unix(),
		Nanos:   int32(t.Nanosecond()),
	}
}
