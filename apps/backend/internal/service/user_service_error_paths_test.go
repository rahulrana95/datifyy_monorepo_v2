package service

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Additional error path tests for complete coverage

func TestGetUserProfile_ProfileNotFound(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()
	now := time.Now()

	// Mock user found but profile not found
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
		WithArgs(1).
		WillReturnRows(userRows)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	req := &userpb.GetUserProfileRequest{
		UserId: "1",
	}

	resp, err := service.GetUserProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "profile not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetMyProfile_ProfileNotFound(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock user found but profile not found
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
		WithArgs(1).
		WillReturnRows(userRows)

	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_user_profiles WHERE user_id").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	req := &userpb.GetMyProfileRequest{}

	resp, err := service.GetMyProfile(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "profile not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestListBlockedUsers_GetBlockedIDsError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock count query success
	countRows := sqlmock.NewRows([]string{"count"}).AddRow(2)
	mock.ExpectQuery("SELECT COUNT").
		WillReturnRows(countRows)

	// Mock blocked user IDs query with error
	mock.ExpectQuery("SELECT blocked_user_id FROM user_blocks").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.ListBlockedUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 20,
		},
	}

	resp, err := service.ListBlockedUsers(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestListBlockedUsers_GetUserError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock count query
	countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
	mock.ExpectQuery("SELECT COUNT").
		WillReturnRows(countRows)

	// Mock blocked user IDs query
	blockRows := sqlmock.NewRows([]string{"blocked_user_id"}).AddRow(2)
	mock.ExpectQuery("SELECT blocked_user_id FROM user_blocks").
		WillReturnRows(blockRows)

	// Mock get user with error
	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(2).
		WillReturnError(sql.ErrConnDone)

	req := &userpb.ListBlockedUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 20,
		},
	}

	resp, err := service.ListBlockedUsers(ctx, req)

	// Should still return response but skip failed users
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Len(t, resp.Users, 0) // User fetch failed, so empty list
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestReportUser_DatabaseInsertError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock report insert with error
	mock.ExpectExec("INSERT INTO user_reports").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.ReportUserRequest{
		UserId:  "2",
		Reason:  userpb.ReportReason_REPORT_REASON_SPAM,
		Details: "Test",
	}

	resp, err := service.ReportUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "failed to create report")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUnblockUser_MissingUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	req := &userpb.UnblockUserRequest{
		UserId: "",
	}

	resp, err := service.UnblockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user_id is required")
}

func TestUnblockUser_InvalidUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	req := &userpb.UnblockUserRequest{
		UserId: "invalid",
	}

	resp, err := service.UnblockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid user_id format")
}

func TestDeleteProfilePhoto_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.DeleteProfilePhotoRequest{
		PhotoId: "photo_123",
	}

	resp, err := service.DeleteProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestUpdatePartnerPreferences_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

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
	assert.Contains(t, err.Error(), "authentication required")
}

func TestUpdateUserPreferences_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

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
	assert.Contains(t, err.Error(), "authentication required")
}

func TestListBlockedUsers_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.ListBlockedUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 20,
		},
	}

	resp, err := service.ListBlockedUsers(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestUnblockUser_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.UnblockUserRequest{
		UserId: "2",
	}

	resp, err := service.UnblockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestReportUser_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.ReportUserRequest{
		UserId: "2",
		Reason: userpb.ReportReason_REPORT_REASON_SPAM,
	}

	resp, err := service.ReportUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestDeleteAccount_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.DeleteAccountRequest{
		Password: "password",
	}

	resp, err := service.DeleteAccount(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestDeleteAccount_GetUserError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock get user with error
	mock.ExpectQuery("SELECT (.+) FROM datifyy_v2_users WHERE id").
		WithArgs(1).
		WillReturnError(sql.ErrConnDone)

	req := &userpb.DeleteAccountRequest{
		Password: "password",
	}

	resp, err := service.DeleteAccount(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user not found")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteAccount_UpdateStatusError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

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

	// Mock update account status with error
	mock.ExpectExec("UPDATE datifyy_v2_users SET account_status").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.DeleteAccountRequest{
		Password: "password",
	}

	resp, err := service.DeleteAccount(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "failed to delete account")
	assert.NoError(t, mock.ExpectationsWereMet())
}
