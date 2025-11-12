package service

import (
	"context"
	"fmt"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
)

// GetCurrentSession returns information about the current session
// Requires authentication - extracts user from context
func (s *AuthService) GetCurrentSession(
	ctx context.Context,
	req *authpb.GetCurrentSessionRequest,
) (*authpb.GetCurrentSessionResponse, error) {
	// Extract access token from context
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to get user ID and timestamp
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	// Construct session ID
	sessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Query session from database
	var session struct {
		ID           string
		UserID       int
		DeviceID     *string
		ExpiresAt    string
		IsActive     bool
		LastActiveAt string
		CreatedAt    string
	}

	query := `
		SELECT id, user_id, device_id, expires_at, is_active, last_active_at, created_at
		FROM sessions
		WHERE id = $1 AND user_id = $2
	`

	err = s.db.QueryRowContext(ctx, query, sessionID, userID).Scan(
		&session.ID,
		&session.UserID,
		&session.DeviceID,
		&session.ExpiresAt,
		&session.IsActive,
		&session.LastActiveAt,
		&session.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	// Build session info response
	sessionInfo := &authpb.SessionInfo{
		SessionId: session.ID,
		UserId:    fmt.Sprintf("%d", session.UserID),
		IsCurrent: true,
	}

	// TODO: Parse timestamps and add to response
	// TODO: Add device info if available

	return &authpb.GetCurrentSessionResponse{
		Session: sessionInfo,
	}, nil
}

// ListSessions returns all active sessions for the authenticated user
// Requires authentication - extracts user from context
func (s *AuthService) ListSessions(
	ctx context.Context,
	req *authpb.ListSessionsRequest,
) (*authpb.ListSessionsResponse, error) {
	// Extract access token from context
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to get user ID
	var userID int
	var currentTimestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &currentTimestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	currentSessionID := fmt.Sprintf("sess_%d_%d", userID, currentTimestamp)

	// Get pagination parameters
	limit := int32(10) // default
	offset := int32(0)
	if req.Pagination != nil {
		if req.Pagination.PageSize > 0 {
			limit = req.Pagination.PageSize
		}
		if req.Pagination.Page > 0 {
			offset = (req.Pagination.Page - 1) * limit
		}
	}

	// Query sessions from database
	query := `
		SELECT id, user_id, device_id, expires_at, is_active, last_active_at, created_at
		FROM sessions
		WHERE user_id = $1 AND is_active = true
		ORDER BY last_active_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*authpb.SessionInfo

	for rows.Next() {
		var session struct {
			ID           string
			UserID       int
			DeviceID     *string
			ExpiresAt    string
			IsActive     bool
			LastActiveAt string
			CreatedAt    string
		}

		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.DeviceID,
			&session.ExpiresAt,
			&session.IsActive,
			&session.LastActiveAt,
			&session.CreatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}

		sessionInfo := &authpb.SessionInfo{
			SessionId: session.ID,
			UserId:    fmt.Sprintf("%d", session.UserID),
			IsCurrent: session.ID == currentSessionID,
		}

		// TODO: Parse timestamps and add to response
		// TODO: Add device info if available

		sessions = append(sessions, sessionInfo)
	}

	// Get total count
	var totalCount int64
	countQuery := `SELECT COUNT(*) FROM sessions WHERE user_id = $1 AND is_active = true`
	err = s.db.QueryRowContext(ctx, countQuery, userID).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to count sessions: %w", err)
	}

	return &authpb.ListSessionsResponse{
		Sessions: sessions,
		Pagination: &commonpb.PaginationResponse{
			TotalCount: totalCount,
			PageSize:   limit,
			Page:       (offset / limit) + 1,
		},
	}, nil
}

// RevokeSession revokes a specific session by ID
// Requires authentication - extracts user from context
func (s *AuthService) RevokeSession(
	ctx context.Context,
	req *authpb.RevokeSessionRequest,
) (*authpb.RevokeSessionResponse, error) {
	// Validate input
	if req.SessionId == "" {
		return nil, fmt.Errorf("session_id is required")
	}

	// Extract access token from context to verify user
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to get user ID
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	// Revoke the session (must belong to the current user)
	query := `
		UPDATE sessions
		SET is_active = false
		WHERE id = $1 AND user_id = $2 AND is_active = true
	`

	result, err := s.db.ExecContext(ctx, query, req.SessionId, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to revoke session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check revocation result: %w", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("session not found or already revoked")
	}

	// Remove from Redis cache
	if s.redis != nil {
		redisKey := fmt.Sprintf("session:%s", req.SessionId)
		err = s.redis.Del(ctx, redisKey).Err()
		if err != nil {
			fmt.Printf("Warning: failed to remove session from Redis: %v\n", err)
		}
	}

	return &authpb.RevokeSessionResponse{
		Message: "Session revoked successfully",
	}, nil
}

// RevokeAllSessions revokes all sessions except the current one
// Requires authentication - extracts user from context
func (s *AuthService) RevokeAllSessions(
	ctx context.Context,
	req *authpb.RevokeAllSessionsRequest,
) (*authpb.RevokeAllSessionsResponse, error) {
	// Extract access token from context to get current session
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to get user ID and timestamp
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	// Current session ID (to exclude from revocation)
	currentSessionID := fmt.Sprintf("sess_%d_%d", userID, timestamp)

	// Revoke all sessions except current
	query := `
		UPDATE sessions
		SET is_active = false
		WHERE user_id = $1 AND id != $2 AND is_active = true
	`

	result, err := s.db.ExecContext(ctx, query, userID, currentSessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to revoke sessions: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check revocation result: %w", err)
	}

	// Clear all sessions from Redis cache for this user
	if s.redis != nil {
		// Note: This is a simplified approach
		// In production, you'd want to maintain a set of session IDs per user in Redis
		// For now, we'll just log a warning
		fmt.Printf("Warning: Redis cache cleanup not fully implemented for user %d\n", userID)
	}

	message := fmt.Sprintf("Successfully revoked %d session(s)", rowsAffected)
	return &authpb.RevokeAllSessionsResponse{
		Message:       message,
		RevokedCount:  int32(rowsAffected),
	}, nil
}

// LogoutAll logs out from all devices (revokes all sessions including current)
// Requires authentication - extracts user from context
func (s *AuthService) LogoutAll(
	ctx context.Context,
	req *authpb.LogoutAllRequest,
) (*authpb.LogoutAllResponse, error) {
	// Extract access token from context
	accessToken := extractTokenFromContext(ctx)
	if accessToken == "" {
		return nil, fmt.Errorf("authorization required: access token not found in metadata")
	}

	// Parse access token to get user ID
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return nil, fmt.Errorf("invalid access token format")
	}

	// Revoke ALL sessions for this user (including current)
	query := `
		UPDATE sessions
		SET is_active = false
		WHERE user_id = $1 AND is_active = true
	`

	result, err := s.db.ExecContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to logout from all devices: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check logout result: %w", err)
	}

	// Clear all sessions from Redis cache for this user
	if s.redis != nil {
		fmt.Printf("Warning: Redis cache cleanup not fully implemented for user %d\n", userID)
	}

	message := fmt.Sprintf("Successfully logged out from %d device(s)", rowsAffected)
	return &authpb.LogoutAllResponse{
		Message: message,
	}, nil
}
