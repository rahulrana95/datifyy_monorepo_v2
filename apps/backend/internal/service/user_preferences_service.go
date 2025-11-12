package service

import (
	"context"
	"encoding/json"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// GetPartnerPreferences gets a user's partner preferences
func (s *UserService) GetPartnerPreferences(
	ctx context.Context,
	req *userpb.GetPartnerPreferencesRequest,
) (*userpb.GetPartnerPreferencesResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Get partner preferences from database
	prefs, err := s.profileRepo.GetPartnerPreferences(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.NotFound, "partner preferences not found")
	}

	// Build protobuf response
	pbPrefs := buildPartnerPreferencesFromDB(prefs)

	return &userpb.GetPartnerPreferencesResponse{
		Preferences: pbPrefs,
	}, nil
}

// UpdatePartnerPreferences updates a user's partner preferences
func (s *UserService) UpdatePartnerPreferences(
	ctx context.Context,
	req *userpb.UpdatePartnerPreferencesRequest,
) (*userpb.UpdatePartnerPreferencesResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if req.Preferences == nil {
		return nil, status.Error(codes.InvalidArgument, "preferences is required")
	}

	// Validate age range
	if req.Preferences.AgeRange != nil {
		if req.Preferences.AgeRange.MinAge < 18 {
			return nil, status.Error(codes.InvalidArgument, "minimum age must be at least 18")
		}
		if req.Preferences.AgeRange.MaxAge < req.Preferences.AgeRange.MinAge {
			return nil, status.Error(codes.InvalidArgument, "maximum age must be greater than minimum age")
		}
	}

	// Build update map
	updates := make(map[string]interface{})

	if req.Preferences.AgeRange != nil {
		updates["age_range_min"] = req.Preferences.AgeRange.MinAge
		updates["age_range_max"] = req.Preferences.AgeRange.MaxAge
	}

	if req.Preferences.DistancePreference > 0 {
		updates["distance_preference"] = req.Preferences.DistancePreference
	}

	if req.Preferences.HeightRange != nil {
		updates["height_range_min"] = req.Preferences.HeightRange.MinHeight
		updates["height_range_max"] = req.Preferences.HeightRange.MaxHeight
	}

	if len(req.Preferences.LookingForGender) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.LookingForGender)
		updates["looking_for_gender"] = jsonData
	}

	updates["verified_only"] = req.Preferences.VerifiedOnly

	// Update in database
	err = s.profileRepo.UpdatePartnerPreferences(ctx, userID, updates)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to update partner preferences")
	}

	// Get updated preferences
	prefs, _ := s.profileRepo.GetPartnerPreferences(ctx, userID)
	pbPrefs := buildPartnerPreferencesFromDB(prefs)

	return &userpb.UpdatePartnerPreferencesResponse{
		Preferences: pbPrefs,
		Message:     "Partner preferences updated successfully",
	}, nil
}

// GetUserPreferences gets a user's app preferences
func (s *UserService) GetUserPreferences(
	ctx context.Context,
	req *userpb.GetUserPreferencesRequest,
) (*userpb.GetUserPreferencesResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Get user preferences from database (will create default if not exists)
	prefs, err := s.profileRepo.GetUserPreferences(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get user preferences")
	}

	// Build protobuf response
	pbPrefs := buildUserPreferencesFromDB(prefs)

	return &userpb.GetUserPreferencesResponse{
		Preferences: pbPrefs,
	}, nil
}

// UpdateUserPreferences updates a user's app preferences
func (s *UserService) UpdateUserPreferences(
	ctx context.Context,
	req *userpb.UpdateUserPreferencesRequest,
) (*userpb.UpdateUserPreferencesResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if req.Preferences == nil {
		return nil, status.Error(codes.InvalidArgument, "preferences is required")
	}

	// Build update map
	updates := make(map[string]interface{})

	if req.Preferences.Notifications != nil {
		updates["push_enabled"] = req.Preferences.Notifications.PushEnabled
		updates["email_enabled"] = req.Preferences.Notifications.EmailEnabled
		updates["sms_enabled"] = req.Preferences.Notifications.SmsEnabled
		updates["notify_matches"] = req.Preferences.Notifications.NotifyMatches
		updates["notify_messages"] = req.Preferences.Notifications.NotifyMessages
		updates["notify_likes"] = req.Preferences.Notifications.NotifyLikes
		updates["notify_super_likes"] = req.Preferences.Notifications.NotifySuperLikes
		updates["notify_profile_views"] = req.Preferences.Notifications.NotifyProfileViews
	}

	if req.Preferences.Privacy != nil {
		updates["public_profile"] = req.Preferences.Privacy.PublicProfile
		updates["show_online_status"] = req.Preferences.Privacy.ShowOnlineStatus
		updates["show_distance"] = req.Preferences.Privacy.ShowDistance
		updates["show_age"] = req.Preferences.Privacy.ShowAge
		updates["allow_search_engines"] = req.Preferences.Privacy.AllowSearchEngines
		updates["incognito_mode"] = req.Preferences.Privacy.IncognitoMode
		updates["read_receipts"] = req.Preferences.Privacy.ReadReceipts
	}

	if req.Preferences.Discovery != nil {
		updates["discoverable"] = req.Preferences.Discovery.Discoverable
		updates["global_mode"] = req.Preferences.Discovery.GlobalMode
		updates["verified_only"] = req.Preferences.Discovery.VerifiedOnly
		updates["distance_radius"] = req.Preferences.Discovery.DistanceRadius
		updates["recently_active_days"] = req.Preferences.Discovery.RecentlyActiveDays
	}

	if req.Preferences.AppLanguage != "" {
		updates["app_language"] = req.Preferences.AppLanguage
	}

	if req.Preferences.Theme != "" {
		updates["theme"] = req.Preferences.Theme
	}

	// Update in database
	err = s.profileRepo.UpdateUserPreferences(ctx, userID, updates)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to update user preferences")
	}

	// Get updated preferences
	prefs, _ := s.profileRepo.GetUserPreferences(ctx, userID)
	pbPrefs := buildUserPreferencesFromDB(prefs)

	return &userpb.UpdateUserPreferencesResponse{
		Preferences: pbPrefs,
		Message:     "User preferences updated successfully",
	}, nil
}
