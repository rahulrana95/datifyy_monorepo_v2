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
