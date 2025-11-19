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

	adminService := service.NewAdminService(db)

	cleanup := func() {
		// Cleanup test data
		db.Exec("DELETE FROM admin_users WHERE email LIKE 'test_admin_%@test.com'")
		db.Exec("DELETE FROM users WHERE email LIKE 'test_user_%@test.com'")
		db.Close()
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

func createTestUser(t *testing.T, db *sql.DB, email, name, gender string) int {
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
	createTestUser(t, db, "test_user_1@test.com", "Test User 1", "MALE")
	createTestUser(t, db, "test_user_2@test.com", "Test User 2", "FEMALE")

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
	createTestUser(t, db, "test_user_growth_1@test.com", "Growth User 1", "MALE")
	time.Sleep(10 * time.Millisecond)
	createTestUser(t, db, "test_user_growth_2@test.com", "Growth User 2", "FEMALE")

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
	createTestUser(t, db, "test_user_demo_m1@test.com", "Male User 1", "MALE")
	createTestUser(t, db, "test_user_demo_m2@test.com", "Male User 2", "MALE")
	createTestUser(t, db, "test_user_demo_f1@test.com", "Female User 1", "FEMALE")

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
	userID := createTestUser(t, db, "test_user_avail@test.com", "Avail User", "MALE")

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
	user1ID := createTestUser(t, db, "test_bulk_1@test.com", "Bulk User 1", "MALE")
	user2ID := createTestUser(t, db, "test_bulk_2@test.com", "Bulk User 2", "FEMALE")

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
	user1ID := createTestUser(t, db, "test_verify_1@test.com", "Verify User 1", "MALE")

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
