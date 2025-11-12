package service

import (
	"context"
	"fmt"
	"time"

	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// UploadProfilePhoto uploads a profile photo
func (s *UserService) UploadProfilePhoto(
	ctx context.Context,
	req *userpb.UploadProfilePhotoRequest,
) (*userpb.UploadProfilePhotoResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if len(req.PhotoData) == 0 {
		return nil, status.Error(codes.InvalidArgument, "photo_data is required")
	}

	if req.ContentType == "" {
		return nil, status.Error(codes.InvalidArgument, "content_type is required")
	}

	// Validate content type
	validContentTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/webp": true,
	}

	if !validContentTypes[req.ContentType] {
		return nil, status.Error(codes.InvalidArgument, "invalid content_type: must be jpeg, jpg, png, or webp")
	}

	// TODO: Upload to cloud storage (S3, GCS, etc.)
	// TODO: Generate thumbnail
	// TODO: Validate image size (e.g., max 10MB)

	photoID := fmt.Sprintf("photo_%d_%d", userID, time.Now().Unix())
	photoURL := fmt.Sprintf("https://cdn.datifyy.com/photos/%s.jpg", photoID)
	thumbnailURL := fmt.Sprintf("https://cdn.datifyy.com/photos/%s_thumb.jpg", photoID)

	// Store photo metadata in database
	photo := &repository.ProfilePhoto{
		UserID:       userID,
		PhotoID:      photoID,
		URL:          photoURL,
		ThumbnailURL: toNullString(thumbnailURL),
		DisplayOrder: int(req.Order),
		IsPrimary:    req.IsPrimary,
		Caption:      toNullString(req.Caption),
	}

	err = s.profileRepo.CreatePhoto(ctx, photo)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to save photo")
	}

	return &userpb.UploadProfilePhotoResponse{
		Photo: &userpb.ProfilePhoto{
			PhotoId:      photoID,
			Url:          photoURL,
			ThumbnailUrl: thumbnailURL,
			Order:        req.Order,
			IsPrimary:    req.IsPrimary,
			UploadedAt: &commonpb.Timestamp{
				Seconds: time.Now().Unix(),
				Nanos:   int32(time.Now().Nanosecond()),
			},
			Caption: req.Caption,
		},
		Message: "Photo uploaded successfully",
	}, nil
}

// DeleteProfilePhoto deletes a profile photo
func (s *UserService) DeleteProfilePhoto(
	ctx context.Context,
	req *userpb.DeleteProfilePhotoRequest,
) (*userpb.DeleteProfilePhotoResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if req.PhotoId == "" {
		return nil, status.Error(codes.InvalidArgument, "photo_id is required")
	}

	// Delete from database
	err = s.profileRepo.DeletePhoto(ctx, userID, req.PhotoId)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to delete photo")
	}

	// TODO: Delete from cloud storage

	return &userpb.DeleteProfilePhotoResponse{
		Success: true,
		Message: "Photo deleted successfully",
	}, nil
}
