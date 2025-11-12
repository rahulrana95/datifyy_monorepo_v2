package service

import (
	"context"
	"fmt"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/auth"
	"github.com/datifyy/backend/internal/repository"
)

// SendEmailVerification sends email verification code
func (s *AuthService) SendEmailVerification(
	ctx context.Context,
	req *authpb.SendEmailVerificationRequest,
) (*authpb.SendEmailVerificationResponse, error) {
	// Validate email
	if req.Email == "" {
		return nil, fmt.Errorf("email is required")
	}

	if err := auth.ValidateEmail(req.Email); err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	// Check if user exists
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("user not found with email: %s", req.Email)
	}

	// Check if already verified
	if user.EmailVerified {
		return nil, fmt.Errorf("email already verified")
	}

	// Generate verification token
	verificationToken, err := auth.GenerateVerificationToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate verification token: %w", err)
	}

	// Store verification token in database
	expiresAt := time.Now().Add(24 * time.Hour) // 24 hour expiration

	query := `
		UPDATE users
		SET verification_token = $1, verification_token_expires_at = $2
		WHERE id = $3
	`

	_, err = s.db.ExecContext(ctx, query, verificationToken, expiresAt, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to store verification token: %w", err)
	}

	// TODO: Send verification email via email service
	// For now, we just return the token for testing purposes

	return &authpb.SendEmailVerificationResponse{
		Verification: &authpb.VerificationCode{
			Code:      verificationToken,
			ExpiresAt: timeToProto(expiresAt),
			Type:      authpb.VerificationType_VERIFICATION_TYPE_EMAIL,
		},
		Message: fmt.Sprintf("Verification code sent to %s", req.Email),
	}, nil
}

// VerifyEmail verifies email with verification code
func (s *AuthService) VerifyEmail(
	ctx context.Context,
	req *authpb.VerifyEmailRequest,
) (*authpb.VerifyEmailResponse, error) {
	// Validate input
	if req.Verification == nil {
		return nil, fmt.Errorf("verification data is required")
	}

	if req.Verification.Identifier == "" {
		return nil, fmt.Errorf("email is required")
	}

	if req.Verification.Code == "" {
		return nil, fmt.Errorf("verification code is required")
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Verification.Identifier)
	if err != nil {
		return &authpb.VerifyEmailResponse{
			Success: false,
			Message: "Invalid verification code or email",
		}, nil
	}

	// Check if already verified
	if user.EmailVerified {
		return &authpb.VerifyEmailResponse{
			Success: true,
			Message: "Email already verified",
			User:    buildUserProfile(user),
		}, nil
	}

	// Verify the token
	if !user.VerificationToken.Valid || user.VerificationToken.String != req.Verification.Code {
		return &authpb.VerifyEmailResponse{
			Success: false,
			Message: "Invalid verification code",
		}, nil
	}

	// Check if token has expired
	if user.VerificationTokenExpiresAt.Valid && time.Now().After(user.VerificationTokenExpiresAt.Time) {
		return &authpb.VerifyEmailResponse{
			Success: false,
			Message: "Verification code has expired",
		}, nil
	}

	// Update user to mark email as verified
	err = s.userRepo.VerifyEmail(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to verify email: %w", err)
	}

	// Get updated user
	user, err = s.userRepo.GetByID(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated user: %w", err)
	}

	return &authpb.VerifyEmailResponse{
		Success: true,
		Message: "Email verified successfully",
		User:    buildUserProfile(user),
	}, nil
}

// buildUserProfile creates a UserProfile from repository.User
func buildUserProfile(user *repository.User) *authpb.UserProfile {
	userProfile := &authpb.UserProfile{
		UserId:        fmt.Sprintf("%d", user.ID),
		Email:         user.Email,
		Name:          user.Name,
		AccountStatus: accountStatusToProto(user.AccountStatus),
		EmailVerified: emailVerificationStatusToProto(user.EmailVerified),
		CreatedAt:     timeToProto(user.CreatedAt),
	}

	if user.LastLoginAt.Valid {
		userProfile.LastLoginAt = timeToProto(user.LastLoginAt.Time)
	}

	return userProfile
}
