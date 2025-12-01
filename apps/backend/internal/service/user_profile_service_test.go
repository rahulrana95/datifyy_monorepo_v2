package service

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestUserService creates a test user service with a mock database
func setupTestUserService(t *testing.T) (*UserService, sqlmock.Sqlmock, *sql.DB) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)

	service := NewUserService(db, nil)
	return service, mock, db
}

func TestGetUserProfile_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()
	now := time.Now()

	// Mock user query
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, "MALE",
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(1).
		WillReturnRows(userRows)

	// Mock profile query
	profileRows := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		1, 1, "Bio", []byte("[]"), "Company", "Engineer", []byte("[]"),
		"School", 180, []byte("{}"), "Hometown", []byte("[]"), []byte("[]"),
		[]byte("[]"), "NEVER", "NEVER", "OFTEN", "VEGETARIAN",
		"HINDU", "IMPORTANT", "MODERATE", "DOG_LOVER", "DONT_HAVE_WANT",
		"INTJ", "BIG_TIME_TEXTER", "QUALITY_TIME", "EARLY_BIRD",
		[]byte("[]"), 75, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WithArgs(1).
		WillReturnRows(profileRows)

	// Mock photos query
	photoRows := sqlmock.NewRows([]string{
		"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order",
		"is_primary", "caption", "uploaded_at",
	})

	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WithArgs(1).
		WillReturnRows(photoRows)

	// Mock partner preferences query
	prefRows := sqlmock.NewRows([]string{
		"id", "user_id", "looking_for_gender", "age_range_min", "age_range_max",
		"distance_preference", "height_range_min", "height_range_max",
		"relationship_goals", "education_levels", "occupations", "religions",
		"children_preferences", "drinking_preferences", "smoking_preferences",
		"dietary_preferences", "pet_preferences", "verified_only", "dealbreakers",
	}).AddRow(
		1, 1, []byte("[]"), 21, 35, 50, nil, nil,
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), false, []byte("[]"),
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WithArgs(1).
		WillReturnRows(prefRows)

	// Mock user preferences query - will create default if not exists
	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	// Mock insert of default preferences
	userPrefRows := sqlmock.NewRows([]string{
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
		WithArgs(1).
		WillReturnRows(userPrefRows)

	req := &userpb.GetUserProfileRequest{
		UserId: "1",
	}

	// Act
	resp, err := service.GetUserProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "1", resp.Profile.UserId)
	assert.Equal(t, "test@example.com", resp.Profile.BasicInfo.Email)
	assert.Equal(t, "Test User", resp.Profile.BasicInfo.Name)
	assert.Equal(t, int32(75), resp.Profile.CompletionPercentage)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetUserProfile_InvalidUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()
	req := &userpb.GetUserProfileRequest{
		UserId: "",
	}

	resp, err := service.GetUserProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user_id is required")
}

