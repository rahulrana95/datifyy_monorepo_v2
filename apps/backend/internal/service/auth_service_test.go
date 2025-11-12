package service

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/auth"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestAuthService creates a test auth service with a mock database
func setupTestAuthService(t *testing.T) (*AuthService, sqlmock.Sqlmock, *sql.DB) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)

	service := NewAuthService(db, nil, nil) // nil redis and email client for unit tests
	return service, mock, db
}

func TestLoginWithEmail_Success(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	email := "test@example.com"
	password := "TestPass123!"
	hashedPassword, _ := auth.HashPassword(password)
	now := time.Now()

	// Mock the GetByEmail query - all 18 fields
	rows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, email, "Test User", hashedPassword, nil,
		true, false, "ACTIVE",
		nil, nil,
		nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE email").
		WithArgs(email).
		WillReturnRows(rows)

	// Mock session insert
	mock.ExpectExec("INSERT INTO sessions").
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Mock UpdateLastLogin (only takes userID as argument)
	mock.ExpectExec("UPDATE users SET last_login_at").
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	req := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    email,
			Password: password,
		},
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "1", resp.User.UserId)
	assert.Equal(t, email, resp.User.Email)
	assert.Equal(t, "Test User", resp.User.Name)
	assert.NotNil(t, resp.Tokens)
	assert.NotNil(t, resp.Tokens.AccessToken)
	assert.NotNil(t, resp.Tokens.RefreshToken)
	assert.NotNil(t, resp.Session)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestLoginWithEmail_InvalidEmail(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    "invalid-email",
			Password: "TestPass123!",
		},
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid email")
}

func TestLoginWithEmail_EmptyPassword(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    "test@example.com",
			Password: "",
		},
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "password is required")
}

func TestLoginWithEmail_MissingCredentials(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.LoginWithEmailRequest{
		Credentials: nil,
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "credentials are required")
}

func TestLoginWithEmail_UserNotFound(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	email := "nonexistent@example.com"

	// Mock user not found
	mock.ExpectQuery("SELECT (.+) FROM users WHERE email").
		WithArgs(email).
		WillReturnError(sql.ErrNoRows)

	req := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    email,
			Password: "TestPass123!",
		},
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid email or password")
}

func TestLoginWithEmail_WrongPassword(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	email := "test@example.com"
	correctPassword := "TestPass123!"
	wrongPassword := "WrongPass456!"
	hashedPassword, _ := auth.HashPassword(correctPassword)
	now := time.Now()

	// Mock the GetByEmail query - all 18 fields
	rows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, email, "Test User", hashedPassword, nil,
		true, false, "ACTIVE",
		nil, nil,
		nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE email").
		WithArgs(email).
		WillReturnRows(rows)

	req := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    email,
			Password: wrongPassword,
		},
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid email or password")
}

func TestLoginWithEmail_SuspendedAccount(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	email := "test@example.com"
	password := "TestPass123!"
	hashedPassword, _ := auth.HashPassword(password)
	now := time.Now()

	// Mock the GetByEmail query with SUSPENDED status - all 18 fields
	rows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, email, "Test User", hashedPassword, nil,
		true, false, "SUSPENDED",
		nil, nil,
		nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE email").
		WithArgs(email).
		WillReturnRows(rows)

	req := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    email,
			Password: password,
		},
	}

	// Act
	resp, err := service.LoginWithEmail(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "SUSPENDED")
}

// ============================================================================
// RefreshToken Tests
// ============================================================================

func TestRefreshToken_Success(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour)

	// Mock session query
	sessionRows := sqlmock.NewRows([]string{"id", "user_id", "expires_at", "is_active", "last_active_at"}).
		AddRow(sessionID, userID, expiresAt, true, now)

	mock.ExpectQuery("SELECT (.+) FROM sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	// Mock user query - all 18 fields
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		userID, "test@example.com", "Test User", "hashedpass", nil,
		true, false, "ACTIVE",
		nil, nil,
		nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id").
		WithArgs(userID).
		WillReturnRows(userRows)

	// Mock session activity update
	mock.ExpectExec("UPDATE sessions SET last_active_at").
		WithArgs(sessionID).
		WillReturnResult(sqlmock.NewResult(0, 1))

	req := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Tokens)
	assert.NotNil(t, resp.Tokens.AccessToken)
	assert.Equal(t, refreshToken, resp.Tokens.RefreshToken.Token)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRefreshToken_EmptyToken(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.RefreshTokenRequest{
		RefreshToken: "",
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "refresh token is required")
}

