// +build integration

package tests

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/service"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupIntegrationTest sets up a test database connection
func setupIntegrationTest(t *testing.T) (*sql.DB, func()) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	require.NoError(t, err)

	// Test connection
	err = db.Ping()
	require.NoError(t, err)

	// Cleanup function
	cleanup := func() {
		// Clean up test data
		db.Exec("DELETE FROM user_blocks WHERE blocker_user_id > 1000")
		db.Exec("DELETE FROM user_reports WHERE reporter_user_id > 1000")
		db.Exec("DELETE FROM user_photos WHERE user_id > 1000")
		db.Exec("DELETE FROM user_preferences WHERE user_id > 1000")
		db.Exec("DELETE FROM partner_preferences WHERE user_id > 1000")
		db.Exec("DELETE FROM user_profiles WHERE user_id > 1000")
		db.Exec("DELETE FROM users WHERE id > 1000")
		db.Close()
	}

	return db, cleanup
}

// createTestUser creates a test user in the database
func createTestUser(t *testing.T, db *sql.DB, email string) int {
	var userID int
	err := db.QueryRow(`
		INSERT INTO users (email, name, password_hash, email_verified, account_status, created_at, updated_at)
		VALUES ($1, $2, $3, true, 'ACTIVE', NOW(), NOW())
		RETURNING id
	`, email, "Test User", "hash").Scan(&userID)
	require.NoError(t, err)

	// Create profile
	_, err = db.Exec(`
		INSERT INTO user_profiles (user_id, completion_percentage, is_public, is_verified)
		VALUES ($1, 50, true, false)
	`, userID)
	require.NoError(t, err)

	// Create partner preferences
	_, err = db.Exec(`
		INSERT INTO partner_preferences (user_id, age_range_min, age_range_max, distance_preference)
		VALUES ($1, 21, 35, 50)
	`, userID)
	require.NoError(t, err)

	return userID
}

func TestIntegration_GetUserProfile(t *testing.T) {
	db, cleanup := setupIntegrationTest(t)
	defer cleanup()

	// Create test user
	userID := createTestUser(t, db, fmt.Sprintf("integration-%d@example.com", time.Now().Unix()))

	// Create service
	userService := service.NewUserService(db, nil)

	ctx := context.Background()
	req := &userpb.GetUserProfileRequest{
		UserId: fmt.Sprintf("%d", userID),
	}

	// Act
	resp, err := userService.GetUserProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, fmt.Sprintf("%d", userID), resp.Profile.UserId)
	assert.Equal(t, "Test User", resp.Profile.BasicInfo.Name)
	assert.Equal(t, int32(50), resp.Profile.CompletionPercentage)
}

func TestIntegration_UpdateProfile(t *testing.T) {
	db, cleanup := setupIntegrationTest(t)
	defer cleanup()

	// Create test user
	userID := createTestUser(t, db, fmt.Sprintf("integration-%d@example.com", time.Now().Unix()))

	// Create service
	userService := service.NewUserService(db, nil)

	// Mock auth context with userID (in real implementation, this would come from JWT)
	ctx := context.WithValue(context.Background(), "userID", userID)

	req := &userpb.UpdateProfileRequest{
		ProfileDetails: &userpb.ProfileDetails{
			Bio:     "Updated bio from integration test",
			Company: "Test Company",
			Height:  180,
		},
		UpdateFields: []string{"bio", "company", "height"},
	}

	// Act
	resp, err := userService.UpdateProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Profile updated successfully", resp.Message)

	// Verify update in database
	var bio, company sql.NullString
	var height sql.NullInt32
	err = db.QueryRow(`
		SELECT bio, company, height
		FROM user_profiles
		WHERE user_id = $1
	`, userID).Scan(&bio, &company, &height)

	require.NoError(t, err)
	assert.True(t, bio.Valid)
	assert.Equal(t, "Updated bio from integration test", bio.String)
	assert.True(t, company.Valid)
	assert.Equal(t, "Test Company", company.String)
	assert.True(t, height.Valid)
	assert.Equal(t, int32(180), height.Int32)
}

func TestIntegration_BlockAndUnblockUser(t *testing.T) {
	db, cleanup := setupIntegrationTest(t)
	defer cleanup()

	// Create two test users
	userID1 := createTestUser(t, db, fmt.Sprintf("blocker-%d@example.com", time.Now().Unix()))
	userID2 := createTestUser(t, db, fmt.Sprintf("blocked-%d@example.com", time.Now().Unix()))

	// Create service
	userService := service.NewUserService(db, nil)

	// Mock auth context
	ctx := context.WithValue(context.Background(), "userID", userID1)

	// Test blocking
	blockReq := &userpb.BlockUserRequest{
		UserId: fmt.Sprintf("%d", userID2),
		Reason: "Test blocking",
	}

	blockResp, err := userService.BlockUser(ctx, blockReq)
	require.NoError(t, err)
	require.NotNil(t, blockResp)
	assert.True(t, blockResp.Success)

	// Verify block in database
	var count int
	err = db.QueryRow(`
		SELECT COUNT(*) FROM user_blocks
		WHERE blocker_user_id = $1 AND blocked_user_id = $2
	`, userID1, userID2).Scan(&count)
	require.NoError(t, err)
	assert.Equal(t, 1, count)

	// Test listing blocked users
	listReq := &userpb.ListBlockedUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 20,
		},
	}

	listResp, err := userService.ListBlockedUsers(ctx, listReq)
	require.NoError(t, err)
	require.NotNil(t, listResp)
	assert.GreaterOrEqual(t, len(listResp.Users), 1)

	// Test unblocking
	unblockReq := &userpb.UnblockUserRequest{
		UserId: fmt.Sprintf("%d", userID2),
	}

	unblockResp, err := userService.UnblockUser(ctx, unblockReq)
	require.NoError(t, err)
	require.NotNil(t, unblockResp)
	assert.True(t, unblockResp.Success)

	// Verify unblock in database
	err = db.QueryRow(`
		SELECT COUNT(*) FROM user_blocks
		WHERE blocker_user_id = $1 AND blocked_user_id = $2
	`, userID1, userID2).Scan(&count)
	require.NoError(t, err)
	assert.Equal(t, 0, count)
}