func TestGetUserProfile_UserNotFound(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	req := &userpb.GetUserProfileRequest{
		UserId: "1",
	}

	resp, err := service.GetUserProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetMyProfile_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock user query
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, "MALE",
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(1).
		WillReturnRows(userRows)

	// Mock profile query
	profileRows := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		1, 1, "Bio", []byte("[]"), "Company", "Engineer", []byte("[]"),
		"School", 180, []byte("{}"), "Hometown", []byte("[]"), []byte("[]"),
		[]byte("[]"), "NEVER", "NEVER", "OFTEN", "VEGETARIAN",
		"HINDU", "IMPORTANT", "MODERATE", "DOG_LOVER", "DONT_HAVE_WANT",
		"INTJ", "BIG_TIME_TEXTER", "QUALITY_TIME", "EARLY_BIRD",
		[]byte("[]"), 75, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WithArgs(1).
		WillReturnRows(profileRows)

	// Mock photos query
	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order",
			"is_primary", "caption", "uploaded_at",
		}))

	// Mock partner preferences query
	partnerPrefRows := sqlmock.NewRows([]string{
		"id", "user_id", "looking_for_gender", "age_range_min", "age_range_max",
		"distance_preference", "height_range_min", "height_range_max",
		"relationship_goals", "education_levels", "occupations", "religions",
		"children_preferences", "drinking_preferences", "smoking_preferences",
		"dietary_preferences", "pet_preferences", "verified_only", "dealbreakers",
	}).AddRow(
		1, 1, []byte("[]"), 21, 35, 50, nil, nil,
		[]byte("[]"), []byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), []byte("[]"),
		[]byte("[]"), []byte("[]"), false, []byte("[]"),
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WithArgs(1).
		WillReturnRows(partnerPrefRows)

	// Mock user preferences query
	userPrefRows := sqlmock.NewRows([]string{
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
		WithArgs(1).
		WillReturnRows(userPrefRows)

	req := &userpb.GetMyProfileRequest{}

	// Act
	resp, err := service.GetMyProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "1", resp.Profile.UserId)
	assert.Equal(t, "test@example.com", resp.Profile.BasicInfo.Email)
	assert.Equal(t, "Test User", resp.Profile.BasicInfo.Name)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetMyProfile_NotAuthenticated(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.GetMyProfileRequest{}

	resp, err := service.GetMyProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestGetMyProfile_UserNotFound(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 999)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(999).
		WillReturnError(sql.ErrNoRows)

	req := &userpb.GetMyProfileRequest{}

	resp, err := service.GetMyProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateProfile_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	// Mock auth context with userID
	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock profile update
	mock.ExpectExec("UPDATE datifyy_v2_user_profiles SET").
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Mock getting updated profile
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WillReturnRows(userRows)

	profileRows := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		1, 1, "Updated bio", []byte("[]"), "New Company", "Engineer", []byte("[]"),
		"School", 180, []byte("{}"), "Hometown", []byte("[]"), []byte("[]"),
		[]byte("[]"), nil, nil, nil, nil,
		nil, nil, nil, nil, nil,
		nil, nil, nil, nil,
		[]byte("[]"), 80, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WillReturnRows(profileRows)

	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order", "is_primary", "caption", "uploaded_at"}))

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	mock.ExpectQuery("INSERT INTO user_preferences").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "user_id", "push_enabled", "email_enabled", "sms_enabled",
			"notify_matches", "notify_messages", "notify_likes", "notify_super_likes",
			"notify_profile_views", "public_profile", "show_online_status", "show_distance",
			"show_age", "allow_search_engines", "incognito_mode", "read_receipts",
			"discoverable", "global_mode", "verified_only", "distance_radius",
			"recently_active_days", "app_language", "theme",
		}).AddRow(1, 1, true, true, false, true, true, true, true, false, true, true, true, true, false, false, true, true, false, false, 50, 7, "en", "light"))

	req := &userpb.UpdateProfileRequest{
		ProfileDetails: &userpb.ProfileDetails{
			Bio:     "Updated bio",
			Company: "New Company",
		},
		UpdateFields: []string{"bio", "company"},
	}

	// Act
	resp, err := service.UpdateProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Profile updated successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateProfile_NoFieldsToUpdate(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	// Mock auth context with userID
	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UpdateProfileRequest{
		UpdateFields: []string{},
	}

	resp, err := service.UpdateProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "update_fields is required")
}

