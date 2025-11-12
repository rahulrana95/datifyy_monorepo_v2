// +build integration

package tests

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/service"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDatabaseConnection(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Test connection
	err = db.Ping()
	if err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	// Test query
	var now time.Time
	err = db.QueryRow("SELECT NOW()").Scan(&now)
	if err != nil {
		t.Fatalf("Failed to query database: %v", err)
	}

	t.Logf("Database connected successfully. Server time: %v", now)
}

func TestRedisConnection(t *testing.T) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		t.Skip("REDIS_URL not set, skipping integration test")
	}

	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		t.Fatalf("Failed to parse Redis URL: %v", err)
	}

	client := redis.NewClient(opts)
	defer client.Close()

	// Test connection
	ctx := context.Background()
	pong, err := client.Ping(ctx).Result()
	if err != nil {
		t.Fatalf("Failed to ping Redis: %v", err)
	}

	if pong != "PONG" {
		t.Errorf("Expected PONG, got %s", pong)
	}

	// Test set/get
	key := fmt.Sprintf("test:integration:%d", time.Now().Unix())
	value := "test-value"

	err = client.Set(ctx, key, value, 10*time.Second).Err()
	if err != nil {
		t.Fatalf("Failed to set value in Redis: %v", err)
	}

	result, err := client.Get(ctx, key).Result()
	if err != nil {
		t.Fatalf("Failed to get value from Redis: %v", err)
	}

	if result != value {
		t.Errorf("Expected %s, got %s", value, result)
	}

	// Cleanup
	client.Del(ctx, key)
	t.Log("Redis connected and working successfully")
}

func TestAPIEndpoints(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	tests := []struct {
		name           string
		endpoint       string
		expectedStatus int
	}{
		{"Health Check", "/health", http.StatusOK},
		{"Ready Check", "/ready", http.StatusOK},
		{"Root", "/", http.StatusOK},
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := client.Get(baseURL + tt.endpoint)
			if err != nil {
				t.Fatalf("Failed to call %s: %v", tt.endpoint, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}

// setupTestDB creates a database connection for integration tests
func setupTestDB(t *testing.T) (*sql.DB, *redis.Client) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	require.NoError(t, err)

	err = db.Ping()
	require.NoError(t, err)

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opts, err := redis.ParseURL(redisURL)
	require.NoError(t, err)

	redisClient := redis.NewClient(opts)
	err = redisClient.Ping(context.Background()).Err()
	require.NoError(t, err)

	return db, redisClient
}

// cleanupTestUser removes test user from database
func cleanupTestUser(t *testing.T, db *sql.DB, email string) {
	// First get the user ID
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&userID)
	if err != nil && err != sql.ErrNoRows {
		t.Logf("Warning: failed to get user ID for cleanup: %v", err)
		return
	}

	// Delete sessions for this user
	if err == nil {
		_, err = db.Exec("DELETE FROM sessions WHERE user_id = $1", userID)
		if err != nil {
			t.Logf("Warning: failed to cleanup test sessions: %v", err)
		}
	}

	// Delete user
	_, err = db.Exec("DELETE FROM users WHERE email = $1", email)
	if err != nil {
		t.Logf("Warning: failed to cleanup test user: %v", err)
	}
}

func TestLoginWithEmail_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-test-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Integration Test User"

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
	assert.Equal(t, testEmail, registerResp.User.Email)
	assert.Equal(t, testName, registerResp.User.Name)

	// Wait a bit to ensure different session IDs (current implementation uses timestamp)
	// TODO: Improve session ID generation to use UUID instead of timestamp
	time.Sleep(1 * time.Second)

	// Step 2: Login with the registered user
	loginReq := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
		},
	}

	loginResp, err := authService.LoginWithEmail(ctx, loginReq)
	require.NoError(t, err)
	require.NotNil(t, loginResp)

	// Verify response
	assert.Equal(t, registerResp.User.UserId, loginResp.User.UserId)
	assert.Equal(t, testEmail, loginResp.User.Email)
	assert.Equal(t, testName, loginResp.User.Name)
	assert.NotNil(t, loginResp.Tokens)
	assert.NotNil(t, loginResp.Tokens.AccessToken)
	assert.NotNil(t, loginResp.Tokens.RefreshToken)
	assert.NotNil(t, loginResp.Session)

	// Verify tokens are different (new session created)
	assert.NotEqual(t, registerResp.Tokens.AccessToken.Token, loginResp.Tokens.AccessToken.Token)

	t.Log("LoginWithEmail integration test passed successfully")
}