func TestIntegration_ReportUser(t *testing.T) {
	db, cleanup := setupIntegrationTest(t)
	defer cleanup()

	// Create two test users
	userID1 := createTestUser(t, db, fmt.Sprintf("reporter-%d@example.com", time.Now().Unix()))
	userID2 := createTestUser(t, db, fmt.Sprintf("reported-%d@example.com", time.Now().Unix()))

	// Create service
	userService := service.NewUserService(db, nil)

	// Mock auth context
	ctx := context.WithValue(context.Background(), "userID", userID1)

	req := &userpb.ReportUserRequest{
		UserId:       fmt.Sprintf("%d", userID2),
		Reason:       userpb.ReportReason_REPORT_REASON_SPAM,
		Details:      "Sending spam messages",
		EvidenceUrls: []string{"https://example.com/evidence.png"},
	}

	// Act
	resp, err := userService.ReportUser(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotEmpty(t, resp.ReportId)
	assert.Contains(t, resp.Message, "reported successfully")

	// Verify report in database
	var count int
	err = db.QueryRow(`
		SELECT COUNT(*) FROM user_reports
		WHERE reporter_user_id = $1 AND reported_user_id = $2
	`, userID1, userID2).Scan(&count)
	require.NoError(t, err)
	assert.Equal(t, 1, count)
}

func TestIntegration_PartnerPreferences(t *testing.T) {
	db, cleanup := setupIntegrationTest(t)
	defer cleanup()

	// Create test user
	userID := createTestUser(t, db, fmt.Sprintf("prefs-%d@example.com", time.Now().Unix()))

	// Create service
	userService := service.NewUserService(db, nil)

	// Mock auth context
	ctx := context.WithValue(context.Background(), "userID", userID)

	// Test getting preferences
	getReq := &userpb.GetPartnerPreferencesRequest{}
	getResp, err := userService.GetPartnerPreferences(ctx, getReq)
	require.NoError(t, err)
	require.NotNil(t, getResp)
	assert.Equal(t, int32(21), getResp.Preferences.AgeRange.MinAge)

	// Test updating preferences
	updateReq := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 25,
				MaxAge: 40,
			},
			DistancePreference: 100,
			VerifiedOnly:       true,
		},
	}

	updateResp, err := userService.UpdatePartnerPreferences(ctx, updateReq)
	require.NoError(t, err)
	require.NotNil(t, updateResp)
	assert.Equal(t, int32(25), updateResp.Preferences.AgeRange.MinAge)
	assert.Equal(t, int32(40), updateResp.Preferences.AgeRange.MaxAge)

	// Verify update in database
	var minAge, maxAge int
	err = db.QueryRow(`
		SELECT age_range_min, age_range_max
		FROM partner_preferences
		WHERE user_id = $1
	`, userID).Scan(&minAge, &maxAge)
	require.NoError(t, err)
	assert.Equal(t, 25, minAge)
	assert.Equal(t, 40, maxAge)
}

func TestIntegration_UserPreferences(t *testing.T) {
	db, cleanup := setupIntegrationTest(t)
	defer cleanup()

	// Create test user
	userID := createTestUser(t, db, fmt.Sprintf("userprefs-%d@example.com", time.Now().Unix()))

	// Create service
	userService := service.NewUserService(db, nil)

	// Mock auth context
	ctx := context.WithValue(context.Background(), "userID", userID)

	// Test getting preferences (should create default)
	getReq := &userpb.GetUserPreferencesRequest{}
	getResp, err := userService.GetUserPreferences(ctx, getReq)
	require.NoError(t, err)
	require.NotNil(t, getResp)
	assert.True(t, getResp.Preferences.Notifications.PushEnabled) // Default is true

	// Test updating preferences
	updateReq := &userpb.UpdateUserPreferencesRequest{
		Preferences: &userpb.UserPreferences{
			Notifications: &userpb.NotificationPreferences{
				PushEnabled:  false,
				EmailEnabled: true,
			},
			Privacy: &userpb.PrivacyPreferences{
				IncognitoMode: true,
			},
			AppLanguage: "es",
			Theme:       "dark",
		},
	}

	updateResp, err := userService.UpdateUserPreferences(ctx, updateReq)
	require.NoError(t, err)
	require.NotNil(t, updateResp)
	assert.False(t, updateResp.Preferences.Notifications.PushEnabled)
	assert.Equal(t, "es", updateResp.Preferences.AppLanguage)
	assert.Equal(t, "dark", updateResp.Preferences.Theme)

	// Verify update in database
	var pushEnabled bool
	var appLanguage, theme string
	err = db.QueryRow(`
		SELECT push_enabled, app_language, theme
		FROM user_preferences
		WHERE user_id = $1
	`, userID).Scan(&pushEnabled, &appLanguage, &theme)
	require.NoError(t, err)
	assert.False(t, pushEnabled)
	assert.Equal(t, "es", appLanguage)
	assert.Equal(t, "dark", theme)
}
