package integration

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/service"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var (
	testDB    *sql.DB
	testRedis *redis.Client
)

// TestMain sets up the test database and runs tests
func TestMain(m *testing.M) {
	// Setup
	var err error
	testDB, testRedis, err = setupTestEnvironment()
	if err != nil {
		fmt.Printf("Failed to setup test environment: %v\n", err)
		os.Exit(1)
	}

	// Run tests
	code := m.Run()

	// Cleanup
	cleanupTestEnvironment()

	os.Exit(code)
}

func setupTestEnvironment() (*sql.DB, *redis.Client, error) {
	// Get test database URL from environment or use default
	dbURL := os.Getenv("TEST_DATABASE_URL")
	if dbURL == "" {
		// Try regular DATABASE_URL (for container environment)
		dbURL = os.Getenv("DATABASE_URL")
	}
	if dbURL == "" {
		dbURL = "postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Verify connection
	if err := db.Ping(); err != nil {
		return nil, nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Connect to Redis
	redisURL := os.Getenv("TEST_REDIS_URL")
	if redisURL == "" {
		// Try regular REDIS_URL (for container environment)
		redisURL = os.Getenv("REDIS_URL")
	}
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to parse redis URL: %w", err)
	}

	redisClient := redis.NewClient(opts)

	// Verify Redis connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		return nil, nil, fmt.Errorf("failed to ping redis: %w", err)
	}

	return db, redisClient, nil
}

func cleanupTestEnvironment() {
	if testDB != nil {
		testDB.Close()
	}
	if testRedis != nil {
		testRedis.Close()
	}
}

// cleanupTestData removes test data created during tests
func cleanupTestData(t *testing.T, email string) {
	ctx := context.Background()

	// Delete user and related data (cascades)
	_, err := testDB.ExecContext(ctx, "DELETE FROM users WHERE email = $1", email)
	if err != nil {
		t.Logf("Warning: failed to cleanup test user: %v", err)
	}
}

func TestRegisterWithEmail_Success(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}

	authService := service.NewAuthService(testDB, testRedis, nil)
	ctx := context.Background()

	testEmail := fmt.Sprintf("test-%d@example.com", time.Now().Unix())
	defer cleanupTestData(t, testEmail)

	req := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: "Test123!@#",
			Name:     "Test User",
			DeviceInfo: &authpb.DeviceInfo{
				Platform:   1, // WEB
				DeviceName: "Chrome Browser",
				OsVersion:  "MacOS",
			},
		},
	}

	resp, err := authService.RegisterWithEmail(ctx, req)

	// Assertions
	if err != nil {
		t.Fatalf("RegisterWithEmail failed: %v", err)
	}

	if resp == nil {
		t.Fatal("expected response, got nil")
	}

	if resp.User == nil {
		t.Fatal("expected user in response")
	}

	if resp.User.Email != testEmail {
		t.Errorf("expected email %s, got %s", testEmail, resp.User.Email)
	}

	if resp.User.Name != "Test User" {
		t.Errorf("expected name 'Test User', got %s", resp.User.Name)
	}

	if !resp.RequiresEmailVerification {
		t.Error("expected RequiresEmailVerification to be true")
	}

	if resp.Tokens == nil {
		t.Fatal("expected tokens in response")
	}

	if resp.Tokens.AccessToken == nil || resp.Tokens.AccessToken.Token == "" {
		t.Error("expected access token")
	}

	if resp.Tokens.RefreshToken == nil || resp.Tokens.RefreshToken.Token == "" {
		t.Error("expected refresh token")
	}

	if resp.Session == nil {
		t.Fatal("expected session in response")
	}

	if resp.Session.SessionId == "" {
		t.Error("expected session ID")
	}

	// Verify user was created in database
	var userID int
	var emailVerified bool
	err = testDB.QueryRowContext(ctx,
		"SELECT id, email_verified FROM users WHERE email = $1",
		testEmail,
	).Scan(&userID, &emailVerified)

	if err != nil {
		t.Fatalf("failed to query user: %v", err)
	}

	if emailVerified {
		t.Error("expected email_verified to be false for new user")
	}

	// Verify profile was created
	var profileID int
	err = testDB.QueryRowContext(ctx,
		"SELECT id FROM user_profiles WHERE user_id = $1",
		userID,
	).Scan(&profileID)

	if err != nil {
		t.Errorf("expected profile to be created: %v", err)
	}

	// Verify partner preferences were created
	var preferencesID int
	err = testDB.QueryRowContext(ctx,
		"SELECT id FROM partner_preferences WHERE user_id = $1",
		userID,
	).Scan(&preferencesID)

	if err != nil {
		t.Errorf("expected partner preferences to be created: %v", err)
	}

	// Verify session was created
	var sessionID string
	err = testDB.QueryRowContext(ctx,
		"SELECT id FROM sessions WHERE user_id = $1 AND is_active = true",
		userID,
	).Scan(&sessionID)

	if err != nil {
		t.Errorf("expected session to be created: %v", err)
	}
}

