package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrEmailExists       = errors.New("email already exists")
	ErrPhoneExists       = errors.New("phone number already exists")
	ErrDatabaseError     = errors.New("database error")
)

// User represents a user in the database
type User struct {
	ID                            int
	Email                         string
	Name                          string
	PasswordHash                  sql.NullString
	PhoneNumber                   sql.NullString
	EmailVerified                 bool
	PhoneVerified                 bool
	AccountStatus                 string
	VerificationToken             sql.NullString
	VerificationTokenExpiresAt    sql.NullTime
	PasswordResetToken            sql.NullString
	PasswordResetTokenExpiresAt   sql.NullTime
	LastLoginAt                   sql.NullTime
	PhotoURL                      sql.NullString
	DateOfBirth                   sql.NullTime
	Gender                        sql.NullString
	CreatedAt                     time.Time
	UpdatedAt                     time.Time
}

// CreateUserInput represents input for creating a user
type CreateUserInput struct {
	Email             string
	Name              string
	PasswordHash      string
	VerificationToken string
	TokenExpiresAt    time.Time
}

// UserRepository handles user database operations
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(ctx context.Context, input CreateUserInput) (*User, error) {
	// Check if email already exists
	var exists bool
	err := r.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM datifyy_v2_users WHERE email = $1)",
		input.Email,
	).Scan(&exists)

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	if exists {
		return nil, ErrEmailExists
	}

	// Insert user
	query := `
		INSERT INTO datifyy_v2_users (
			email, name, password_hash, email_verified, account_status,
			verification_token, verification_token_expires_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, email, name, password_hash, email_verified, account_status,
		          verification_token, verification_token_expires_at, created_at, updated_at
	`

	user := &User{}
	err = r.db.QueryRowContext(ctx, query,
		input.Email,
		input.Name,
		input.PasswordHash,
		false, // email_verified
		"PENDING", // account_status
		input.VerificationToken,
		input.TokenExpiresAt,
	).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.EmailVerified,
		&user.AccountStatus,
		&user.VerificationToken,
		&user.VerificationTokenExpiresAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	// Create empty profile for user
	_, err = r.db.ExecContext(ctx,
		"INSERT INTO datifyy_v2_user_profiles (user_id) VALUES ($1)",
		user.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("%w: failed to create profile: %v", ErrDatabaseError, err)
	}

	// Create default partner preferences
	_, err = r.db.ExecContext(ctx,
		"INSERT INTO datifyy_v2_partner_preferences (user_id) VALUES ($1)",
		user.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("%w: failed to create preferences: %v", ErrDatabaseError, err)
	}

	return user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, phone_number,
		       email_verified, phone_verified, account_status,
		       verification_token, verification_token_expires_at,
		       password_reset_token, password_reset_token_expires_at,
		       last_login_at, photo_url, date_of_birth, gender,
		       created_at, updated_at
		FROM datifyy_v2_users
		WHERE email = $1
	`

	user := &User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.PhoneNumber,
		&user.EmailVerified,
		&user.PhoneVerified,
		&user.AccountStatus,
		&user.VerificationToken,
		&user.VerificationTokenExpiresAt,
		&user.PasswordResetToken,
		&user.PasswordResetTokenExpiresAt,
		&user.LastLoginAt,
		&user.PhotoURL,
		&user.DateOfBirth,
		&user.Gender,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return user, nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id int) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, phone_number,
		       email_verified, phone_verified, account_status,
		       verification_token, verification_token_expires_at,
		       password_reset_token, password_reset_token_expires_at,
		       last_login_at, photo_url, date_of_birth, gender,
		       created_at, updated_at
		FROM datifyy_v2_users
		WHERE id = $1
	`

	user := &User{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.PhoneNumber,
		&user.EmailVerified,
		&user.PhoneVerified,
		&user.AccountStatus,
		&user.VerificationToken,
		&user.VerificationTokenExpiresAt,
		&user.PasswordResetToken,
		&user.PasswordResetTokenExpiresAt,
		&user.LastLoginAt,
		&user.PhotoURL,
		&user.DateOfBirth,
		&user.Gender,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return user, nil
}

// UpdateLastLogin updates the user's last login timestamp
func (r *UserRepository) UpdateLastLogin(ctx context.Context, userID int) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE datifyy_v2_users SET last_login_at = NOW() WHERE id = $1",
		userID,
	)

	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// VerifyEmail marks the user's email as verified
func (r *UserRepository) VerifyEmail(ctx context.Context, userID int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE datifyy_v2_users
		 SET email_verified = true,
		     account_status = 'ACTIVE',
		     verification_token = NULL,
		     verification_token_expires_at = NULL
		 WHERE id = $1`,
		userID,
	)

	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// UpdateAccountStatus updates the user's account status
func (r *UserRepository) UpdateAccountStatus(ctx context.Context, userID int, status string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE datifyy_v2_users SET account_status = $1 WHERE id = $2",
		status, userID,
	)

	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// UpdateBasicInfo updates basic user information (name, gender, phone_number)
func (r *UserRepository) UpdateBasicInfo(ctx context.Context, userID int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	query := "UPDATE datifyy_v2_users SET "
	args := []interface{}{}
	argPos := 1

	for field, value := range updates {
		if argPos > 1 {
			query += ", "
		}
		query += fmt.Sprintf("%s = $%d", field, argPos)
		args = append(args, value)
		argPos++
	}

	query += fmt.Sprintf(" WHERE id = $%d", argPos)
	args = append(args, userID)

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}
