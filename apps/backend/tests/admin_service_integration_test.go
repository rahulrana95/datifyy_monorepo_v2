// +build integration

package tests

import (
	"context"
	"database/sql"
	"os"
	"strconv"
	"testing"
	"time"

	adminpb "github.com/datifyy/backend/gen/admin/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/datifyy/backend/internal/auth"
	"github.com/datifyy/backend/internal/service"
	"github.com/redis/go-redis/v9"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupAdminServiceTest(t *testing.T) (*sql.DB, *service.AdminService, func()) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}

	db, err := sql.Open("postgres", dbURL)
	require.NoError(t, err)

	err = db.Ping()
	require.NoError(t, err)

	// Setup Redis client
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	redisOpts, err := redis.ParseURL(redisURL)
	require.NoError(t, err)
	redisClient := redis.NewClient(redisOpts)

	adminService, err := service.NewAdminService(db, redisClient)
	require.NoError(t, err)

	cleanup := func() {
		// Cleanup test data
		db.Exec("DELETE FROM admin_users WHERE email LIKE 'test_admin_%@test.com'")
		db.Exec("DELETE FROM users WHERE email LIKE 'test_user_%@test.com'")
		db.Close()
		redisClient.Close()
	}

	return db, adminService, cleanup
}

func createTestAdmin(t *testing.T, db *sql.DB, email, name, role string) int {
	passwordHash, err := auth.HashPassword("testpassword123")
	require.NoError(t, err)

	var adminID int
	err = db.QueryRow(`
		INSERT INTO admin_users (email, name, password_hash, role, is_genie, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`, email, name, passwordHash, role, false, true).Scan(&adminID)
	require.NoError(t, err)

	return adminID
}

func createTestUserForAdmin(t *testing.T, db *sql.DB, email, name, gender string) int {
	passwordHash, err := auth.HashPassword("testpassword123")
	require.NoError(t, err)

	var userID int
	err = db.QueryRow(`
		INSERT INTO users (email, name, password_hash, gender, account_status, email_verified)
		VALUES ($1, $2, $3, $4, 'ACTIVE', true)
		RETURNING id
	`, email, name, passwordHash, gender).Scan(&userID)
	require.NoError(t, err)

	return userID
}

// =============================================================================
// Platform Stats Integration Tests
// =============================================================================

func TestAdminService_GetPlatformStats_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create some test users
	createTestUserForAdmin(t, db, "test_user_1@test.com", "Test User 1", "MALE")
	createTestUserForAdmin(t, db, "test_user_2@test.com", "Test User 2", "FEMALE")

	req := &adminpb.PlatformStatsRequest{}
	resp, err := adminService.GetPlatformStats(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Greater(t, resp.TotalUsers, int64(0))
	assert.GreaterOrEqual(t, resp.TotalUsers, resp.ActiveUsers)
	assert.GreaterOrEqual(t, resp.TotalUsers, resp.VerifiedUsers)
}

// =============================================================================
// User Growth Integration Tests
// =============================================================================

func TestAdminService_GetUserGrowth_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users
	createTestUserForAdmin(t, db, "test_user_growth_1@test.com", "Growth User 1", "MALE")
	time.Sleep(10 * time.Millisecond)
	createTestUserForAdmin(t, db, "test_user_growth_2@test.com", "Growth User 2", "FEMALE")

	startTime := time.Now().AddDate(0, 0, -7) // Last 7 days
	endTime := time.Now()

	req := &adminpb.UserGrowthRequest{
		Period: adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_DAILY,
		TimeRange: &adminpb.TimeRange{
			StartTime: &commonpb.Timestamp{Seconds: startTime.Unix()},
			EndTime:   &commonpb.Timestamp{Seconds: endTime.Unix()},
		},
	}

	resp, err := adminService.GetUserGrowth(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.GreaterOrEqual(t, len(resp.DataPoints), 0)
	assert.GreaterOrEqual(t, resp.TotalUsers, int64(0))
}

