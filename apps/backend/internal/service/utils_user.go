package service

import (
	"fmt"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	"github.com/datifyy/backend/internal/repository"
)

// buildUserProfile creates a UserProfile proto from repository.User
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