func TestLoginWithEmail_WrongPassword_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-test-wrong-pass-%d@example.com", time.Now().Unix())
	testPassword := "CorrectPass123!"
	wrongPassword := "WrongPass456!"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Step 1: Register a new user
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     "Wrong Password Test",
		},
	}

	_, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)

	// Step 2: Try to login with wrong password
	loginReq := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: wrongPassword,
		},
	}

	loginResp, err := authService.LoginWithEmail(ctx, loginReq)
	require.Error(t, err)
	assert.Nil(t, loginResp)
	assert.Contains(t, err.Error(), "invalid email or password")

	t.Log("Wrong password test passed successfully")
}

func TestLoginWithEmail_NonExistentUser_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Try to login with non-existent user
	loginReq := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    "nonexistent@example.com",
			Password: "SomePass123!",
		},
	}

	loginResp, err := authService.LoginWithEmail(ctx, loginReq)
	require.Error(t, err)
	assert.Nil(t, loginResp)
	assert.Contains(t, err.Error(), "invalid email or password")

	t.Log("Non-existent user test passed successfully")
}

func TestRefreshToken_Success_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-refresh-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Refresh Test User"

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

	// Get the refresh token from registration
	originalRefreshToken := registerResp.Tokens.RefreshToken.Token
	originalAccessToken := registerResp.Tokens.AccessToken.Token

	// Wait a moment to ensure different access token timestamp
	time.Sleep(1 * time.Second)

	// Step 2: Refresh the token
	refreshReq := &authpb.RefreshTokenRequest{
		RefreshToken: originalRefreshToken,
	}

	refreshResp, err := authService.RefreshToken(ctx, refreshReq)
	require.NoError(t, err)
	require.NotNil(t, refreshResp)

	// Verify response
	assert.NotNil(t, refreshResp.Tokens)
	assert.NotNil(t, refreshResp.Tokens.AccessToken)
	assert.NotNil(t, refreshResp.Tokens.RefreshToken)

	// Access token should be new (different timestamp)
	assert.NotEqual(t, originalAccessToken, refreshResp.Tokens.AccessToken.Token)

	// Refresh token should be the same (we reuse it)
	assert.Equal(t, originalRefreshToken, refreshResp.Tokens.RefreshToken.Token)

	// Token type should be Bearer
	assert.Equal(t, "Bearer", refreshResp.Tokens.AccessToken.TokenType)

	t.Log("RefreshToken success integration test passed successfully")
}

func TestRefreshToken_InvalidToken_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Try to refresh with an invalid token
	refreshReq := &authpb.RefreshTokenRequest{
		RefreshToken: "invalid_token_format",
	}

	refreshResp, err := authService.RefreshToken(ctx, refreshReq)
	require.Error(t, err)
	assert.Nil(t, refreshResp)
	assert.Contains(t, err.Error(), "invalid refresh token format")

	t.Log("Invalid token test passed successfully")
}

func TestRefreshToken_NonExistentSession_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Try to refresh with a valid format but non-existent session
	// Format: refresh_token_{userID}_{timestamp}
	nonExistentToken := "refresh_token_99999_1234567890"

	refreshReq := &authpb.RefreshTokenRequest{
		RefreshToken: nonExistentToken,
	}

	refreshResp, err := authService.RefreshToken(ctx, refreshReq)
	require.Error(t, err)
	assert.Nil(t, refreshResp)
	assert.Contains(t, err.Error(), "session not found or expired")

	t.Log("Non-existent session test passed successfully")
}

