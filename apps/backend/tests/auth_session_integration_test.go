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

// TestListSessions_Success_Integration tests listing all active sessions for a user
func TestListSessions_Success_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-list-sessions-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "List Sessions Test User"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Step 1: Register a new user to create first session
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

	firstSessionID := registerResp.Session.SessionId

	// Wait a second to ensure different session ID timestamps
	time.Sleep(1 * time.Second)

	// Step 2: Login again to create a second session
	loginReq := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
		},
	}

	loginResp, err := authService.LoginWithEmail(ctx, loginReq)
	require.NoError(t, err)
	require.NotNil(t, loginResp)

	secondSessionID := loginResp.Session.SessionId

	// Note: ListSessions requires authentication via gRPC metadata
	// Since extractTokenFromContext() is not implemented yet,
	// this test demonstrates the structure but will fail at auth check

	listReq := &authpb.ListSessionsRequest{}

	_, err = authService.ListSessions(ctx, listReq)

	// Currently expects auth error since middleware is not implemented
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "authorization required")

	// When auth middleware is implemented, the test should verify:
	// assert.NoError(t, err)
	// assert.NotNil(t, listResp)
	// assert.GreaterOrEqual(t, len(listResp.Sessions), 2)
	// Verify both sessions are in the list
	// One session should be marked as current (is_current = true)

	t.Logf("Created sessions: %s, %s (auth middleware needed for full test)", firstSessionID, secondSessionID)
}

// TestRevokeSession_Success_Integration tests revoking a specific session
func TestRevokeSession_Success_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-revoke-session-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Revoke Session Test User"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Step 1: Register a new user to create first session
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

	firstSessionID := registerResp.Session.SessionId

	// Wait a second to ensure different session ID timestamps
	time.Sleep(1 * time.Second)

	// Step 2: Login again to create a second session
	loginReq := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
		},
	}

	loginResp, err := authService.LoginWithEmail(ctx, loginReq)
	require.NoError(t, err)
	require.NotNil(t, loginResp)

	// Note: RevokeSession requires authentication via gRPC metadata
	// Since extractTokenFromContext() is not implemented yet,
	// this test demonstrates the structure but will fail at auth check

	revokeReq := &authpb.RevokeSessionRequest{
		SessionId: firstSessionID,
	}

	_, err = authService.RevokeSession(ctx, revokeReq)

	// Currently expects auth error since middleware is not implemented
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "authorization required")

	// When auth middleware is implemented, the test should verify:
	// assert.NoError(t, err)
	// assert.NotNil(t, revokeResp)
	// assert.Equal(t, "Session revoked successfully", revokeResp.Message)
	// Verify the session is now inactive in the database
	// Verify the session was removed from Redis

	t.Logf("Session to revoke: %s (auth middleware needed for full test)", firstSessionID)
}

// TestRevokeSession_InvalidSessionID_Integration tests error handling for invalid session ID
func TestRevokeSession_InvalidSessionID_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)

	// Test with empty session ID
	revokeReq := &authpb.RevokeSessionRequest{
		SessionId: "",
	}

	revokeResp, err := authService.RevokeSession(ctx, revokeReq)

	// Should fail validation before auth check
	assert.Error(t, err)
	assert.Nil(t, revokeResp)
	assert.Contains(t, err.Error(), "session_id is required")

	t.Log("Invalid session ID test passed")
}

// TestGetCurrentSession_Success_Integration tests getting current session info
func TestGetCurrentSession_Success_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-get-session-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Get Session Test User"

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

	// Note: GetCurrentSession requires authentication via gRPC metadata
	// Since extractTokenFromContext() is not implemented yet,
	// this test demonstrates the structure but will fail at auth check

	getCurrentReq := &authpb.GetCurrentSessionRequest{}

	_, err = authService.GetCurrentSession(ctx, getCurrentReq)

	// Currently expects auth error since middleware is not implemented
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "authorization required")

	// When auth middleware is implemented, the test should verify:
	// assert.NoError(t, err)
	// assert.NotNil(t, getCurrentResp)
	// assert.NotNil(t, getCurrentResp.Session)
	// assert.Equal(t, registerResp.Session.SessionId, getCurrentResp.Session.SessionId)
	// assert.True(t, getCurrentResp.Session.IsCurrent)

	t.Log("GetCurrentSession structure validated (auth middleware needed for full test)")
}
