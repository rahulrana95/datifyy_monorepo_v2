package service

import (
	"context"
	"encoding/json"
	"strconv"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// GetUserProfile gets a user profile by ID
func (s *UserService) GetUserProfile(
	ctx context.Context,
	req *userpb.GetUserProfileRequest,
) (*userpb.GetUserProfileResponse, error) {
	// Validate input
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	// Convert user ID to int
	userID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user_id format")
	}

	// Get user from database
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	// Get profile
	profile, err := s.profileRepo.GetProfileByUserID(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "profile not found")
	}

	// Get photos
	photos, err := s.profileRepo.GetPhotosByUserID(ctx, userID)
	if err != nil {
		// Continue even if photos fail to load
		photos = nil
	}

	// Get partner preferences
	partnerPrefs, err := s.profileRepo.GetPartnerPreferences(ctx, userID)
	if err != nil {
		// Continue even if preferences fail to load
		partnerPrefs = nil
	}

	// Get user preferences
	userPrefs, err := s.profileRepo.GetUserPreferences(ctx, userID)
	if err != nil {
		// Continue even if preferences fail to load
		userPrefs = nil
	}

	// Build protobuf response
	pbProfile, err := buildUserProfileFromDB(user, profile, photos, partnerPrefs, userPrefs)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to build profile")
	}

	return &userpb.GetUserProfileResponse{
		Profile: pbProfile,
	}, nil
}

// GetMyProfile gets the current authenticated user's profile
func (s *UserService) GetMyProfile(
	ctx context.Context,
	req *userpb.GetMyProfileRequest,
) (*userpb.GetMyProfileResponse, error) {
	// TODO: Extract user ID from auth context
	// For now, use a placeholder
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Get user from database
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	// Get profile
	profile, err := s.profileRepo.GetProfileByUserID(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "profile not found")
	}

	// Get photos
	photos, err := s.profileRepo.GetPhotosByUserID(ctx, userID)
	if err != nil {
		photos = nil
	}

	// Get partner preferences
	partnerPrefs, err := s.profileRepo.GetPartnerPreferences(ctx, userID)
	if err != nil {
		partnerPrefs = nil
	}

	// Get user preferences
	userPrefs, err := s.profileRepo.GetUserPreferences(ctx, userID)
	if err != nil {
		userPrefs = nil
	}

	// Build protobuf response
	pbProfile, err := buildUserProfileFromDB(user, profile, photos, partnerPrefs, userPrefs)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to build profile")
	}

	return &userpb.GetMyProfileResponse{
		Profile: pbProfile,
	}, nil
}

