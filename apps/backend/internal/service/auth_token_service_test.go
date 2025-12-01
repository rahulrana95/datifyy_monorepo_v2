package service

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ============================================================================
// ValidateToken Tests
// ============================================================================

func TestValidateToken_Success(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := time.Now().Unix()
	accessToken := fmt.Sprintf("access_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	sessionExpiresAt := now.Add(7 * 24 * time.Hour)

	// Mock session query
	sessionRows := sqlmock.NewRows([]string{"is_active", "expires_at"}).
		AddRow(true, sessionExpiresAt)

	mock.ExpectQuery("SELECT is_active, expires_at FROM datifyy_v2_sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	// Mock user query
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

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(userID).
		WillReturnRows(userRows)

	req := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.True(t, resp.Valid)
	assert.Equal(t, fmt.Sprintf("%d", userID), resp.UserId)
	assert.Equal(t, sessionID, resp.SessionId)
	assert.NotNil(t, resp.ExpiresAt)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestValidateToken_EmptyToken(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()

	req := &authpb.ValidateTokenRequest{
		AccessToken: "",
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid)
}

func TestValidateToken_InvalidFormat(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()

	req := &authpb.ValidateTokenRequest{
		AccessToken: "invalid_token_format",
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid)
}

func TestValidateToken_Expired(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	// Token issued 20 minutes ago (expired, as tokens are valid for 15 minutes)
	timestamp := time.Now().Add(-20 * time.Minute).Unix()
	accessToken := fmt.Sprintf("access_token_%d_%d", userID, timestamp)

	req := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid, "Token should be invalid as it has expired")
}

func TestValidateToken_SessionNotFound(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := time.Now().Unix()
	accessToken := fmt.Sprintf("access_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Mock session query - no rows returned
	mock.ExpectQuery("SELECT is_active, expires_at FROM datifyy_v2_sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnError(sql.ErrNoRows)

	req := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestValidateToken_SessionInactive(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := time.Now().Unix()
	accessToken := fmt.Sprintf("access_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	sessionExpiresAt := now.Add(7 * 24 * time.Hour)

	// Mock session query - is_active = false
	sessionRows := sqlmock.NewRows([]string{"is_active", "expires_at"}).
		AddRow(false, sessionExpiresAt)

	mock.ExpectQuery("SELECT is_active, expires_at FROM datifyy_v2_sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	req := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestValidateToken_SessionExpired(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := time.Now().Unix()
	accessToken := fmt.Sprintf("access_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	// Session expired 1 hour ago
	sessionExpiresAt := time.Now().Add(-1 * time.Hour)

	// Mock session query
	sessionRows := sqlmock.NewRows([]string{"is_active", "expires_at"}).
		AddRow(true, sessionExpiresAt)

	mock.ExpectQuery("SELECT is_active, expires_at FROM datifyy_v2_sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	req := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestValidateToken_SuspendedAccount(t *testing.T) {
	// Arrange
	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	userID := 1
	timestamp := time.Now().Unix()
	accessToken := fmt.Sprintf("access_token_%d_%d", userID, timestamp)
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)
	now := time.Now()
	sessionExpiresAt := now.Add(7 * 24 * time.Hour)

	// Mock session query
	sessionRows := sqlmock.NewRows([]string{"is_active", "expires_at"}).
		AddRow(true, sessionExpiresAt)

	mock.ExpectQuery("SELECT is_active, expires_at FROM datifyy_v2_sessions WHERE").
		WithArgs(sessionID, userID).
		WillReturnRows(sessionRows)

	// Mock user query - suspended account
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		userID, "suspended@example.com", "Suspended User", "hashedpass", nil,
		true, false, "SUSPENDED", // Account is SUSPENDED
		nil, nil,
		nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(userID).
		WillReturnRows(userRows)

	req := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	// Act
	resp, err := service.ValidateToken(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.False(t, resp.Valid)
	assert.NoError(t, mock.ExpectationsWereMet())
}
