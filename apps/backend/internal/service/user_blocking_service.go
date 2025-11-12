package service

import (
	"context"
	"fmt"
	"strconv"
	"time"

	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// BlockUser blocks a user
func (s *UserService) BlockUser(
	ctx context.Context,
	req *userpb.BlockUserRequest,
) (*userpb.BlockUserResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	// Convert user ID to int
	blockedUserID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user_id format")
	}

	// Prevent blocking self
	if userID == blockedUserID {
		return nil, status.Error(codes.InvalidArgument, "cannot block yourself")
	}

	// Block user in database
	err = s.profileRepo.BlockUser(ctx, userID, blockedUserID, req.Reason)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to block user")
	}

	// TODO: Unmatch if previously matched
	// TODO: Delete any active conversations

	return &userpb.BlockUserResponse{
		Success: true,
		Message: "User blocked successfully",
	}, nil
}

// UnblockUser unblocks a user
func (s *UserService) UnblockUser(
	ctx context.Context,
	req *userpb.UnblockUserRequest,
) (*userpb.UnblockUserResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	// Convert user ID to int
	blockedUserID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user_id format")
	}

	// Unblock user in database
	err = s.profileRepo.UnblockUser(ctx, userID, blockedUserID)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to unblock user")
	}

	return &userpb.UnblockUserResponse{
		Success: true,
		Message: "User unblocked successfully",
	}, nil
}

// ListBlockedUsers lists all blocked users
func (s *UserService) ListBlockedUsers(
	ctx context.Context,
	req *userpb.ListBlockedUsersRequest,
) (*userpb.ListBlockedUsersResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Get pagination params
	page := int(req.Pagination.Page)
	pageSize := int(req.Pagination.PageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	// Get blocked user IDs from database
	blockedUserIDs, totalCount, err := s.profileRepo.GetBlockedUsers(ctx, userID, pageSize, offset)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get blocked users")
	}

	// Get full profiles for blocked users
	users := make([]*userpb.UserProfile, 0, len(blockedUserIDs))
	for _, blockedID := range blockedUserIDs {
		user, err := s.userRepo.GetByID(ctx, blockedID)
		if err != nil {
			continue
		}

		profile, err := s.profileRepo.GetProfileByUserID(ctx, blockedID)
		if err != nil {
			continue
		}

		photos, _ := s.profileRepo.GetPhotosByUserID(ctx, blockedID)
		pbProfile, err := buildUserProfileFromDB(user, profile, photos, nil, nil)
		if err != nil {
			continue
		}

		users = append(users, pbProfile)
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	return &userpb.ListBlockedUsersResponse{
		Users: users,
		Pagination: &commonpb.PaginationResponse{
			Page:       int32(page),
			PageSize:   int32(pageSize),
			TotalCount: int64(totalCount),
			TotalPages: int32(totalPages),
		},
	}, nil
}

// ReportUser reports a user for inappropriate behavior
func (s *UserService) ReportUser(
	ctx context.Context,
	req *userpb.ReportUserRequest,
) (*userpb.ReportUserResponse, error) {
	// Extract user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Validate input
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}

	if req.Reason == userpb.ReportReason_REPORT_REASON_UNSPECIFIED {
		return nil, status.Error(codes.InvalidArgument, "reason is required")
	}

	// Convert user ID to int
	reportedUserID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user_id format")
	}

	// Prevent reporting self
	if userID == reportedUserID {
		return nil, status.Error(codes.InvalidArgument, "cannot report yourself")
	}

	// Generate report ID
	reportID := fmt.Sprintf("report_%d_%d_%d", userID, reportedUserID, time.Now().Unix())

	// Create report in database
	err = s.profileRepo.CreateReport(
		ctx,
		userID,
		reportedUserID,
		reportID,
		req.Reason.String(),
		req.Details,
		req.EvidenceUrls,
	)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to create report")
	}

	// TODO: Notify moderation team
	// TODO: Auto-block user if multiple reports (threshold-based)

	return &userpb.ReportUserResponse{
		ReportId: reportID,
		Message:  "User reported successfully. Our team will review this report.",
	}, nil
}