// UpdateProfile updates a user's profile
func (s *UserService) UpdateProfile(
	ctx context.Context,
	req *userpb.UpdateProfileRequest,
) (*userpb.UpdateProfileResponse, error) {
	// TODO: Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if len(req.UpdateFields) == 0 {
		return nil, status.Error(codes.InvalidArgument, "update_fields is required")
	}

	// Build update map based on update_fields
	updates := make(map[string]interface{})
	basicInfoUpdates := make(map[string]interface{})

	for _, field := range req.UpdateFields {
		switch field {
		// Basic info fields (stored in users table)
		case "name":
			if req.BasicInfo != nil {
				basicInfoUpdates["name"] = req.BasicInfo.Name
			}
		case "gender":
			if req.BasicInfo != nil {
				basicInfoUpdates["gender"] = req.BasicInfo.Gender.String()
			}
		case "phone_number":
			if req.BasicInfo != nil {
				basicInfoUpdates["phone_number"] = req.BasicInfo.PhoneNumber
			}
		// Profile details fields (stored in user_profiles table)
		case "bio":
			if req.ProfileDetails != nil {
				updates["bio"] = req.ProfileDetails.Bio
			}
		case "company":
			if req.ProfileDetails != nil {
				updates["company"] = req.ProfileDetails.Company
			}
		case "job_title":
			if req.ProfileDetails != nil {
				updates["job_title"] = req.ProfileDetails.JobTitle
			}
		case "school":
			if req.ProfileDetails != nil {
				updates["school"] = req.ProfileDetails.School
			}
		case "height":
			if req.ProfileDetails != nil {
				updates["height"] = req.ProfileDetails.Height
			}
		case "hometown":
			if req.ProfileDetails != nil {
				updates["hometown"] = req.ProfileDetails.Hometown
			}
		case "occupation":
			if req.ProfileDetails != nil && len(req.ProfileDetails.Occupations) > 0 {
				jsonData, _ := json.Marshal(req.ProfileDetails.Occupations)
				updates["occupation"] = jsonData
			}
		case "education":
			if req.ProfileDetails != nil && len(req.ProfileDetails.Education) > 0 {
				jsonData, _ := json.Marshal(req.ProfileDetails.Education)
				updates["education"] = jsonData
			}
		case "interests":
			if req.ProfileDetails != nil && len(req.ProfileDetails.Interests) > 0 {
				jsonData, _ := json.Marshal(req.ProfileDetails.Interests)
				updates["interests"] = jsonData
			}
		case "languages":
			if req.ProfileDetails != nil && len(req.ProfileDetails.Languages) > 0 {
				jsonData, _ := json.Marshal(req.ProfileDetails.Languages)
				updates["languages"] = jsonData
			}
		case "relationship_goals":
			if req.ProfileDetails != nil && len(req.ProfileDetails.RelationshipGoals) > 0 {
				jsonData, _ := json.Marshal(req.ProfileDetails.RelationshipGoals)
				updates["relationship_goals"] = jsonData
			}
		case "location":
			if req.ProfileDetails != nil && req.ProfileDetails.Location != nil {
				jsonData, _ := json.Marshal(req.ProfileDetails.Location)
				updates["location"] = jsonData
			}
		case "prompts":
			if len(req.Prompts) > 0 {
				jsonData, _ := json.Marshal(req.Prompts)
				updates["prompts"] = jsonData
			}
		// Lifestyle fields
		case "drinking":
			if req.LifestyleInfo != nil {
				updates["drinking"] = req.LifestyleInfo.Drinking.String()
			}
		case "smoking":
			if req.LifestyleInfo != nil {
				updates["smoking"] = req.LifestyleInfo.Smoking.String()
			}
		case "workout":
			if req.LifestyleInfo != nil {
				updates["workout"] = req.LifestyleInfo.Workout.String()
			}
		case "dietary_preference":
			if req.LifestyleInfo != nil {
				updates["dietary_preference"] = req.LifestyleInfo.DietaryPreference.String()
			}
		case "religion":
			if req.LifestyleInfo != nil {
				updates["religion"] = req.LifestyleInfo.Religion.String()
			}
		case "religion_importance":
			if req.LifestyleInfo != nil {
				updates["religion_importance"] = req.LifestyleInfo.ReligionImportance.String()
			}
		case "political_view":
			if req.LifestyleInfo != nil {
				updates["political_view"] = req.LifestyleInfo.PoliticalView.String()
			}
		case "pets":
			if req.LifestyleInfo != nil {
				updates["pets"] = req.LifestyleInfo.Pets.String()
			}
		case "children":
			if req.LifestyleInfo != nil {
				updates["children"] = req.LifestyleInfo.Children.String()
			}
		case "personality_type":
			if req.LifestyleInfo != nil {
				updates["personality_type"] = req.LifestyleInfo.PersonalityType
			}
		case "communication_style":
			if req.LifestyleInfo != nil {
				updates["communication_style"] = req.LifestyleInfo.CommunicationStyle.String()
			}
		case "love_language":
			if req.LifestyleInfo != nil {
				updates["love_language"] = req.LifestyleInfo.LoveLanguage.String()
			}
		case "sleep_schedule":
			if req.LifestyleInfo != nil {
				updates["sleep_schedule"] = req.LifestyleInfo.SleepSchedule.String()
			}
		}
	}

	// Update basic info in users table
	if len(basicInfoUpdates) > 0 {
		err = s.userRepo.UpdateBasicInfo(ctx, userID, basicInfoUpdates)
		if err != nil {
			return nil, status.Error(codes.Internal, "failed to update basic info")
		}
	}

	// Update profile in database
	if len(updates) > 0 {
		err = s.profileRepo.UpdateProfile(ctx, userID, updates)
		if err != nil {
			return nil, status.Error(codes.Internal, "failed to update profile")
		}
	}

	// Get updated profile
	user, _ := s.userRepo.GetByID(ctx, userID)
	profile, _ := s.profileRepo.GetProfileByUserID(ctx, userID)
	photos, _ := s.profileRepo.GetPhotosByUserID(ctx, userID)
	partnerPrefs, _ := s.profileRepo.GetPartnerPreferences(ctx, userID)
	userPrefs, _ := s.profileRepo.GetUserPreferences(ctx, userID)

	pbProfile, err := buildUserProfileFromDB(user, profile, photos, partnerPrefs, userPrefs)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to build profile")
	}

	return &userpb.UpdateProfileResponse{
		Profile: pbProfile,
		Message: "Profile updated successfully",
	}, nil
}

// DeleteAccount deletes a user account
func (s *UserService) DeleteAccount(
	ctx context.Context,
	req *userpb.DeleteAccountRequest,
) (*userpb.DeleteAccountResponse, error) {
	// TODO: Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate password
	if req.Password == "" {
		return nil, status.Error(codes.InvalidArgument, "password is required for account deletion")
	}

	// Get user to verify password
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	// Verify password
	if user.PasswordHash.Valid {
		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash.String), []byte(req.Password))
		if err != nil {
			return nil, status.Error(codes.Unauthenticated, "incorrect password")
		}
	}

	// Soft delete: update account status to DELETED
	err = s.userRepo.UpdateAccountStatus(ctx, userID, "DELETED")
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to delete account")
	}

	// TODO: Additional cleanup:
	// - Anonymize user data
	// - Delete photos from storage
	// - Remove from matches
	// - Delete conversations

	return &userpb.DeleteAccountResponse{
		Success: true,
		Message: "Account deleted successfully",
	}, nil
}
