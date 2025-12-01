package service

import (
	"context"
	"database/sql"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetPartnerPreferences_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock partner preferences query with all columns
	prefRows := sqlmock.NewRows([]string{
		"id", "user_id", "looking_for_gender", "age_range_min", "age_range_max",
		"distance_preference", "height_range_min", "height_range_max",
		"relationship_goals", "education_levels", "occupations", "religions",
		"religion_importance", "children_preferences", "drinking_preferences", "smoking_preferences",
		"dietary_preferences", "pet_preferences", "workout_preferences",
		"personality_types", "communication_styles", "love_languages", "political_views", "sleep_schedules",
		"caste_preferences", "sub_caste_preferences", "gotra_preferences", "manglik_preference",
		"mother_tongue_preferences", "ethnicity_preferences", "nationality_preferences", "nri_preference",
		"horoscope_matching_required", "relocation_expectation",
		"body_type_preferences", "complexion_preferences", "hair_color_preferences", "eye_color_preferences",
		"facial_hair_preferences", "tattoo_preference", "piercing_preference", "disability_acceptance",
		"income_preferences", "employment_preferences", "industry_preferences", "min_years_experience",
		"property_preference", "vehicle_preference", "financial_expectation",
		"family_type_preferences", "family_values_preferences", "living_situation_preferences",
		"family_affluence_preferences", "family_location_preferences", "max_siblings",
		"language_preferences", "min_language_proficiency", "location_preferences", "open_to_long_distance",
		"interest_preferences", "min_shared_interests",
		"verified_only", "max_days_inactive", "photos_required", "min_profile_completion",
		"deal_breakers", "must_haves", "custom_dealbreakers",
	}).AddRow(
		1, 1, []byte("[]"), 21, 35,
		50, nil, nil,
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		0, []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"), 0,
		[]byte("[]"), []byte("[]"), []byte("[]"), 0,
		false, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), 0, 0, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"), 0,
		0, 0, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), 0,
		[]byte("[]"), 0, []byte("[]"), false,
		[]byte("[]"), 0,
		false, 30, false, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"),
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WillReturnRows(prefRows)

	req := &userpb.GetPartnerPreferencesRequest{}

	// Act
	resp, err := service.GetPartnerPreferences(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Preferences)
	assert.Equal(t, int32(21), resp.Preferences.AgeRange.MinAge)
	assert.Equal(t, int32(35), resp.Preferences.AgeRange.MaxAge)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdatePartnerPreferences_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock UPSERT (INSERT ... ON CONFLICT)
	mock.ExpectExec("INSERT INTO datifyy_v2_partner_preferences").
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Mock get updated preferences with all columns
	prefRows := sqlmock.NewRows([]string{
		"id", "user_id", "looking_for_gender", "age_range_min", "age_range_max",
		"distance_preference", "height_range_min", "height_range_max",
		"relationship_goals", "education_levels", "occupations", "religions",
		"religion_importance", "children_preferences", "drinking_preferences", "smoking_preferences",
		"dietary_preferences", "pet_preferences", "workout_preferences",
		"personality_types", "communication_styles", "love_languages", "political_views", "sleep_schedules",
		"caste_preferences", "sub_caste_preferences", "gotra_preferences", "manglik_preference",
		"mother_tongue_preferences", "ethnicity_preferences", "nationality_preferences", "nri_preference",
		"horoscope_matching_required", "relocation_expectation",
		"body_type_preferences", "complexion_preferences", "hair_color_preferences", "eye_color_preferences",
		"facial_hair_preferences", "tattoo_preference", "piercing_preference", "disability_acceptance",
		"income_preferences", "employment_preferences", "industry_preferences", "min_years_experience",
		"property_preference", "vehicle_preference", "financial_expectation",
		"family_type_preferences", "family_values_preferences", "living_situation_preferences",
		"family_affluence_preferences", "family_location_preferences", "max_siblings",
		"language_preferences", "min_language_proficiency", "location_preferences", "open_to_long_distance",
		"interest_preferences", "min_shared_interests",
		"verified_only", "max_days_inactive", "photos_required", "min_profile_completion",
		"deal_breakers", "must_haves", "custom_dealbreakers",
	}).AddRow(
		1, 1, []byte("[]"), 25, 40,
		100, nil, nil,
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		0, []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"), 0,
		[]byte("[]"), []byte("[]"), []byte("[]"), 0,
		false, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), 0, 0, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"), 0,
		0, 0, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), 0,
		[]byte("[]"), 0, []byte("[]"), false,
		[]byte("[]"), 0,
		true, 30, false, 0,
		[]byte("[]"), []byte("[]"), []byte("[]"),
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WillReturnRows(prefRows)

	req := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 25,
				MaxAge: 40,
			},
			DistancePreference: 100,
			VerifiedOnly:       true,
		},
	}

	// Act
	resp, err := service.UpdatePartnerPreferences(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Partner preferences updated successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdatePartnerPreferences_InvalidAgeRange(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 15, // Below 18
				MaxAge: 30,
			},
		},
	}

	resp, err := service.UpdatePartnerPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "minimum age must be at least 18")
}

