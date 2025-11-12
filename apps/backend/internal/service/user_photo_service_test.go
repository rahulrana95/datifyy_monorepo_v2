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

func TestUploadProfilePhoto_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	// Mock auth context
	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock photo insert
	photoRows := sqlmock.NewRows([]string{"id", "uploaded_at"}).
		AddRow(1, nil)

	mock.ExpectQuery("INSERT INTO user_photos").
		WillReturnRows(photoRows)

	req := &userpb.UploadProfilePhotoRequest{
		PhotoData:   []byte("fake-photo-data"),
		ContentType: "image/jpeg",
		IsPrimary:   true,
		Order:       1,
		Caption:     "Test photo",
	}

	// Act
	resp, err := service.UploadProfilePhoto(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotEmpty(t, resp.Photo.PhotoId)
	assert.NotEmpty(t, resp.Photo.Url)
	assert.True(t, resp.Photo.IsPrimary)
	assert.Equal(t, "Photo uploaded successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUploadProfilePhoto_MissingPhotoData(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UploadProfilePhotoRequest{
		PhotoData:   []byte{},
		ContentType: "image/jpeg",
	}

	resp, err := service.UploadProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "photo_data is required")
}

func TestUploadProfilePhoto_InvalidContentType(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UploadProfilePhotoRequest{
		PhotoData:   []byte("fake-photo-data"),
		ContentType: "application/pdf",
	}

	resp, err := service.UploadProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "invalid content_type")
}

func TestUploadProfilePhoto_MissingContentType(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.UploadProfilePhotoRequest{
		PhotoData:   []byte("fake-photo-data"),
		ContentType: "",
	}

	resp, err := service.UploadProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "content_type is required")
}

func TestDeleteProfilePhoto_Success(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock photo delete
	mock.ExpectExec("DELETE FROM user_photos WHERE user_id").
		WillReturnResult(sqlmock.NewResult(0, 1))

	req := &userpb.DeleteProfilePhotoRequest{
		PhotoId: "photo_123",
	}

	// Act
	resp, err := service.DeleteProfilePhoto(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.True(t, resp.Success)
	assert.Equal(t, "Photo deleted successfully", resp.Message)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteProfilePhoto_MissingPhotoID(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)
	req := &userpb.DeleteProfilePhotoRequest{
		PhotoId: "",
	}

	resp, err := service.DeleteProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "photo_id is required")
}

func TestDeleteProfilePhoto_NotFound(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock photo delete - no rows affected
	mock.ExpectExec("DELETE FROM user_photos WHERE user_id").
		WillReturnResult(sqlmock.NewResult(0, 0))

	req := &userpb.DeleteProfilePhotoRequest{
		PhotoId: "photo_nonexistent",
	}

	resp, err := service.DeleteProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUploadProfilePhoto_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock photo insert with error
	mock.ExpectQuery("INSERT INTO user_photos").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.UploadProfilePhotoRequest{
		PhotoData:   []byte("fake-photo-data"),
		ContentType: "image/jpeg",
		IsPrimary:   true,
	}

	resp, err := service.UploadProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestDeleteProfilePhoto_DatabaseError(t *testing.T) {
	service, mock, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	// Mock photo delete with error
	mock.ExpectExec("DELETE FROM user_photos WHERE user_id").
		WillReturnError(sql.ErrConnDone)

	req := &userpb.DeleteProfilePhotoRequest{
		PhotoId: "photo_123",
	}

	resp, err := service.DeleteProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestUploadProfilePhoto_NoAuthentication(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background() // No userID in context

	req := &userpb.UploadProfilePhotoRequest{
		PhotoData:   []byte("fake-photo-data"),
		ContentType: "image/jpeg",
	}

	resp, err := service.UploadProfilePhoto(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authentication required")
}