func TestRefreshToken_RevokedSession_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-revoked-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Revoked Session Test User"

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

	refreshToken := registerResp.Tokens.RefreshToken.Token
	sessionID := registerResp.Session.SessionId

	// Step 2: Manually revoke the session
	_, err = db.ExecContext(ctx, "UPDATE sessions SET is_active = false WHERE id = $1", sessionID)
	require.NoError(t, err)

	// Step 3: Try to refresh with revoked session
	refreshReq := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	refreshResp, err := authService.RefreshToken(ctx, refreshReq)
	require.Error(t, err)
	assert.Nil(t, refreshResp)
	assert.Contains(t, err.Error(), "session has been revoked")

	t.Log("Revoked session test passed successfully")
}
func TestRevokeToken_Success_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-revoke-success-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Revoke Success Test User"

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

	refreshToken := registerResp.Tokens.RefreshToken.Token
	sessionID := registerResp.Session.SessionId

	// Verify session is active before revocation
	var isActive bool
	err = db.QueryRowContext(ctx, "SELECT is_active FROM sessions WHERE id = $1", sessionID).Scan(&isActive)
	require.NoError(t, err)
	assert.True(t, isActive)

	// Step 2: Revoke the token
	revokeReq := &authpb.RevokeTokenRequest{
		RefreshToken: refreshToken,
	}

	revokeResp, err := authService.RevokeToken(ctx, revokeReq)
	require.NoError(t, err)
	require.NotNil(t, revokeResp)
	assert.Equal(t, "Token revoked successfully", revokeResp.Message)

	// Step 3: Verify session is inactive after revocation
	err = db.QueryRowContext(ctx, "SELECT is_active FROM sessions WHERE id = $1", sessionID).Scan(&isActive)
	require.NoError(t, err)
	assert.False(t, isActive, "Session should be inactive after revocation")

	// Step 4: Try to refresh with the revoked token (should fail)
	refreshReq := &authpb.RefreshTokenRequest{
		RefreshToken: refreshToken,
	}

	refreshResp, err := authService.RefreshToken(ctx, refreshReq)
	require.Error(t, err)
	assert.Nil(t, refreshResp)
	assert.Contains(t, err.Error(), "session has been revoked")

	t.Log("RevokeToken success integration test passed successfully")
}

func TestRevokeToken_AlreadyRevoked_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Use unique email for this test run
	testEmail := fmt.Sprintf("integration-revoke-twice-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Revoke Twice Test User"

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

	refreshToken := registerResp.Tokens.RefreshToken.Token

	// Step 2: Revoke the token (first time)
	revokeReq := &authpb.RevokeTokenRequest{
		RefreshToken: refreshToken,
	}

	revokeResp, err := authService.RevokeToken(ctx, revokeReq)
	require.NoError(t, err)
	require.NotNil(t, revokeResp)

	// Step 3: Try to revoke the same token again (should fail)
	revokeResp, err = authService.RevokeToken(ctx, revokeReq)
	require.Error(t, err)
	assert.Nil(t, revokeResp)
	assert.Contains(t, err.Error(), "session not found or already revoked")

	t.Log("Revoke already revoked token test passed successfully")
}

func TestRevokeToken_InvalidToken_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient)

	// Try to revoke with an invalid token format
	revokeReq := &authpb.RevokeTokenRequest{
		RefreshToken: "invalid_token_format",
	}

	revokeResp, err := authService.RevokeToken(ctx, revokeReq)
	require.Error(t, err)
	assert.Nil(t, revokeResp)
	assert.Contains(t, err.Error(), "invalid refresh token format")

	t.Log("Invalid token test passed successfully")
}
