package service

import (
	"context"
	"testing"

	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSearchUsers_Success(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()

	req := &userpb.SearchUsersRequest{
		Filters: &userpb.SearchFilters{
			Gender: []userpb.Gender{userpb.Gender_GENDER_FEMALE},
			AgeRange: &userpb.AgeRange{
				MinAge: 21,
				MaxAge: 35,
			},
			Distance: 50,
		},
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 20,
		},
	}

	// Act
	resp, err := service.SearchUsers(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Users)
	assert.NotNil(t, resp.Pagination)
	assert.Equal(t, int32(1), resp.Pagination.Page)
	assert.Equal(t, int32(20), resp.Pagination.PageSize)
}

func TestSearchUsers_DefaultPagination(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()

	req := &userpb.SearchUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     0, // Invalid
			PageSize: 0, // Invalid
		},
	}

	// Act
	resp, err := service.SearchUsers(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, int32(1), resp.Pagination.Page)
	assert.Equal(t, int32(20), resp.Pagination.PageSize)
}

func TestSearchUsers_MaxPageSize(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.Background()

	req := &userpb.SearchUsersRequest{
		Pagination: &commonpb.PaginationRequest{
			Page:     1,
			PageSize: 200, // Over limit
		},
	}

	// Act
	resp, err := service.SearchUsers(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, int32(20), resp.Pagination.PageSize) // Capped at 20
}

func TestGetRecommendations_Success(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	req := &userpb.GetRecommendationsRequest{
		Limit: 10,
	}

	// Act
	resp, err := service.GetRecommendations(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Recommendations)
	assert.Equal(t, int32(0), resp.TotalCount) // Placeholder returns 0
}

func TestGetRecommendations_DefaultLimit(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	req := &userpb.GetRecommendationsRequest{
		Limit: 0, // Should use default
	}

	// Act
	resp, err := service.GetRecommendations(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	// Placeholder implementation returns empty, but doesn't error
}

func TestGetRecommendations_LargeLimit(t *testing.T) {
	service, _, db := setupTestUserService(t)
	defer db.Close()

	ctx := context.WithValue(context.Background(), "userID", 1)

	req := &userpb.GetRecommendationsRequest{
		Limit: 100,
	}

	// Act
	resp, err := service.GetRecommendations(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.NotNil(t, resp.Recommendations)
}
