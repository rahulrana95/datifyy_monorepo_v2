// +build integration

package tests

import (
	"context"
	"fmt"
	"testing"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateToken_Success_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-validate-token-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Validate Token Test User"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Step 1: Register a new user to get a valid token
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     testName,
		},
	}

	registerResp, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)
	require.NotNil(t, registerResp)

	accessToken := registerResp.Tokens.AccessToken.Token
	expectedUserID := registerResp.User.UserId
	expectedSessionID := registerResp.Session.SessionId

	// Step 2: Validate the access token
	validateReq := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	validateResp, err := authService.ValidateToken(ctx, validateReq)
	require.NoError(t, err)
	require.NotNil(t, validateResp)

	// Verify the validation response
	assert.True(t, validateResp.Valid)
	assert.Equal(t, expectedUserID, validateResp.UserId)
	assert.Equal(t, expectedSessionID, validateResp.SessionId)
	assert.NotNil(t, validateResp.ExpiresAt)

	t.Log("ValidateToken success integration test passed successfully")
}

func TestValidateToken_RevokedToken_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-validate-revoked-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Validate Revoked Token Test User"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Step 1: Register a new user
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     testName,
		},
	}

	registerResp, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)
	require.NotNil(t, registerResp)

	accessToken := registerResp.Tokens.AccessToken.Token
	refreshToken := registerResp.Tokens.RefreshToken.Token

	// Step 2: Revoke the token
	revokeReq := &authpb.RevokeTokenRequest{
		RefreshToken: refreshToken,
	}

	_, err = authService.RevokeToken(ctx, revokeReq)
	require.NoError(t, err)

	// Step 3: Try to validate the revoked token (should fail)
	validateReq := &authpb.ValidateTokenRequest{
		AccessToken: accessToken,
	}

	validateResp, err := authService.ValidateToken(ctx, validateReq)
	require.NoError(t, err)
	require.NotNil(t, validateResp)
	assert.False(t, validateResp.Valid, "Token should be invalid after session revocation")

	t.Log("Validate revoked token test passed successfully")
}

func TestValidateToken_InvalidToken_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	tests := []struct {
		name        string
		accessToken string
	}{
		{"Empty token", ""},
		{"Invalid format", "invalid_token_format"},
		{"Non-existent token", "access_token_99999_1234567890"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			validateReq := &authpb.ValidateTokenRequest{
				AccessToken: tt.accessToken,
			}

			validateResp, err := authService.ValidateToken(ctx, validateReq)
			require.NoError(t, err)
			require.NotNil(t, validateResp)
			assert.False(t, validateResp.Valid, "Token should be invalid: %s", tt.name)
		})
	}

	t.Log("Invalid token tests passed successfully")
}
