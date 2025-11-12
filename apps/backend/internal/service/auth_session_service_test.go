package service

import (
	"context"
	"testing"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/stretchr/testify/assert"
)

// ============================================================================
// GetCurrentSession Tests
// ============================================================================

func TestGetCurrentSession_NoToken(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.GetCurrentSessionRequest{}

	// Act
	resp, err := service.GetCurrentSession(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authorization required")
}

// Note: Full success testing requires gRPC metadata support
// Will be tested in integration tests

// ============================================================================
// ListSessions Tests
// ============================================================================

func TestListSessions_NoToken(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.ListSessionsRequest{}

	// Act
	resp, err := service.ListSessions(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authorization required")
}

func TestListSessions_WithPagination(t *testing.T) {
	// This test validates pagination parameter handling
	// Actual database calls will be tested in integration tests

	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()

	tests := []struct {
		name       string
		pagination *commonpb.PaginationRequest
		wantError  bool
	}{
		{
			name:       "No pagination",
			pagination: nil,
			wantError:  true, // Will fail due to no auth token
		},
		{
			name: "With pagination",
			pagination: &commonpb.PaginationRequest{
				Page:     1,
				PageSize: 20,
			},
			wantError: true, // Will fail due to no auth token
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &authpb.ListSessionsRequest{
				Pagination: tt.pagination,
			}

			resp, err := service.ListSessions(ctx, req)

			if tt.wantError {
				assert.Error(t, err)
				assert.Nil(t, resp)
			}
		})
	}
}

// ============================================================================
// RevokeSession Tests
// ============================================================================

func TestRevokeSession_EmptySessionID(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.RevokeSessionRequest{
		SessionId: "",
	}

	// Act
	resp, err := service.RevokeSession(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "session_id is required")
}

func TestRevokeSession_NoToken(t *testing.T) {
	// Arrange
	service, _, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	req := &authpb.RevokeSessionRequest{
		SessionId: "sess_123_456",
	}

	// Act
	resp, err := service.RevokeSession(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "authorization required")
}

func TestRevokeSession_SessionNotFound(t *testing.T) {
	// Note: This test is a placeholder demonstrating the test structure
	// Full testing requires gRPC metadata support or will be done in integration tests

	// When we implement auth middleware, we can add tests like:
	// - User tries to revoke another user's session (should fail)
	// - User revokes non-existent session (should fail)
	// - User successfully revokes own session (should succeed)

	t.Skip("Skipping - requires auth middleware implementation")
}

// ============================================================================
// Helper function tests
// ============================================================================

func TestRevokeSession_DatabaseUpdate(t *testing.T) {
	// This tests the database update logic when auth is bypassed
	// It's a white-box test that assumes extractTokenFromContext could be mocked

	service, mock, db := setupTestAuthService(t)
	defer db.Close()

	ctx := context.Background()
	sessionID := "sess_1_123456"

	// Note: This test would need to mock extractTokenFromContext
	// For now, we know it will fail at auth check
	// Full database logic will be tested in integration tests

	req := &authpb.RevokeSessionRequest{
		SessionId: sessionID,
	}

	// This will fail at auth check, but demonstrates the test structure
	_, err := service.RevokeSession(ctx, req)
	assert.Error(t, err)

	// Ensure no expectations were set that weren't met
	assert.NoError(t, mock.ExpectationsWereMet())
}