func TestUpdateProfile_AllProfileFields(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock profile update with all fields
	mock.ExpectExec("UPDATE datifyy_v2_user_profiles SET").
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Mock getting updated profile
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WillReturnRows(userRows)

	profileRows := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		1, 1, "Updated bio", []byte("[]"), "New Company", "Senior Engineer", []byte("[]"),
		"MIT", 175, []byte("{}"), "Boston", []byte("[]"), []byte("[]"),
		[]byte("[]"), nil, nil, nil, nil,
		nil, nil, nil, nil, nil,
		nil, nil, nil, nil,
		[]byte("[]"), 80, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WillReturnRows(profileRows)

	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order", "is_primary", "caption", "uploaded_at"}))

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	mock.ExpectQuery("INSERT INTO user_preferences").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "user_id", "push_enabled", "email_enabled", "sms_enabled",
			"notify_matches", "notify_messages", "notify_likes", "notify_super_likes",
			"notify_profile_views", "public_profile", "show_online_status", "show_distance",
			"show_age", "allow_search_engines", "incognito_mode", "read_receipts",
			"discoverable", "global_mode", "verified_only", "distance_radius",
			"recently_active_days", "app_language", "theme",
		}).AddRow(1, 1, true, true, false, true, true, true, true, false, true, true, true, true, false, false, true, true, false, false, 50, 7, "en", "light"))

	req := &userpb.UpdateProfileRequest{
		ProfileDetails: &userpb.ProfileDetails{
			Bio:       "Updated bio",
			Company:   "New Company",
			JobTitle:  "Senior Engineer",
			School:    "MIT",
			Height:    175,
			Hometown:  "Boston",
		},
		UpdateFields: []string{
			"bio", "company", "job_title", "school", "height", "hometown",
		},
	}

	resp, err := service.UpdateProfile(ctx, req)

	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Profile updated successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateProfile_AllLifestyleFields(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock profile update
	mock.ExpectExec("UPDATE datifyy_v2_user_profiles SET").
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Mock getting updated profile
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WillReturnRows(userRows)

	profileRows := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		1, 1, "Bio", []byte("[]"), "Company", "Engineer", []byte("[]"),
		"School", 180, []byte("{}"), "Hometown", []byte("[]"), []byte("[]"),
		[]byte("[]"), "RARELY", "NEVER", "OFTEN", "VEGETARIAN",
		"HINDU", "IMPORTANT", "MODERATE", "DOG_LOVER", "DONT_HAVE_WANT",
		"INTJ", "BIG_TIME_TEXTER", "QUALITY_TIME", "EARLY_BIRD",
		[]byte("[]"), 75, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WillReturnRows(profileRows)

	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order", "is_primary", "caption", "uploaded_at"}))

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_partner_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	mock.ExpectQuery("SELECT (.+) FROM user_preferences WHERE user_id").
		WillReturnError(sql.ErrNoRows)

	mock.ExpectQuery("INSERT INTO user_preferences").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "user_id", "push_enabled", "email_enabled", "sms_enabled",
			"notify_matches", "notify_messages", "notify_likes", "notify_super_likes",
			"notify_profile_views", "public_profile", "show_online_status", "show_distance",
			"show_age", "allow_search_engines", "incognito_mode", "read_receipts",
			"discoverable", "global_mode", "verified_only", "distance_radius",
			"recently_active_days", "app_language", "theme",
		}).AddRow(1, 1, true, true, false, true, true, true, true, false, true, true, true, true, false, false, true, true, false, false, 50, 7, "en", "light"))

	req := &userpb.UpdateProfileRequest{
		LifestyleInfo: &userpb.LifestyleInfo{
			Drinking:             userpb.DrinkingHabit_DRINKING_RARELY,
			Smoking:              userpb.SmokingHabit_SMOKING_NEVER,
			Workout:              userpb.WorkoutFrequency_WORKOUT_OFTEN,
			DietaryPreference:    userpb.DietaryPreference_DIETARY_VEGETARIAN,
			Religion:             userpb.Religion_RELIGION_HINDU,
			ReligionImportance:   userpb.Importance_IMPORTANCE_IMPORTANT,
			PersonalityType:      "INTJ",
		},
		UpdateFields: []string{
			"drinking", "smoking", "workout", "dietary_preference",
			"religion", "religion_importance", "personality_type",
		},
	}

	resp, err := service.UpdateProfile(ctx, req)

	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Profile updated successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateProfile_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.UpdateProfileRequest{
		ProfileDetails: &userpb.ProfileDetails{
			Bio: "Test",
		},
		UpdateFields: []string{"bio"},
	}

	resp, err := service.UpdateProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestUpdateProfile_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock profile update with error
	mock.ExpectExec("UPDATE datifyy_v2_user_profiles SET").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.UpdateProfileRequest{
		ProfileDetails: &userpb.ProfileDetails{
			Bio: "Test bio",
		},
		UpdateFields: []string{"bio"},
	}

	resp, err := service.UpdateProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "failed to update profile")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteAccount_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	// Mock auth context with userID
	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock get user for password verification
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "$2a$10$.octbgELZUY9TsiuSzjkZ.y0mPATEgf.5MT.1qhZn8veSt.VdedE.", nil, // bcrypt hash of "password"
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(1).
		WillReturnRows(userRows)

	// Mock update account status
	mock.ExpectExec("UPDATE datifyy_v2_users SET account_status").
		WithArgs("DELETED", 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	req := &userpb.DeleteAccountRequest{
		Password: "password",
	}

	// Act
	resp, err := service.DeleteAccount(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.True(t, resp.Success)
	assert.Equal(t, "Account deleted successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteAccount_MissingPassword(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	// Mock auth context with userID
	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.DeleteAccountRequest{
		Password: "",
	}

	resp, err := service.DeleteAccount(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "password is required")
}

func TestDeleteAccount_IncorrectPassword(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	// Mock auth context with userID
	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock get user
	userRows := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		1, "test@example.com", "Test User", "$2a$10$.octbgELZUY9TsiuSzjkZ.y0mPATEgf.5MT.1qhZn8veSt.VdedE.", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(1).
		WillReturnRows(userRows)

	req := &userpb.DeleteAccountRequest{
		Password: "wrongpassword",
	}

	resp, err := service.DeleteAccount(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "incorrect password")
	assert.NoError(t, mock.ExpectationsWereMet())
}