func TestAdminService_GetUserGrowth_Weekly_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	startTime := time.Now().AddDate(0, -3, 0) // Last 3 months
	endTime := time.Now()

	req := &adminpb.UserGrowthRequest{
		Period: adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_WEEKLY,
		TimeRange: &adminpb.TimeRange{
			StartTime: &commonpb.Timestamp{Seconds: startTime.Unix()},
			EndTime:   &commonpb.Timestamp{Seconds: endTime.Unix()},
		},
	}

	resp, err := adminService.GetUserGrowth(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
}

// =============================================================================
// Demographics Integration Tests
// =============================================================================

func TestAdminService_GetDemographics_Gender_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create users with different genders
	createTestUserForAdmin(t, db, "test_user_demo_m1@test.com", "Male User 1", "MALE")
	createTestUserForAdmin(t, db, "test_user_demo_m2@test.com", "Male User 2", "MALE")
	createTestUserForAdmin(t, db, "test_user_demo_f1@test.com", "Female User 1", "FEMALE")

	req := &adminpb.DemographicsRequest{
		MetricType: "gender",
	}

	resp, err := adminService.GetDemographics(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Greater(t, len(resp.Data), 0)

	// Check that we have gender data
	var foundMale, foundFemale bool
	for _, data := range resp.Data {
		if data.Category == "MALE" {
			foundMale = true
			assert.Greater(t, data.Count, int64(0))
			assert.Greater(t, data.Percentage, 0.0)
		}
		if data.Category == "FEMALE" {
			foundFemale = true
			assert.Greater(t, data.Count, int64(0))
			assert.Greater(t, data.Percentage, 0.0)
		}
	}

	assert.True(t, foundMale || foundFemale, "Should have at least one gender category")
}

// =============================================================================
// Availability Stats Integration Tests
// =============================================================================

func TestAdminService_GetAvailabilityStats_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test user
	userID := createTestUserForAdmin(t, db, "test_user_avail@test.com", "Avail User", "MALE")

	// Add availability slot
	_, err := db.Exec(`
		INSERT INTO availability_slots (user_id, start_time, end_time, date_type)
		VALUES ($1, $2, $3, 'online')
	`, userID, time.Now().Add(24*time.Hour), time.Now().Add(26*time.Hour))
	require.NoError(t, err)

	req := &adminpb.AvailabilityStatsRequest{}
	resp, err := adminService.GetAvailabilityStats(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.GreaterOrEqual(t, resp.AvailableUsers, int64(1))
	assert.GreaterOrEqual(t, resp.AvailabilityRate, 0.0)
	assert.LessOrEqual(t, resp.AvailabilityRate, 100.0)
}

// =============================================================================
// Admin Management Integration Tests
// =============================================================================

func TestAdminService_GetAllAdmins_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test admins
	createTestAdmin(t, db, "test_admin_1@test.com", "Test Admin 1", "super_admin")
	createTestAdmin(t, db, "test_admin_2@test.com", "Test Admin 2", "genie")

	req := &adminpb.GetAllAdminsRequest{
		Page:     1,
		PageSize: 20,
	}

	resp, err := adminService.GetAllAdmins(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.GreaterOrEqual(t, len(resp.Admins), 2)
	assert.Greater(t, resp.TotalCount, int32(0))
}

func TestAdminService_CreateAdminUser_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	req := &adminpb.CreateAdminUserRequest{
		Email:    "test_admin_create@test.com",
		Password: "securepassword123",
		Name:     "Created Admin",
		Role:     adminpb.AdminRole_ADMIN_ROLE_SUPPORT,
		IsGenie:  false,
	}

	resp, err := adminService.CreateAdminUser(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotNil(t, resp.Admin)
	assert.Equal(t, "test_admin_create@test.com", resp.Admin.Email)
	assert.Equal(t, "Created Admin", resp.Admin.Name)
	assert.Equal(t, adminpb.AdminRole_ADMIN_ROLE_SUPPORT, resp.Admin.Role)
}

func TestAdminService_UpdateAdmin_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test admin
	adminID := createTestAdmin(t, db, "test_admin_update@test.com", "Original Name", "support")

	req := &adminpb.UpdateAdminRequest{
		AdminId: strconv.Itoa(adminID),
		Name:    "Updated Name",
		Email:   "test_admin_updated@test.com",
		Role:    adminpb.AdminRole_ADMIN_ROLE_MODERATOR,
	}

	resp, err := adminService.UpdateAdmin(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, "test_admin_updated@test.com", resp.Admin.Email)
	assert.Equal(t, "Updated Name", resp.Admin.Name)
}