func TestUpdatePartnerPreferences_InvalidAgeOrder(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 40,
				MaxAge: 25, // Max less than min
			},
		},
	}

	resp, err := service.UpdatePartnerPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "maximum age must be greater than minimum age")
}

func TestGetUserPreferences_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock user preferences query
	prefRows := sqlmock.NewRows([]string{
		"id", "user_id", "push_enabled", "email_enabled", "sms_enabled",
		"notify_matches", "notify_messages", "notify_likes", "notify_super_likes",
		"notify_profile_views", "public_profile", "show_online_status", "show_distance",
		"show_age", "allow_search_engines", "incognito_mode", "read_receipts",
		"discoverable", "global_mode", "verified_only", "distance_radius",
		"recently_active_days", "app_language", "theme",
	}).AddRow(
		1, 1, true, true, false, true, true, true, true,
		false, true, true, true, true, false, false, true,
		true, false, false, 50, 7, "en", "light",
	)

	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnRows(prefRows)

	req := &userpb.GetUserPreferencesRequest{}

	// Act
	resp, err := service.GetUserPreferences(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Preferences)
	assert.True(t, resp.Preferences.Notifications.PushEnabled)
	assert.Equal(t, "en", resp.Preferences.AppLanguage)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetUserPreferences_CreatesDefault(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock preferences not found
	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	// Mock insert of default preferences
	prefRows := sqlmock.NewRows([]string{
		"id", "user_id", "push_enabled", "email_enabled", "sms_enabled",
		"notify_matches", "notify_messages", "notify_likes", "notify_super_likes",
		"notify_profile_views", "public_profile", "show_online_status", "show_distance",
		"show_age", "allow_search_engines", "incognito_mode", "read_receipts",
		"discoverable", "global_mode", "verified_only", "distance_radius",
		"recently_active_days", "app_language", "theme",
	}).AddRow(
		1, 1, true, true, false, true, true, true, true,
		false, true, true, true, true, false, false, true,
		true, false, false, 50, 7, "en", "light",
	)

	mock.ExpectQuery("INSERT INTO user_preferences").
		WillReturnRows(prefRows)

	req := &userpb.GetUserPreferencesRequest{}

	// Act
	resp, err := service.GetUserPreferences(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Preferences)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateUserPreferences_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock update
	mock.ExpectExec("UPDATE user_preferences SET").
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Mock get updated preferences
	prefRows := sqlmock.NewRows([]string{
		"id", "user_id", "push_enabled", "email_enabled", "sms_enabled",
		"notify_matches", "notify_messages", "notify_likes", "notify_super_likes",
		"notify_profile_views", "public_profile", "show_online_status", "show_distance",
		"show_age", "allow_search_engines", "incognito_mode", "read_receipts",
		"discoverable", "global_mode", "verified_only", "distance_radius",
		"recently_active_days", "app_language", "theme",
	}).AddRow(
		1, 1, false, true, false, true, true, true, true,
		false, false, false, true, true, false, true, true,
		true, false, false, 50, 7, "es", "dark",
	)

	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnRows(prefRows)

	req := &userpb.UpdateUserPreferencesRequest{
		Preferences: &userpb.UserPreferences{
			Notifications: &userpb.NotificationPreferences{
				PushEnabled: false,
			},
			Privacy: &userpb.PrivacyPreferences{
				PublicProfile:    false,
				ShowOnlineStatus: false,
				IncognitoMode:    true,
			},
			AppLanguage: "es",
			Theme:       "dark",
		},
	}

	// Act
	resp, err := service.UpdateUserPreferences(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "User preferences updated successfully", resp.Message)
	assert.False(t, resp.Preferences.Notifications.PushEnabled)
	assert.Equal(t, "es", resp.Preferences.AppLanguage)
	assert.Equal(t, "dark", resp.Preferences.Theme)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateUserPreferences_MissingPreferences(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UpdateUserPreferencesRequest{
		Preferences: nil,
	}

	resp, err := service.UpdateUserPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "preferences is required")
}

func TestGetPartnerPreferences_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock partner preferences query with error
	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.GetPartnerPreferencesRequest{}

	resp, err := service.GetPartnerPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdatePartnerPreferences_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock UPSERT with error
	mock.ExpectExec("INSERT INTO datifyy_v2_partner_preferences").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 25,
				MaxAge: 40,
			},
		},
	}

	resp, err := service.UpdatePartnerPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetUserPreferences_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock user preferences query with error
	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.GetUserPreferencesRequest{}

	resp, err := service.GetUserPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateUserPreferences_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock update with error
	mock.ExpectExec("UPDATE user_preferences SET").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.UpdateUserPreferencesRequest{
		Preferences: &userpb.UserPreferences{
			Notifications: &userpb.NotificationPreferences{
				PushEnabled: true,
			},
		},
	}

	resp, err := service.UpdateUserPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetPartnerPreferences_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.GetPartnerPreferencesRequest{}

	resp, err := service.GetPartnerPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestGetUserPreferences_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.GetUserPreferencesRequest{}

	resp, err := service.GetUserPreferences(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}
