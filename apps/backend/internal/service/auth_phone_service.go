package service

import (
	"context"
	"fmt"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/auth"
)

// RegisterWithPhone registers a new user with phone number
// Sends OTP for verification
func (s *AuthService) RegisterWithPhone(
	ctx context.Context,
	req *authpb.RegisterWithPhoneRequest,
) (*authpb.RegisterWithPhoneResponse, error) {
	// Validate phone number
	if req.PhoneNumber == "" {
		return nil, fmt.Errorf("phone_number is required")
	}

	// TODO: Add phone number validation
	// For now, basic check
	if len(req.PhoneNumber) < 10 {
		return nil, fmt.Errorf("invalid phone number format")
	}

	// Check if phone number already exists
	var existingUserID int
	checkQuery := `SELECT id FROM users WHERE phone_number = $1`
	err := s.db.QueryRowContext(ctx, checkQuery, req.PhoneNumber).Scan(&existingUserID)
	if err == nil {
		return nil, fmt.Errorf("phone number already registered")
	}

	// Generate OTP code
	otpCode, err := auth.GenerateOTPCode()
	if err != nil {
		return nil, fmt.Errorf("failed to generate OTP: %w", err)
	}

	// Store OTP with expiration (5 minutes)
	expiresAt := time.Now().Add(5 * time.Minute)

	// For phone registration, we store the OTP temporarily
	// We'll use Redis or a temporary table for this
	// For now, return the OTP for testing (in production, send via SMS)

	// TODO: Send OTP via SMS service
	// TODO: Store OTP in Redis or temp table keyed by phone number
	_ = otpCode // Suppress unused variable warning - would be sent via SMS

	return &authpb.RegisterWithPhoneResponse{
		Verification: &authpb.VerificationCode{
			Code:      otpCode, // For testing only - remove in production
			ExpiresAt: timeToProto(expiresAt),
			Type:      authpb.VerificationType_VERIFICATION_TYPE_PHONE,
		},
		TempUserId: "", // TODO: Generate temp user ID if needed
		Message:    fmt.Sprintf("OTP sent to %s", req.PhoneNumber),
	}, nil
}

// RequestPhoneOTP requests OTP for phone login
func (s *AuthService) RequestPhoneOTP(
	ctx context.Context,
	req *authpb.RequestPhoneOTPRequest,
) (*authpb.RequestPhoneOTPResponse, error) {
	// Validate phone number
	if req.PhoneNumber == "" {
		return nil, fmt.Errorf("phone_number is required")
	}

	// Check if user exists with this phone number
	var userID int
	var phoneVerified bool
	checkQuery := `SELECT id, phone_verified FROM users WHERE phone_number = $1`
	err := s.db.QueryRowContext(ctx, checkQuery, req.PhoneNumber).Scan(&userID, &phoneVerified)
	if err != nil {
		// For security, don't reveal if phone exists
		// Return success even if user doesn't exist
		return &authpb.RequestPhoneOTPResponse{
			Verification: &authpb.VerificationCode{
				Code:      "000000", // Placeholder - not sent
				ExpiresAt: timeToProto(time.Now().Add(5 * time.Minute)),
				Type:      authpb.VerificationType_VERIFICATION_TYPE_PHONE,
			},
			Message: fmt.Sprintf("If the phone number is registered, an OTP has been sent to %s", req.PhoneNumber),
		}, nil
	}

	// Generate OTP code
	otpCode, err := auth.GenerateOTPCode()
	if err != nil {
		return nil, fmt.Errorf("failed to generate OTP: %w", err)
	}

	// Store OTP with expiration (5 minutes)
	expiresAt := time.Now().Add(5 * time.Minute)

	// TODO: Store OTP in Redis keyed by phone number
	// TODO: Send OTP via SMS service
	_ = otpCode // Suppress unused variable warning

	return &authpb.RequestPhoneOTPResponse{
		Verification: &authpb.VerificationCode{
			Code:      otpCode, // For testing only
			ExpiresAt: timeToProto(expiresAt),
			Type:      authpb.VerificationType_VERIFICATION_TYPE_PHONE,
		},
		Message: fmt.Sprintf("OTP sent to %s", req.PhoneNumber),
	}, nil
}