func TestAdminService_DeleteAdmin_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test admin
	adminID := createTestAdmin(t, db, "test_admin_delete@test.com", "To Delete", "support")

	req := &adminpb.DeleteAdminRequest{
		AdminId: strconv.Itoa(adminID),
	}

	resp, err := adminService.DeleteAdmin(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Success)

	// Verify admin is soft deleted
	var isActive bool
	err = db.QueryRow("SELECT is_active FROM admin_users WHERE id = $1", adminID).Scan(&isActive)
	require.NoError(t, err)
	assert.False(t, isActive)
}

// =============================================================================
// Bulk Actions Integration Tests
// =============================================================================

func TestAdminService_BulkUserAction_Activate_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users with SUSPENDED status
	user1ID := createTestUserForAdmin(t, db, "test_bulk_1@test.com", "Bulk User 1", "MALE")
	user2ID := createTestUserForAdmin(t, db, "test_bulk_2@test.com", "Bulk User 2", "FEMALE")

	// Suspend them first
	_, err := db.Exec("UPDATE users SET account_status = 'SUSPENDED' WHERE id IN ($1, $2)", user1ID, user2ID)
	require.NoError(t, err)

	req := &adminpb.BulkUserActionRequest{
		UserIds: []string{strconv.Itoa(user1ID), strconv.Itoa(user2ID)},
		Action:  adminpb.BulkUserAction_BULK_USER_ACTION_ACTIVATE,
		Reason:  "Integration test activation",
	}

	resp, err := adminService.BulkUserAction(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, int32(2), resp.SuccessCount)
	assert.Equal(t, int32(0), resp.FailedCount)

	// Verify users are activated
	var status1, status2 string
	err = db.QueryRow("SELECT account_status FROM users WHERE id = $1", user1ID).Scan(&status1)
	require.NoError(t, err)
	assert.Equal(t, "ACTIVE", status1)

	err = db.QueryRow("SELECT account_status FROM users WHERE id = $2", user2ID).Scan(&status2)
	require.NoError(t, err)
	assert.Equal(t, "ACTIVE", status2)
}

func TestAdminService_BulkUserAction_Verify_Integration(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users
	user1ID := createTestUserForAdmin(t, db, "test_verify_1@test.com", "Verify User 1", "MALE")

	// Unverify first
	_, err := db.Exec("UPDATE users SET email_verified = false WHERE id = $1", user1ID)
	require.NoError(t, err)

	req := &adminpb.BulkUserActionRequest{
		UserIds: []string{strconv.Itoa(user1ID)},
		Action:  adminpb.BulkUserAction_BULK_USER_ACTION_VERIFY,
		Reason:  "Manual verification",
	}

	resp, err := adminService.BulkUserAction(ctx, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, int32(1), resp.SuccessCount)

	// Verify user is verified
	var emailVerified bool
	err = db.QueryRow("SELECT email_verified FROM users WHERE id = $1", user1ID).Scan(&emailVerified)
	require.NoError(t, err)
	assert.True(t, emailVerified)
}

// =============================================================================
// AI-Powered Date Curation Tests
// =============================================================================