func TestRefreshToken_InvalidFormat(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.RefreshTokenRequest{
		RefreshToken: "invalid_token_format",
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid refresh token format")
}

func TestRefreshToken_SessionNotFound(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Mock session query - return no rows
	mock.ExpectQuery("SELECT (.+) FROM sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnError(sql.ErrNoRows)

	req := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "session not found or expired")
}

func TestRefreshToken_SessionRevoked(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour)

	// Mock session query with is_active = false
	sessionRows := sqlmock.NewRows([]string{"id", "user_id", "expires_at", "is_active", "last_active_at"}).
		AddRow(sessionID, userID, expiresAt, false, now)

	mock.ExpectQuery("SELECT (.+) FROM sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	req := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "session has been revoked")
}

func TestRefreshToken_SessionExpired(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	expiresAt := now.Add(-1 * time.Hour) // Expired 1 hour ago

	// Mock session query with expired timestamp
	sessionRows := sqlmock.NewRows([]string{"id", "user_id", "expires_at", "is_active", "last_active_at"}).
		AddRow(sessionID, userID, expiresAt, true, now)

	mock.ExpectQuery("SELECT (.+) FROM sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	req := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "session has expired")
}

func TestRefreshToken_SuspendedAccount(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour)

	// Mock session query
	sessionRows := sqlmock.NewRows([]string{"id", "user_id", "expires_at", "is_active", "last_active_at"}).
		AddRow(sessionID, userID, expiresAt, true, now)

	mock.ExpectQuery("SELECT (.+) FROM sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	// Mock user query with SUSPENDED status - all 18 fields
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		userID, "test@example.com", "Test User", "hashedpass", nil,
		true, false, "SUSPENDED",
		nil, nil,
		nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id").
		WithArgs(userID).
		WillReturnRows(userRows)

	req := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RefreshToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "SUSPENDED")
}

// ============================================================================
// RevokeToken Tests
// ============================================================================

func TestRevokeToken_Success(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Mock session revocation update
	mock.ExpectExec("UPDATE sessions SET is_active = false").
		WithArgs(sessionID, userID).
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected

	req := &authpb.RevokeTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RevokeToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Token revoked successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRevokeToken_EmptyToken(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()

	req := &authpb.RevokeTokenRequest{
		RefreshToken: "",
	}

	// Act
	resp, err := service.RevokeToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "refresh token is required")
}

func TestRevokeToken_InvalidFormat(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()

	req := &authpb.RevokeTokenRequest{
		RefreshToken: "invalid_token_format",
	}

	// Act
	resp, err := service.RevokeToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid refresh token format")
}

func TestRevokeToken_SessionNotFound(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Mock session revocation update that affects 0 rows (session not found)
	mock.ExpectExec("UPDATE sessions SET is_active = false").
		WithArgs(sessionID, userID).
		WillReturnResult(sqlmock.NewResult(0, 0)) // 0 rows affected

	req := &authpb.RevokeTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RevokeToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "session not found or already revoked")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRevokeToken_DatabaseError(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := int64(1234567890)
	refreshToken := fmt.Sprintf("refresh_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Mock database error
	mock.ExpectExec("UPDATE sessions SET is_active = false").
		WithArgs(sessionID, userID).
		WillReturnError(fmt.Errorf("database connection error"))

	req := &authpb.RevokeTokenRequest{
		RefreshToken: refreshToken,
	}

	// Act
	resp, err := service.RevokeToken(ctx, req)

	// Assert
	require.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "failed to revoke session")
	assert.NoError(t, mock.ExpectationsWereMet())
}
