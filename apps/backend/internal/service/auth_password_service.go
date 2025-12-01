package service

import (
	"context"
	"fmt"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/auth"
	"golang.org/x/crypto/bcrypt"
)

// ChangePassword changes the password for an authenticated user
// Requires authentication - extracts user from context
func (s *AuthService) ChangePassword(
	ctx context.Context,
	req *authpb.ChangePasswordRequest,
) (*authpb.ChangePasswordResponse, error) {
	// Validate input
	if req.CurrentPassword == "" {
		return nil, fmt.Errorf("current_password is required")
	}
	if req.NewPassword == "" {
		return nil, fmt.Errorf("new_password is required")
	}

	// Extract access token from context
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to get user ID
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	// Get user from database with password
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Check if password hash exists
	if !user.PasswordHash.Valid {
		return nil, fmt.Errorf("user has no password set")
	}

	// Verify current password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String), []byte(req.CurrentPassword))
	if err != nil {
		return &authpb.ChangePasswordResponse{
			Success: false,
			Message: "Current password is incorrect",
		}, nil
	}

	// Validate new password strength
	if err := auth.ValidatePassword(req.NewPassword); err != nil {
		return nil, fmt.Errorf("new password validation failed: %w", err)
	}

	// Check if new password is same as current
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String), []byte(req.NewPassword))
	if err == nil {
		return nil, fmt.Errorf("new password must be different from current password")
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password in database
	query := `
		UPDATE datifyy_v2_users
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`

	_, err = s.db.ExecContext(ctx, query, string(hashedPassword), time.Now(), userID)
	if err != nil {
		return nil, fmt.Errorf("failed to update password: %w", err)
	}

	// Optionally revoke all other sessions for security
	if req.RevokeOtherSessions {
		currentSessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

		revokeQuery := `
			UPDATE datifyy_v2_sessions
			SET is_active = false
			WHERE user_id = $1 AND id != $2 AND is_active = true
		`

		_, err = s.db.ExecContext(ctx, revokeQuery, userID, currentSessionID)
		if err != nil {
			// Log error but don't fail the password change
			fmt.Printf("Warning: failed to revoke other sessions: %v\n", err)
		}
	}

	return &authpb.ChangePasswordResponse{
		Success: true,
		Message: "Password changed successfully",
	}, nil
}

// RequestPasswordReset initiates password reset flow
// Sends reset token via email
func (s *AuthService) RequestPasswordReset(
	ctx context.Context,
	req *authpb.RequestPasswordResetRequest,
) (*authpb.RequestPasswordResetResponse, error) {
	// Validate input
	if req.ResetRequest == nil || req.ResetRequest.Email == "" {
		return nil, fmt.Errorf("email is required")
	}

	if err := auth.ValidateEmail(req.ResetRequest.Email); err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.ResetRequest.Email)
	if err != nil {
		// For security, don't reveal if email exists or not
		// Return success even if user doesn't exist
		return &authpb.RequestPasswordResetResponse{
			Message: "If an account with that email exists, a password reset link has been sent",
		}, nil
	}

	// Generate password reset token
	resetToken, err := auth.GenerateVerificationToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate reset token: %w", err)
	}

	// Store reset token with expiration (1 hour)
	expiresAt := time.Now().Add(1 * time.Hour)

	query := `
		UPDATE datifyy_v2_users
		SET password_reset_token = $1, password_reset_token_expires_at = $2
		WHERE id = $3
	`

	_, err = s.db.ExecContext(ctx, query, resetToken, expiresAt, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to store reset token: %w", err)
	}

	// Send password reset email
	if s.emailClient != nil {
		err = s.emailClient.SendPasswordResetEmail(req.ResetRequest.Email, resetToken)
		if err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: failed to send password reset email: %v\n", err)
		}
	}

	return &authpb.RequestPasswordResetResponse{
		Message: "If an account with that email exists, a password reset link has been sent",
	}, nil
}

// ConfirmPasswordReset completes password reset with token
func (s *AuthService) ConfirmPasswordReset(
	ctx context.Context,
	req *authpb.ConfirmPasswordResetRequest,
) (*authpb.ConfirmPasswordResetResponse, error) {
	// Validate input
	if req.Confirmation == nil {
		return nil, fmt.Errorf("confirmation data is required")
	}
	if req.Confirmation.ResetToken == "" {
		return nil, fmt.Errorf("reset_token is required")
	}
	if req.Confirmation.NewPassword == "" {
		return nil, fmt.Errorf("new_password is required")
	}

	// Validate new password strength
	if err := auth.ValidatePassword(req.Confirmation.NewPassword); err != nil {
		return nil, fmt.Errorf("password validation failed: %w", err)
	}

	// Find user by reset token
	// We need to query the database directly since we don't have the email
	var user struct {
		ID                            int
		Email                         string
		PasswordResetToken            string
		PasswordResetTokenExpiresAt   time.Time
	}

	query := `
		SELECT id, email, password_reset_token, password_reset_token_expires_at
		FROM datifyy_v2_users
		WHERE password_reset_token = $1
	`

	err := s.db.QueryRowContext(ctx, query, req.Confirmation.ResetToken).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordResetToken,
		&user.PasswordResetTokenExpiresAt,
	)

	if err != nil {
		return &authpb.ConfirmPasswordResetResponse{
			Success: false,
			Message: "Invalid reset token",
		}, nil
	}

	// Check if token has expired
	if time.Now().After(user.PasswordResetTokenExpiresAt) {
		return &authpb.ConfirmPasswordResetResponse{
			Success: false,
			Message: "Reset token has expired",
		}, nil
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Confirmation.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password and clear reset token
	updateQuery := `
		UPDATE datifyy_v2_users
		SET password_hash = $1,
		    password_reset_token = NULL,
		    password_reset_token_expires_at = NULL,
		    updated_at = $2
		WHERE id = $3
	`

	_, err = s.db.ExecContext(ctx, updateQuery, string(hashedPassword), time.Now(), user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to reset password: %w", err)
	}

	// Revoke all sessions for security
	revokeQuery := `
		UPDATE datifyy_v2_sessions
		SET is_active = false
		WHERE user_id = $1 AND is_active = true
	`

	_, err = s.db.ExecContext(ctx, revokeQuery, user.ID)
	if err != nil {
		// Log error but don't fail the password reset
		fmt.Printf("Warning: failed to revoke sessions: %v\n", err)
	}

	return &authpb.ConfirmPasswordResetResponse{
		Success: true,
		Message: "Password reset successfully. Please login with your new password.",
	}, nil
}