func createTestUserForCuration(t *testing.T, db *sql.DB, email, name, gender string, age int, availableTomorrow bool) int {
	ctx := context.Background()

	// Calculate date of birth from age
	dob := time.Now().AddDate(-age, 0, 0)

	// Create user
	var userID int
	err := db.QueryRowContext(ctx, `
		INSERT INTO users (email, name, password_hash, gender, date_of_birth, account_status, email_verified)
		VALUES ($1, $2, $3, $4, $5, 'ACTIVE', true)
		RETURNING id
	`, email, name, "hashedpassword", gender, dob).Scan(&userID)
	require.NoError(t, err)

	// Create profile with JSONB fields
	_, err = db.ExecContext(ctx, `
		INSERT INTO user_profiles (
			user_id, bio, occupation, education, interests,
			drinking, smoking, workout, dietary_preference,
			completion_percentage, is_public
		) VALUES (
			$1, $2, $3::jsonb, $4::jsonb, $5::jsonb,
			$6, $7, $8, $9,
			75, true
		)
	`, userID, "Test bio for "+name,
		`{"title": "Software Engineer", "company": "Tech Corp"}`,
		`{"level": "Bachelor's", "field": "Computer Science"}`,
		`["coding", "hiking", "reading"]`,
		"Socially", "Never", "Regularly", "Vegetarian")
	require.NoError(t, err)

	// Create partner preferences
	_, err = db.ExecContext(ctx, `
		INSERT INTO partner_preferences (
			user_id, age_range_min, age_range_max,
			looking_for_gender, distance_preference,
			drinking_preferences, smoking_preferences, workout_preferences,
			education_levels, interest_preferences
		) VALUES (
			$1, $2, $3,
			$4::jsonb, 50,
			$5::jsonb, $6::jsonb, $7::jsonb,
			$8::jsonb, $9::jsonb
		)
	`, userID, age-5, age+5,
		`["MALE", "FEMALE"]`,
		`["Socially", "Never"]`,
		`["Never"]`,
		`["Regularly", "Sometimes"]`,
		`["Bachelor's", "Master's"]`,
		`["coding", "technology", "outdoors"]`)
	require.NoError(t, err)

	// Add availability for tomorrow if requested
	if availableTomorrow {
		tomorrow := time.Now().AddDate(0, 0, 1)
		startOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 18, 0, 0, 0, tomorrow.Location())

		_, err = db.ExecContext(ctx, `
			INSERT INTO availability_slots (user_id, start_time, end_time)
			VALUES ($1, $2, $3)
		`, userID, startOfDay.Unix(), startOfDay.Add(2*time.Hour).Unix())
		require.NoError(t, err)
	}

	return userID
}

func TestAdminService_GetCurationCandidates(t *testing.T) {
	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users with availability tomorrow
	user1ID := createTestUserForCuration(t, db, "test_admin_curation_1@test.com", "Alice", "FEMALE", 28, true)
	user2ID := createTestUserForCuration(t, db, "test_admin_curation_2@test.com", "Bob", "MALE", 30, true)

	// Create user without availability
	_ = createTestUserForCuration(t, db, "test_admin_curation_3@test.com", "Charlie", "MALE", 25, false)

	// Test: Get curation candidates
	resp, err := adminService.GetCurationCandidates(ctx, &adminpb.GetCurationCandidatesRequest{})
	require.NoError(t, err)
	require.NotNil(t, resp)

	// Should have at least 2 candidates
	assert.GreaterOrEqual(t, len(resp.Candidates), 2, "Should have at least 2 candidates")

	// Verify candidate details
	found1 := false
	found2 := false
	for _, candidate := range resp.Candidates {
		candidateID, _ := strconv.Atoi(candidate.UserId)
		if candidateID == user1ID {
			found1 = true
			assert.Equal(t, "Alice", candidate.Name)
			assert.Equal(t, "FEMALE", candidate.Gender)
			assert.Equal(t, int32(28), candidate.Age)
			assert.Equal(t, int32(75), candidate.ProfileCompletion)
			assert.True(t, candidate.EmailVerified)
			assert.GreaterOrEqual(t, candidate.AvailableSlotsCount, int32(1))
		}
		if candidateID == user2ID {
			found2 = true
			assert.Equal(t, "Bob", candidate.Name)
			assert.Equal(t, "MALE", candidate.Gender)
			assert.Equal(t, int32(30), candidate.Age)
		}
	}

	assert.True(t, found1, "User1 should be in candidates")
	assert.True(t, found2, "User2 should be in candidates")

	// Cleanup
	db.Exec("DELETE FROM availability_slots WHERE user_id IN ($1, $2)", user1ID, user2ID)
	db.Exec("DELETE FROM partner_preferences WHERE user_id IN ($1, $2, $3)", user1ID, user2ID)
	db.Exec("DELETE FROM user_profiles WHERE user_id IN ($1, $2, $3)", user1ID, user2ID)
	db.Exec("DELETE FROM users WHERE id IN ($1, $2, $3)", user1ID, user2ID)
}

