package service

import (
	"context"
	"database/sql"
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

	service := NewAuthService(db, nil) // nil redis for unit tests
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