// LoginWithPhone logs in user with phone number and OTP
func (s *AuthService) LoginWithPhone(
	ctx context.Context,
	req *authpb.LoginWithPhoneRequest,
) (*authpb.LoginWithPhoneResponse, error) {
	// Validate input
	if req.Credentials == nil {
		return nil, fmt.Errorf("credentials are required")
	}
	if req.Credentials.PhoneNumber == "" {
		return nil, fmt.Errorf("phone_number is required")
	}
	if req.Credentials.OtpCode == "" {
		return nil, fmt.Errorf("otp_code is required")
	}

	// Get user by phone number
	// TODO: Add GetByPhoneNumber to repository
	// For now, query directly
	var userID int
	var email string
	var name string
	var phoneVerified bool
	var accountStatus string
	query := `SELECT id, email, name, phone_verified, account_status FROM users WHERE phone_number = $1`
	err := s.db.QueryRowContext(ctx, query, req.Credentials.PhoneNumber).Scan(&userID, &email, &name, &phoneVerified, &accountStatus)
	if err != nil {
		return nil, fmt.Errorf("invalid phone number or OTP")
	}

	// Get full user details
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details")
	}

	// TODO: Verify OTP from Redis
	// For now, we'll accept any 6-digit OTP for testing
	// In production, verify against stored OTP

	// Check if phone is verified
	if !user.PhoneVerified {
		return nil, fmt.Errorf("phone number not verified")
	}

	// Check account status
	if user.AccountStatus != "active" {
		return nil, fmt.Errorf("account is %s", user.AccountStatus)
	}

	// Update last login
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log error but don't fail login
		fmt.Printf("Warning: failed to update last login: %v\n", err)
	}

	// Create session and tokens
	tokens, session, err := s.createSessionAndTokens(ctx, user, req.Credentials.DeviceInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Build user profile
	userProfile := buildUserProfile(user)

	return &authpb.LoginWithPhoneResponse{
		User:    userProfile,
		Tokens:  tokens,
		Session: session,
	}, nil
}

// SendPhoneVerification sends OTP to verify phone number
func (s *AuthService) SendPhoneVerification(
	ctx context.Context,
	req *authpb.SendPhoneVerificationRequest,
) (*authpb.SendPhoneVerificationResponse, error) {
	// Validate phone number
	if req.PhoneNumber == "" {
		return nil, fmt.Errorf("phone_number is required")
	}

	// Check if user exists with this phone
	// TODO: Add GetByPhoneNumber to repository
	var userID int
	var phoneVerified bool
	query := `SELECT id, phone_verified FROM users WHERE phone_number = $1`
	err := s.db.QueryRowContext(ctx, query, req.PhoneNumber).Scan(&userID, &phoneVerified)
	if err != nil {
		return nil, fmt.Errorf("user not found with phone number: %s", req.PhoneNumber)
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details")
	}

	// Check if already verified
	if user.PhoneVerified {
		return nil, fmt.Errorf("phone number already verified")
	}

	// Generate OTP code
	otpCode, err := auth.GenerateOTPCode()
	if err != nil {
		return nil, fmt.Errorf("failed to generate OTP: %w", err)
	}

	// Store OTP with expiration (5 minutes)
	expiresAt := time.Now().Add(5 * time.Minute)

	// TODO: Store OTP in Redis keyed by phone number
	// TODO: Send OTP via SMS service

	return &authpb.SendPhoneVerificationResponse{
		Verification: &authpb.VerificationCode{
			Code:      otpCode, // For testing - remove in production
			ExpiresAt: timeToProto(expiresAt),
			Type:      authpb.VerificationType_VERIFICATION_TYPE_PHONE,
		},
		Message: fmt.Sprintf("Verification code sent to %s", req.PhoneNumber),
	}, nil
}

// VerifyPhone verifies phone number with OTP
func (s *AuthService) VerifyPhone(
	ctx context.Context,
	req *authpb.VerifyPhoneRequest,
) (*authpb.VerifyPhoneResponse, error) {
	// Validate input
	if req.Verification == nil {
		return nil, fmt.Errorf("verification data is required")
	}

	if req.Verification.Identifier == "" {
		return nil, fmt.Errorf("phone number is required")
	}

	if req.Verification.Code == "" {
		return nil, fmt.Errorf("verification code is required")
	}

	// Get user by phone number
	// TODO: Add GetByPhoneNumber to repository
	var userID int
	var phoneVerified bool
	query := `SELECT id, phone_verified FROM users WHERE phone_number = $1`
	err := s.db.QueryRowContext(ctx, query, req.Verification.Identifier).Scan(&userID, &phoneVerified)
	if err != nil {
		return &authpb.VerifyPhoneResponse{
			Success: false,
			Message: "Invalid verification code or phone number",
		}, nil
	}

	// Get full user details
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return &authpb.VerifyPhoneResponse{
			Success: false,
			Message: "Invalid verification code or phone number",
		}, nil
	}

	// Check if already verified
	if user.PhoneVerified {
		return &authpb.VerifyPhoneResponse{
			Success: true,
			Message: "Phone number already verified",
			User:    buildUserProfile(user),
		}, nil
	}

	// TODO: Verify OTP from Redis
	// For now, accept any 6-digit code for testing
	// In production, verify against stored OTP

	// Mark phone as verified
	// TODO: Add VerifyPhone to repository
	updateQuery := `UPDATE users SET phone_verified = true WHERE id = $1`
	_, err = s.db.ExecContext(ctx, updateQuery, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to verify phone: %w", err)
	}

	// Get updated user
	user, err = s.userRepo.GetByID(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated user: %w", err)
	}

	return &authpb.VerifyPhoneResponse{
		Success: true,
		Message: "Phone number verified successfully",
		User:    buildUserProfile(user),
	}, nil
}