func TestAdminService_CurateDates(t *testing.T) {
	// Skip if GEMINI_API_KEY not set
	if os.Getenv("GEMINI_API_KEY") == "" {
		t.Skip("GEMINI_API_KEY not set, skipping AI curation test")
	}

	db, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users
	user1ID := createTestUserForCuration(t, db, "test_admin_curate_1@test.com", "Alice", "FEMALE", 28, true)
	user2ID := createTestUserForCuration(t, db, "test_admin_curate_2@test.com", "Bob", "MALE", 30, true)
	user3ID := createTestUserForCuration(t, db, "test_admin_curate_3@test.com", "Charlie", "MALE", 45, true)

	// Test: Curate dates
	resp, err := adminService.CurateDates(ctx, &adminpb.CurateDatesRequest{
		UserId:       strconv.Itoa(user1ID),
		CandidateIds: []string{strconv.Itoa(user2ID), strconv.Itoa(user3ID)},
	})

	require.NoError(t, err)
	require.NotNil(t, resp)

	// Should return 2 matches
	assert.Len(t, resp.Matches, 2, "Should return 2 match results")

	for _, match := range resp.Matches {
		// Verify match structure
		assert.NotEmpty(t, match.UserId, "Match should have user ID")
		assert.NotEmpty(t, match.Name, "Match should have name")
		assert.Greater(t, match.Age, int32(0), "Match should have age")
		assert.NotEmpty(t, match.Gender, "Match should have gender")
		assert.GreaterOrEqual(t, match.CompatibilityScore, 0.0, "Score should be >= 0")
		assert.LessOrEqual(t, match.CompatibilityScore, 100.0, "Score should be <= 100")
		assert.NotEmpty(t, match.Reasoning, "Should have reasoning")

		// If score >= 60, should be marked as match
		if match.CompatibilityScore >= 60.0 {
			assert.True(t, match.IsMatch, "High score should be marked as match")
		}

		t.Logf("Compatibility with %s (age %d): %.2f%% - IsMatch: %v",
			match.Name, match.Age, match.CompatibilityScore, match.IsMatch)
		t.Logf("Reasoning: %s", match.Reasoning)
		t.Logf("Matched aspects: %v", match.MatchedAspects)
		t.Logf("Mismatched aspects: %v", match.MismatchedAspects)
	}

	// Verify curated matches were saved
	var matchCount int
	err = db.QueryRow(`
		SELECT COUNT(*) FROM curated_matches
		WHERE user1_id = $1 OR user2_id = $1
	`, user1ID).Scan(&matchCount)
	require.NoError(t, err)
	assert.Equal(t, 2, matchCount, "Should have saved 2 curated matches")

	// Cleanup
	db.Exec("DELETE FROM curated_matches WHERE user1_id IN ($1, $2, $3) OR user2_id IN ($1, $2, $3)", user1ID, user2ID, user3ID)
	db.Exec("DELETE FROM availability_slots WHERE user_id IN ($1, $2, $3)", user1ID, user2ID, user3ID)
	db.Exec("DELETE FROM partner_preferences WHERE user_id IN ($1, $2, $3)", user1ID, user2ID, user3ID)
	db.Exec("DELETE FROM user_profiles WHERE user_id IN ($1, $2, $3)", user1ID, user2ID, user3ID)
	db.Exec("DELETE FROM users WHERE id IN ($1, $2, $3)", user1ID, user2ID, user3ID)
}

func TestAdminService_CurateDates_InvalidInput(t *testing.T) {
	_, adminService, cleanup := setupAdminServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Test: Invalid user ID
	_, err := adminService.CurateDates(ctx, &adminpb.CurateDatesRequest{
		UserId:       "invalid",
		CandidateIds: []string{"1", "2"},
	})
	assert.Error(t, err, "Should error on invalid user ID")

	// Test: No candidates
	_, err = adminService.CurateDates(ctx, &adminpb.CurateDatesRequest{
		UserId:       "1",
		CandidateIds: []string{},
	})
	assert.Error(t, err, "Should error when no candidates provided")

	// Test: Invalid candidate ID
	_, err = adminService.CurateDates(ctx, &adminpb.CurateDatesRequest{
		UserId:       "1",
		CandidateIds: []string{"invalid", "2"},
	})
	assert.Error(t, err, "Should error on invalid candidate ID")
}
