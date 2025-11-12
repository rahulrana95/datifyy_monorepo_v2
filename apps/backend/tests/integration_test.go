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