package repository

import (
	"context"
	"database/sql"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock, *AdminRepository) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	repo := NewAdminRepository(db)
	return db, mock, repo
}

// =============================================================================
// Platform Stats Tests
// =============================================================================

func TestGetPlatformStats(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	// Mock all the count queries
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1000))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(750))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(900))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(500))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(200))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(150))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(50))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(100))
	mock.ExpectQuery("SELECT COUNT").WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(200))

	stats, err := repo.GetPlatformStats(ctx)
	require.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, int64(1000), stats.TotalUsers)
	assert.Equal(t, int64(750), stats.ActiveUsers)
	assert.Equal(t, int64(900), stats.VerifiedUsers)
	assert.Equal(t, int64(500), stats.AvailableForDating)
	assert.Equal(t, int64(200), stats.TotalDatesScheduled)
	assert.Equal(t, int64(150), stats.TotalDatesCompleted)
	assert.Equal(t, int64(50), stats.TodaySignups)
	assert.Equal(t, int64(100), stats.ThisWeekSignups)
	assert.Equal(t, int64(200), stats.ThisMonthSignups)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetPlatformStats_Error(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectQuery("SELECT COUNT").WillReturnError(sql.ErrConnDone)

	stats, err := repo.GetPlatformStats(ctx)
	assert.Error(t, err)
	assert.Nil(t, stats)
	assert.Contains(t, err.Error(), "failed to count total users")
}

// =============================================================================
// User Growth Tests
// =============================================================================

