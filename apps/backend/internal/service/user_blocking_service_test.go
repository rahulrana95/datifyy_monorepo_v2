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

func TestBlockUser_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock block insert
	mock.ExpectExec("INSERT INTO user_blocks").
		WithArgs(sqlmock.AnyArg(), 2, "Spam").
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := &userpb.BlockUserRequest{
		UserId: "2",
		Reason: "Spam",
	}

	// Act
	resp, err := service.BlockUser(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.True(t, resp.Success)
	assert.Equal(t, "User blocked successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestBlockUser_MissingUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.BlockUserRequest{
		UserId: "",
	}

	resp, err := service.BlockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user_id is required")
}

func TestBlockUser_InvalidUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.BlockUserRequest{
		UserId: "invalid",
	}

	resp, err := service.BlockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid user_id format")
}

func TestUnblockUser_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock unblock delete
	mock.ExpectExec("DELETE FROM user_blocks WHERE blocker_user_id").
		WithArgs(sqlmock.AnyArg(), 2).
		WillReturnResult(sqlmock.NewResult(0, 1))

	req := &userpb.UnblockUserRequest{
		UserId: "2",
	}

	// Act
	resp, err := service.UnblockUser(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.True(t, resp.Success)
	assert.Equal(t, "User unblocked successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUnblockUser_NotFound(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock unblock delete - no rows affected
	mock.ExpectExec("DELETE FROM user_blocks WHERE blocker_user_id").
		WithArgs(sqlmock.AnyArg(), 2).
		WillReturnResult(sqlmock.NewResult(0, 0))

	req := &userpb.UnblockUserRequest{
		UserId: "2",
	}

	resp, err := service.UnblockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestListBlockedUsers_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	now := time.Now()

	// Mock count query
	countRows := sqlmock.NewRows([]string{"count"}).AddRow(2)
	mock.ExpectQuery("SELECT COUNT").
		WillReturnRows(countRows)

	// Mock blocked user IDs query
	blockRows := sqlmock.NewRows([]string{"blocked_user_id"}).
		AddRow(2).
		AddRow(3)

	mock.ExpectQuery("SELECT blocked_user_id FROM user_blocks").
		WillReturnRows(blockRows)

	// Mock get user 2
	userRows2 := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		2, "blocked@example.com", "Blocked User", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id").
		WithArgs(2).
		WillReturnRows(userRows2)

	// Mock profile for user 2
	profileRows2 := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		2, 2, nil, []byte("[]"), nil, nil, []byte("[]"),
		nil, nil, []byte("{}"), nil, []byte("[]"), []byte("[]"),
		[]byte("[]"), nil, nil, nil, nil,
		nil, nil, nil, nil, nil,
		nil, nil, nil, nil,
		[]byte("[]"), 0, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM user_profiles WHERE user_id").
		WithArgs(2).
		WillReturnRows(profileRows2)

	// Mock photos for user 2
	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WithArgs(2).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order", "is_primary", "caption", "uploaded_at"}))

	// Mock get user 3
	userRows3 := sqlmock.NewRows([]string{
		"id", "email", "name", "password_hash", "phone_number",
		"email_verified", "phone_verified", "account_status",
		"verification_token", "verification_token_expires_at",
		"password_reset_token", "password_reset_token_expires_at",
		"last_login_at", "photo_url", "date_of_birth", "gender",
		"created_at", "updated_at",
	}).AddRow(
		3, "blocked2@example.com", "Blocked User 2", "hash", nil,
		true, false, "ACTIVE",
		nil, nil, nil, nil,
		nil, nil, nil, nil,
		now, now,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id").
		WithArgs(3).
		WillReturnRows(userRows3)

	// Mock profile for user 3
	profileRows3 := sqlmock.NewRows([]string{
		"id", "user_id", "bio", "occupation", "company", "job_title", "education",
		"school", "height", "location", "hometown", "interests", "languages",
		"relationship_goals", "drinking", "smoking", "workout", "dietary_preference",
		"religion", "religion_importance", "political_view", "pets", "children",
		"personality_type", "communication_style", "love_language", "sleep_schedule",
		"prompts", "completion_percentage", "is_public", "is_verified",
	}).AddRow(
		3, 3, nil, []byte("[]"), nil, nil, []byte("[]"),
		nil, nil, []byte("{}"), nil, []byte("[]"), []byte("[]"),
		[]byte("[]"), nil, nil, nil, nil,
		nil, nil, nil, nil, nil,
		nil, nil, nil, nil,
		[]byte("[]"), 0, true, false,
	)

	mock.ExpectQuery("SELECT (.+) FROM user_profiles WHERE user_id").
		WithArgs(3).
		WillReturnRows(profileRows3)

	// Mock photos for user 3
	mock.ExpectQuery("SELECT (.+) FROM user_photos WHERE user_id").
		WithArgs(3).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "photo_id", "url", "thumbnail_url", "display_order", "is_primary", "caption", "uploaded_at"}))

	req := &userpb.ListBlockedUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 20,
		},
	}

	// Act
	resp, err := service.ListBlockedUsers(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Len(t, resp.Users, 2)
	assert.Equal(t, int64(2), resp.Pagination.TotalCount)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestReportUser_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock report insert
	mock.ExpectExec("INSERT INTO user_reports").
		WillReturnResult(sqlmock.NewResult(1, 1))

	req := &userpb.ReportUserRequest{
		UserId:       "2",
		Reason:       userpb.ReportReason_REPORT_REASON_SPAM,
		Details:      "Sending spam messages",
		EvidenceUrls: []string{"https://example.com/evidence.png"},
	}

	// Act
	resp, err := service.ReportUser(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotEmpty(t, resp.ReportId)
	assert.Contains(t, resp.Message, "reported successfully")
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestReportUser_MissingUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.ReportUserRequest{
		UserId: "",
		Reason: userpb.ReportReason_REPORT_REASON_SPAM,
	}

	resp, err := service.ReportUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user_id is required")
}

func TestReportUser_MissingReason(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.ReportUserRequest{
		UserId: "2",
		Reason: userpb.ReportReason_REPORT_REASON_UNSPECIFIED,
	}

	resp, err := service.ReportUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "reason is required")
}

func TestBlockUser_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock block insert with error
	mock.ExpectExec("INSERT INTO user_blocks").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.BlockUserRequest{
		UserId: "2",
		Reason: "Test",
	}

	resp, err := service.BlockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUnblockUser_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock unblock delete with error
	mock.ExpectExec("DELETE FROM user_blocks WHERE blocker_user_id").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.UnblockUserRequest{
		UserId: "2",
	}

	resp, err := service.UnblockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestReportUser_InvalidUserID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	req := &userpb.ReportUserRequest{
		UserId: "invalid",
		Reason: userpb.ReportReason_REPORT_REASON_SPAM,
	}

	resp, err := service.ReportUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid user_id format")
}

func TestBlockUser_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.BlockUserRequest{
		UserId: "2",
	}

	resp, err := service.BlockUser(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}

func TestListBlockedUsers_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock count query with error
	mock.ExpectQuery("SELECT COUNT").
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
