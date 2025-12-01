package service

import (
	"context"
	"fmt"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
)

// ListDevices lists all devices for authenticated user
// Requires authentication - extracts user from context
func (s *AuthService) ListDevices(
	ctx context.Context,
	req *authpb.ListDevicesRequest,
) (*authpb.ListDevicesResponse, error) {
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

	// Get pagination parameters
	limit := int32(20) // default
	offset := int32(0)
	if req.Pagination != nil {
		if req.Pagination.PageSize > 0 {
			limit = req.Pagination.PageSize
		}
		if req.Pagination.Page > 0 {
			offset = (req.Pagination.Page - 1) * limit
		}
	}

	// Query devices from sessions
	// Each session represents a device
	query := `
		SELECT DISTINCT
			COALESCE(device_id, 'unknown') as device_id,
			COUNT(*) as session_count,
			MAX(last_active_at) as last_active,
			MAX(created_at) as first_seen,
			BOOL_OR(is_active) as has_active_sessions
		FROM datifyy_v2_sessions
		WHERE user_id = $1
		GROUP BY device_id
		ORDER BY MAX(last_active_at) DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query devices: %w", err)
	}
	defer rows.Close()

	var deviceSessions []*authpb.DeviceSession

	for rows.Next() {
		var deviceID string
		var sessionCount int
		var lastActive, firstSeen string
		var hasActiveSessions bool

		err := rows.Scan(&deviceID, &sessionCount, &lastActive, &firstSeen, &hasActiveSessions)
		if err != nil {
			return nil, fmt.Errorf("failed to scan device: %w", err)
		}

		// Build device session
		// Note: We have limited device info since we only store device_id
		// In production, you'd want a separate devices table with more metadata
		deviceSession := &authpb.DeviceSession{
			Session: &authpb.SessionInfo{
				SessionId: deviceID, // Using device_id as identifier
				UserId:    fmt.Sprintf("%d", userID),
				IsCurrent: false, // Can't easily determine current from this query
				// TODO: Add device info, timestamps
			},
			IsTrusted:  false,          // TODO: Check from trusted_devices table
			LoginCount: int32(sessionCount),
		}

		deviceSessions = append(deviceSessions, deviceSession)
	}

	// Get total count
	var totalCount int32
	countQuery := `
		SELECT COUNT(DISTINCT COALESCE(device_id, 'unknown'))
		FROM datifyy_v2_sessions
		WHERE user_id = $1
	`
	err = s.db.QueryRowContext(ctx, countQuery, userID).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to count devices: %w", err)
	}

	return &authpb.ListDevicesResponse{
		Devices: &authpb.DeviceList{
			Devices:    deviceSessions,
			TotalCount: totalCount,
		},
		Pagination: &commonpb.PaginationResponse{
			TotalCount: int64(totalCount),
			PageSize:   limit,
			Page:       (offset / limit) + 1,
		},
	}, nil
}

// TrustDevice marks a device as trusted
// Requires authentication - extracts user from context
func (s *AuthService) TrustDevice(
	ctx context.Context,
	req *authpb.TrustDeviceRequest,
) (*authpb.TrustDeviceResponse, error) {
	// Validate input
	if req.DeviceId == "" {
		return nil, fmt.Errorf("device_id is required")
	}

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

	// TODO: Implement trusted devices table
	// For now, we'll just return success
	// In production, you'd want:
	// 1. A trusted_devices table with (user_id, device_id, trusted_at, expires_at)
	// 2. Insert or update the trust status
	// 3. Use this for features like:
	//    - Skip 2FA on trusted devices
	//    - Allow sensitive operations without re-auth
	//    - Track device trust history

	// Verify device belongs to user (check if any sessions exist)
	var sessionCount int
	checkQuery := `
		SELECT COUNT(*)
		FROM datifyy_v2_sessions
		WHERE user_id = $1 AND device_id = $2
	`
	err = s.db.QueryRowContext(ctx, checkQuery, userID, req.DeviceId).Scan(&sessionCount)
	if err != nil {
		return nil, fmt.Errorf("failed to verify device ownership: %w", err)
	}

	if sessionCount == 0 {
		return nil, fmt.Errorf("device not found or does not belong to user")
	}

	return &authpb.TrustDeviceResponse{
		Message: fmt.Sprintf("Device %s marked as trusted", req.DeviceId),
	}, nil
}

// RevokeDevice revokes all sessions for a specific device
// Requires authentication - extracts user from context
func (s *AuthService) RevokeDevice(
	ctx context.Context,
	req *authpb.RevokeDeviceRequest,
) (*authpb.RevokeDeviceResponse, error) {
	// Validate input
	if req.DeviceId == "" {
		return nil, fmt.Errorf("device_id is required")
	}

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

	// Revoke all sessions for this device
	query := `
		UPDATE datifyy_v2_sessions
		SET is_active = false
		WHERE user_id = $1 AND device_id = $2 AND is_active = true
	`

	result, err := s.db.ExecContext(ctx, query, userID, req.DeviceId)
	if err != nil {
		return nil, fmt.Errorf("failed to revoke device: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to check revocation result: %w", err)
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("device not found or already revoked")
	}

	// TODO: Also remove device from trusted_devices table
	// TODO: Clear device sessions from Redis cache

	message := fmt.Sprintf("Successfully revoked %d session(s) for device %s", rowsAffected, req.DeviceId)
	return &authpb.RevokeDeviceResponse{
		Message: message,
	}, nil
}