func TestGetUserGrowth_Daily(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	startTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	endTime := time.Date(2024, 1, 31, 23, 59, 59, 0, time.UTC)

	rows := sqlmock.NewRows([]string{"label", "value", "timestamp"}).
		AddRow("2024-01-01", 10, 1704067200).
		AddRow("2024-01-02", 15, 1704153600).
		AddRow("2024-01-03", 20, 1704240000)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	dataPoints, totalUsers, err := repo.GetUserGrowth(ctx, "daily", startTime, endTime)
	require.NoError(t, err)
	assert.Len(t, dataPoints, 3)
	assert.Equal(t, int64(45), totalUsers)
	assert.Equal(t, "2024-01-01", dataPoints[0].Label)
	assert.Equal(t, int64(10), dataPoints[0].Value)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetUserGrowth_Weekly(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	startTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	endTime := time.Date(2024, 3, 31, 23, 59, 59, 0, time.UTC)

	rows := sqlmock.NewRows([]string{"label", "value", "timestamp"}).
		AddRow("2024-01-01", 50, 1704067200).
		AddRow("2024-01-08", 75, 1704672000)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	dataPoints, totalUsers, err := repo.GetUserGrowth(ctx, "weekly", startTime, endTime)
	require.NoError(t, err)
	assert.Len(t, dataPoints, 2)
	assert.Equal(t, int64(125), totalUsers)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetUserGrowth_Monthly(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	startTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	endTime := time.Date(2024, 12, 31, 23, 59, 59, 0, time.UTC)

	rows := sqlmock.NewRows([]string{"label", "value", "timestamp"}).
		AddRow("2024-01", 100, 1704067200).
		AddRow("2024-02", 120, 1706745600).
		AddRow("2024-03", 140, 1709251200)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	dataPoints, totalUsers, err := repo.GetUserGrowth(ctx, "monthly", startTime, endTime)
	require.NoError(t, err)
	assert.Len(t, dataPoints, 3)
	assert.Equal(t, int64(360), totalUsers)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// =============================================================================
// Demographics Tests
// =============================================================================

func TestGetDemographics_Gender(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	rows := sqlmock.NewRows([]string{"category", "count"}).
		AddRow("MALE", 450).
		AddRow("FEMALE", 500).
		AddRow("OTHER", 50)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	demographics, err := repo.GetDemographics(ctx, "gender")
	require.NoError(t, err)
	assert.Len(t, demographics, 3)
	assert.Equal(t, "MALE", demographics[0].Category)
	assert.Equal(t, int64(450), demographics[0].Count)
	assert.InDelta(t, 45.0, demographics[0].Percentage, 0.1)
	assert.Equal(t, "FEMALE", demographics[1].Category)
	assert.Equal(t, int64(500), demographics[1].Count)
	assert.InDelta(t, 50.0, demographics[1].Percentage, 0.1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetDemographics_AgeGroup(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	rows := sqlmock.NewRows([]string{"category", "count"}).
		AddRow("18-24", 200).
		AddRow("25-34", 400).
		AddRow("35-44", 250).
		AddRow("45-54", 100).
		AddRow("55+", 50)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	demographics, err := repo.GetDemographics(ctx, "age_group")
	require.NoError(t, err)
	assert.Len(t, demographics, 5)
	assert.Equal(t, "18-24", demographics[0].Category)
	assert.Equal(t, int64(200), demographics[0].Count)
	assert.InDelta(t, 20.0, demographics[0].Percentage, 0.1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// =============================================================================
// Location Stats Tests
// =============================================================================

func TestGetLocationStats_Country(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	rows := sqlmock.NewRows([]string{"location_name", "location_code", "user_count"}).
		AddRow("United States", "United States", 500).
		AddRow("United Kingdom", "United Kingdom", 300).
		AddRow("Canada", "Canada", 200)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	locations, err := repo.GetLocationStats(ctx, "country", "")
	require.NoError(t, err)
	assert.Len(t, locations, 3)
	assert.Equal(t, "United States", locations[0].LocationName)
	assert.Equal(t, int64(500), locations[0].UserCount)
	assert.InDelta(t, 50.0, locations[0].Percentage, 0.1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetLocationStats_City(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	rows := sqlmock.NewRows([]string{"location_name", "location_code", "user_count"}).
		AddRow("New York", "New York", 150).
		AddRow("Los Angeles", "Los Angeles", 120).
		AddRow("Chicago", "Chicago", 80)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT")).WillReturnRows(rows)

	locations, err := repo.GetLocationStats(ctx, "city", "")
	require.NoError(t, err)
	assert.Len(t, locations, 3)
	assert.Equal(t, "New York", locations[0].LocationName)
	assert.Equal(t, int64(150), locations[0].UserCount)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// =============================================================================
// Availability Stats Tests
// =============================================================================

func TestGetAvailabilityStats(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta("SELECT COUNT(DISTINCT user_id)")).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(600))
	mock.ExpectQuery("SELECT COUNT").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1000))

	availableUsers, unavailableUsers, err := repo.GetAvailabilityStats(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(600), availableUsers)
	assert.Equal(t, int64(400), unavailableUsers)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// =============================================================================
// Admin Management Tests
// =============================================================================

func TestGetAllAdmins(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectQuery("SELECT COUNT").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))

	rows := sqlmock.NewRows([]string{
		"id", "user_id", "email", "name", "password_hash", "role", "is_genie",
		"is_active", "last_login_at", "created_at", "updated_at", "created_by",
	}).
		AddRow(1, nil, "admin@test.com", "Admin User", "hash1", "super_admin", false,
			true, nil, time.Now(), time.Now(), nil).
		AddRow(2, nil, "genie@test.com", "Genie User", "hash2", "genie", true,
			true, time.Now(), time.Now(), time.Now(), nil)

	mock.ExpectQuery(regexp.QuoteMeta("SELECT id, user_id, email")).WillReturnRows(rows)

	admins, totalCount, err := repo.GetAllAdmins(ctx, 1, 20)
	require.NoError(t, err)
	assert.Len(t, admins, 2)
	assert.Equal(t, 5, totalCount)
	assert.Equal(t, "admin@test.com", admins[0].Email)
	assert.Equal(t, "super_admin", admins[0].Role)
	assert.False(t, admins[0].IsGenie)
	assert.Equal(t, "genie@test.com", admins[1].Email)
	assert.True(t, admins[1].IsGenie)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateAdmin(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	now := time.Now()
	rows := sqlmock.NewRows([]string{
		"id", "user_id", "email", "name", "password_hash", "role", "is_genie",
		"is_active", "last_login_at", "created_at", "updated_at", "created_by",
	}).AddRow(1, nil, "updated@test.com", "Updated Name", "hash", "support", false,
		true, nil, now, now, nil)

	mock.ExpectQuery(regexp.QuoteMeta("UPDATE admin_users")).
		WithArgs("Updated Name", "updated@test.com", "support", 1).
		WillReturnRows(rows)

	admin, err := repo.UpdateAdmin(ctx, 1, "Updated Name", "updated@test.com", "support")
	require.NoError(t, err)
	assert.NotNil(t, admin)
	assert.Equal(t, "updated@test.com", admin.Email)
	assert.Equal(t, "Updated Name", admin.Name)
	assert.Equal(t, "support", admin.Role)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUpdateAdmin_NotFound(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta("UPDATE admin_users")).
		WithArgs("Name", "email@test.com", "role", 999).
		WillReturnError(sql.ErrNoRows)

	admin, err := repo.UpdateAdmin(ctx, 999, "Name", "email@test.com", "role")
	assert.Error(t, err)
	assert.Equal(t, ErrAdminNotFound, err)
	assert.Nil(t, admin)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteAdmin(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta("UPDATE admin_users SET is_active = FALSE")).
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err := repo.DeleteAdmin(ctx, 1)
	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteAdmin_NotFound(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta("UPDATE admin_users SET is_active = FALSE")).
		WithArgs(999).
		WillReturnResult(sqlmock.NewResult(0, 0))

	err := repo.DeleteAdmin(ctx, 999)
	assert.Error(t, err)
	assert.Equal(t, ErrAdminNotFound, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// =============================================================================
// Bulk Actions Tests
// =============================================================================

func TestBulkUserAction_Activate(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	userIDs := []int{1, 2, 3}

	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'ACTIVE'")).
		WithArgs(1).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'ACTIVE'")).
		WithArgs(2).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'ACTIVE'")).
		WithArgs(3).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	result, err := repo.BulkUserAction(ctx, userIDs, "activate", "test reason")
	require.NoError(t, err)
	assert.Equal(t, 3, result.SuccessCount)
	assert.Equal(t, 0, result.FailedCount)
	assert.Empty(t, result.FailedUserIDs)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestBulkUserAction_Suspend(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	userIDs := []int{1, 2}

	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'SUSPENDED'")).
		WithArgs(1).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'SUSPENDED'")).
		WithArgs(2).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	result, err := repo.BulkUserAction(ctx, userIDs, "suspend", "violation")
	require.NoError(t, err)
	assert.Equal(t, 2, result.SuccessCount)
	assert.Equal(t, 0, result.FailedCount)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestBulkUserAction_PartialFailure(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	userIDs := []int{1, 2, 3}

	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'DELETED'")).
		WithArgs(1).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'DELETED'")).
		WithArgs(2).WillReturnError(sql.ErrConnDone)
	mock.ExpectExec(regexp.QuoteMeta("UPDATE datifyy_v2_users SET account_status = 'DELETED'")).
		WithArgs(3).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	result, err := repo.BulkUserAction(ctx, userIDs, "delete", "cleanup")
	require.NoError(t, err)
	assert.Equal(t, 2, result.SuccessCount)
	assert.Equal(t, 1, result.FailedCount)
	assert.Len(t, result.FailedUserIDs, 1)
	assert.Equal(t, "2", result.FailedUserIDs[0])
	assert.Len(t, result.ErrorMessages, 1)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestBulkUserAction_InvalidAction(t *testing.T) {
	db, mock, repo := setupMockDB(t)
	defer db.Close()

	ctx := context.Background()
	userIDs := []int{1}

	mock.ExpectBegin()
	mock.ExpectRollback()

	result, err := repo.BulkUserAction(ctx, userIDs, "invalid_action", "test")
	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "invalid action")
}
