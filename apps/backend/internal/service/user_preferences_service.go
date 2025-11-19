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

	// Basic Preferences
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

	// Relationship & Lifestyle Preferences
	if len(req.Preferences.RelationshipGoals) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.RelationshipGoals)
		updates["relationship_goals"] = jsonData
	}

	if len(req.Preferences.EducationLevels) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.EducationLevels)
		updates["education_levels"] = jsonData
	}

	if len(req.Preferences.Occupations) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.Occupations)
		updates["occupations"] = jsonData
	}

	if len(req.Preferences.Religions) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.Religions)
		updates["religions"] = jsonData
	}

	updates["religion_importance"] = int32(req.Preferences.ReligionImportance)

	if len(req.Preferences.ChildrenPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.ChildrenPreferences)
		updates["children_preferences"] = jsonData
	}

	if len(req.Preferences.DrinkingPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.DrinkingPreferences)
		updates["drinking_preferences"] = jsonData
	}

	if len(req.Preferences.SmokingPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.SmokingPreferences)
		updates["smoking_preferences"] = jsonData
	}

	if len(req.Preferences.DietaryPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.DietaryPreferences)
		updates["dietary_preferences"] = jsonData
	}

	if len(req.Preferences.PetPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.PetPreferences)
		updates["pet_preferences"] = jsonData
	}

	if len(req.Preferences.WorkoutPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.WorkoutPreferences)
		updates["workout_preferences"] = jsonData
	}

	// Personality & Communication Preferences
	if len(req.Preferences.PersonalityTypes) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.PersonalityTypes)
		updates["personality_types"] = jsonData
	}

	if len(req.Preferences.CommunicationStyles) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.CommunicationStyles)
		updates["communication_styles"] = jsonData
	}

	if len(req.Preferences.LoveLanguages) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.LoveLanguages)
		updates["love_languages"] = jsonData
	}

	if len(req.Preferences.PoliticalViews) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.PoliticalViews)
		updates["political_views"] = jsonData
	}

	if len(req.Preferences.SleepSchedules) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.SleepSchedules)
		updates["sleep_schedules"] = jsonData
	}

	// Cultural & Matrimonial Preferences (India-specific + Global)
	if len(req.Preferences.CastePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.CastePreferences)
		updates["caste_preferences"] = jsonData
	}

	if len(req.Preferences.SubCastePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.SubCastePreferences)
		updates["sub_caste_preferences"] = jsonData
	}

	if len(req.Preferences.GotraPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.GotraPreferences)
		updates["gotra_preferences"] = jsonData
	}

	updates["manglik_preference"] = int32(req.Preferences.ManglikPreference)

	if len(req.Preferences.MotherTonguePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.MotherTonguePreferences)
		updates["mother_tongue_preferences"] = jsonData
	}

	if len(req.Preferences.EthnicityPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.EthnicityPreferences)
		updates["ethnicity_preferences"] = jsonData
	}

	if len(req.Preferences.NationalityPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.NationalityPreferences)
		updates["nationality_preferences"] = jsonData
	}

	updates["nri_preference"] = int32(req.Preferences.NriPreference)
	updates["horoscope_matching_required"] = req.Preferences.HoroscopeMatchingRequired
	updates["relocation_expectation"] = int32(req.Preferences.RelocationExpectation)

	// Appearance Preferences
	if len(req.Preferences.BodyTypePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.BodyTypePreferences)
		updates["body_type_preferences"] = jsonData
	}

	if len(req.Preferences.ComplexionPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.ComplexionPreferences)
		updates["complexion_preferences"] = jsonData
	}

	if len(req.Preferences.HairColorPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.HairColorPreferences)
		updates["hair_color_preferences"] = jsonData
	}

	if len(req.Preferences.EyeColorPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.EyeColorPreferences)
		updates["eye_color_preferences"] = jsonData
	}

	if len(req.Preferences.FacialHairPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.FacialHairPreferences)
		updates["facial_hair_preferences"] = jsonData
	}

	updates["tattoo_preference"] = int32(req.Preferences.TattooPreference)
	updates["piercing_preference"] = int32(req.Preferences.PiercingPreference)
	updates["disability_acceptance"] = int32(req.Preferences.DisabilityAcceptance)

	// Professional & Financial Preferences
	if len(req.Preferences.IncomePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.IncomePreferences)
		updates["income_preferences"] = jsonData
	}

	if len(req.Preferences.EmploymentPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.EmploymentPreferences)
		updates["employment_preferences"] = jsonData
	}

	if len(req.Preferences.IndustryPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.IndustryPreferences)
		updates["industry_preferences"] = jsonData
	}

	updates["min_years_experience"] = req.Preferences.MinYearsExperience
	updates["property_preference"] = int32(req.Preferences.PropertyPreference)
	updates["vehicle_preference"] = int32(req.Preferences.VehiclePreference)
	updates["financial_expectation"] = int32(req.Preferences.FinancialExpectation)

	// Family Background Preferences
	if len(req.Preferences.FamilyTypePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.FamilyTypePreferences)
		updates["family_type_preferences"] = jsonData
	}

	if len(req.Preferences.FamilyValuesPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.FamilyValuesPreferences)
		updates["family_values_preferences"] = jsonData
	}

	if len(req.Preferences.LivingSituationPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.LivingSituationPreferences)
		updates["living_situation_preferences"] = jsonData
	}

	if len(req.Preferences.FamilyAffluencePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.FamilyAffluencePreferences)
		updates["family_affluence_preferences"] = jsonData
	}

	if len(req.Preferences.FamilyLocationPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.FamilyLocationPreferences)
		updates["family_location_preferences"] = jsonData
	}

	updates["max_siblings"] = req.Preferences.MaxSiblings

	// Language & Location Preferences
	if len(req.Preferences.LanguagePreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.LanguagePreferences)
		updates["language_preferences"] = jsonData
	}

	updates["min_language_proficiency"] = int32(req.Preferences.MinLanguageProficiency)

	if len(req.Preferences.LocationPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.LocationPreferences)
		updates["location_preferences"] = jsonData
	}

	updates["open_to_long_distance"] = req.Preferences.OpenToLongDistance

	// Interest & Hobby Preferences
	if len(req.Preferences.InterestPreferences) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.InterestPreferences)
		updates["interest_preferences"] = jsonData
	}

	updates["min_shared_interests"] = req.Preferences.MinSharedInterests

	// Deal-Breakers & Must-Haves
	updates["max_days_inactive"] = req.Preferences.MaxDaysInactive
	updates["photos_required"] = req.Preferences.PhotosRequired
	updates["min_profile_completion"] = req.Preferences.MinProfileCompletion

	if len(req.Preferences.DealBreakers) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.DealBreakers)
		updates["deal_breakers"] = jsonData
	}

	if len(req.Preferences.MustHaves) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.MustHaves)
		updates["must_haves"] = jsonData
	}

	if len(req.Preferences.CustomDealbreakers) > 0 {
		jsonData, _ := json.Marshal(req.Preferences.CustomDealbreakers)
		updates["custom_dealbreakers"] = jsonData
	}

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