func TestRegisterWithEmail_DuplicateEmail(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}

	authService := service.NewAuthService(testDB, testRedis, nil)
	ctx := context.Background()

	testEmail := fmt.Sprintf("test-%d@example.com", time.Now().Unix())
	defer cleanupTestData(t, testEmail)

	req := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: "Test123!@#",
			Name:     "Test User",
		},
	}

	// First registration should succeed
	_, err := authService.RegisterWithEmail(ctx, req)
	if err != nil {
		t.Fatalf("first registration failed: %v", err)
	}

	// Second registration with same email should fail
	_, err = authService.RegisterWithEmail(ctx, req)
	if err == nil {
		t.Error("expected error for duplicate email, got nil")
	}
}

func TestRegisterWithEmail_InvalidEmail(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}

	authService := service.NewAuthService(testDB, testRedis, nil)
	ctx := context.Background()

	tests := []struct {
		name  string
		email string
	}{
		{
			name:  "invalid format",
			email: "not-an-email",
		},
		{
			name:  "missing @",
			email: "userexample.com",
		},
		{
			name:  "empty email",
			email: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &authpb.RegisterWithEmailRequest{
				Credentials: &authpb.EmailPasswordCredentials{
					Email:    tt.email,
					Password: "Test123!@#",
					Name:     "Test User",
				},
			}

			_, err := authService.RegisterWithEmail(ctx, req)
			if err == nil {
				t.Errorf("expected error for invalid email %s, got nil", tt.email)
			}
		})
	}
}

func TestRegisterWithEmail_WeakPassword(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}

	authService := service.NewAuthService(testDB, testRedis, nil)
	ctx := context.Background()

	tests := []struct {
		name     string
		password string
	}{
		{
			name:     "too short",
			password: "Test1!",
		},
		{
			name:     "no uppercase",
			password: "test123!@#",
		},
		{
			name:     "no lowercase",
			password: "TEST123!@#",
		},
		{
			name:     "no number",
			password: "TestTest!@#",
		},
		{
			name:     "no special char",
			password: "Test1234567",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &authpb.RegisterWithEmailRequest{
				Credentials: &authpb.EmailPasswordCredentials{
					Email:    fmt.Sprintf("test-%d@example.com", time.Now().UnixNano()),
					Password: tt.password,
					Name:     "Test User",
				},
			}

			_, err := authService.RegisterWithEmail(ctx, req)
			if err == nil {
				t.Errorf("expected error for weak password, got nil")
			}
		})
	}
}

func TestRegisterWithEmail_MissingName(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}

	authService := service.NewAuthService(testDB, testRedis, nil)
	ctx := context.Background()

	req := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    fmt.Sprintf("test-%d@example.com", time.Now().Unix()),
			Password: "Test123!@#",
			Name:     "",
		},
	}

	_, err := authService.RegisterWithEmail(ctx, req)
	if err == nil {
		t.Error("expected error for missing name, got nil")
	}
}
