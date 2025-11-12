// +build e2e

package tests

import (
	"context"
	"fmt"
	"net"
	"testing"
	"time"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"
)

const bufSize = 1024 * 1024

// setupE2ETest creates a gRPC server and client for end-to-end testing
func setupE2ETest(t *testing.T) (userpb.UserServiceClient, func()) {
	// Setup database
	db, dbCleanup := setupIntegrationTest(t)

	// Create buffer connection
	lis := bufconn.Listen(bufSize)

	// Create gRPC server
	grpcServer := grpc.NewServer()
	userService := service.NewUserService(db, nil)
	userpb.RegisterUserServiceServer(grpcServer, userService)

	// Start server in goroutine
	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			t.Logf("Server exited with error: %v", err)
		}
	}()

	// Create dialer
	bufDialer := func(context.Context, string) (net.Conn, error) {
		return lis.Dial()
	}

	// Create client connection
	ctx := context.Background()
	conn, err := grpc.DialContext(
		ctx,
		"bufnet",
		grpc.WithContextDialer(bufDialer),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	require.NoError(t, err)

	// Create client
	client := userpb.NewUserServiceClient(conn)

	// Cleanup function
	cleanup := func() {
		conn.Close()
		grpcServer.Stop()
		lis.Close()
		dbCleanup()
	}

	return client, cleanup
}

func TestE2E_GetUserProfile(t *testing.T) {
	client, cleanup := setupE2ETest(t)
	defer cleanup()

	// Setup test data
	db, _ := setupIntegrationTest(t)
	userID := createTestUser(t, db, fmt.Sprintf("e2e-%d@example.com", time.Now().Unix()))

	ctx := context.Background()
	req := &userpb.GetUserProfileRequest{
		UserId: fmt.Sprintf("%d", userID),
	}

	// Act - Make gRPC call
	resp, err := client.GetUserProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, fmt.Sprintf("%d", userID), resp.Profile.UserId)
	assert.Equal(t, "Test User", resp.Profile.BasicInfo.Name)
	assert.NotNil(t, resp.Profile.Metadata)
	assert.NotNil(t, resp.Profile.PartnerPreferences)
}

func TestE2E_GetUserProfile_NotFound(t *testing.T) {
	client, cleanup := setupE2ETest(t)
	defer cleanup()

	ctx := context.Background()
	req := &userpb.GetUserProfileRequest{
		UserId: "999999", // Non-existent user
	}

	// Act
	resp, err := client.GetUserProfile(ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "user not found")
}

func TestE2E_UpdateProfile(t *testing.T) {
	client, cleanup := setupE2ETest(t)
	defer cleanup()

	// Setup test data
	db, _ := setupIntegrationTest(t)
	userID := createTestUser(t, db, fmt.Sprintf("e2e-update-%d@example.com", time.Now().Unix()))

	// Mock authentication (in real scenario, this would be via JWT interceptor)
	ctx := context.WithValue(context.Background(), "userID", userID)

	req := &userpb.UpdateProfileRequest{
		ProfileDetails: &userpb.ProfileDetails{
			Bio:     "E2E test bio",
			Company: "E2E Company",
		},
		UpdateFields: []string{"bio", "company"},
	}

	// Act
	resp, err := client.UpdateProfile(ctx, req)

	// Assert
	require.NoError(t, err)
	require.NotNil(t, resp)
	assert.Equal(t, "Profile updated successfully", resp.Message)
	assert.NotNil(t, resp.Profile)
}

func TestE2E_FullUserJourney(t *testing.T) {
	client, cleanup := setupE2ETest(t)
	defer cleanup()

	// Setup test data
	db, _ := setupIntegrationTest(t)
	userID1 := createTestUser(t, db, fmt.Sprintf("journey1-%d@example.com", time.Now().Unix()))
	userID2 := createTestUser(t, db, fmt.Sprintf("journey2-%d@example.com", time.Now().Unix()))

	ctx := context.WithValue(context.Background(), "userID", userID1)

	// Step 1: Get own profile
	t.Run("GetMyProfile", func(t *testing.T) {
		req := &userpb.GetMyProfileRequest{}
		resp, err := client.GetMyProfile(ctx, req)
		require.NoError(t, err)
		require.NotNil(t, resp)
		assert.Equal(t, fmt.Sprintf("%d", userID1), resp.Profile.UserId)
	})

	// Step 2: Update profile
	t.Run("UpdateProfile", func(t *testing.T) {
		req := &userpb.UpdateProfileRequest{
			ProfileDetails: &userpb.ProfileDetails{
				Bio:     "Journey test bio",
				Company: "Journey Company",
				Height:  175,
			},
			LifestyleInfo: &userpb.LifestyleInfo{
				Drinking: userpb.DrinkingHabit_DRINKING_SOCIALLY,
				Smoking:  userpb.SmokingHabit_SMOKING_NEVER,
			},
			UpdateFields: []string{"bio", "company", "height", "drinking", "smoking"},
		}
		resp, err := client.UpdateProfile(ctx, req)
		require.NoError(t, err)
		assert.Equal(t, "Profile updated successfully", resp.Message)
	})

	// Step 3: Update partner preferences
	t.Run("UpdatePartnerPreferences", func(t *testing.T) {
		req := &userpb.UpdatePartnerPreferencesRequest{
			Preferences: &userpb.PartnerPreferences{
				AgeRange: &userpb.AgeRange{
					MinAge: 22,
					MaxAge: 32,
				},
				DistancePreference: 75,
				VerifiedOnly:       true,
			},
		}
		resp, err := client.UpdatePartnerPreferences(ctx, req)
		require.NoError(t, err)
		assert.Equal(t, "Partner preferences updated successfully", resp.Message)
	})

	// Step 4: Update user preferences
	t.Run("UpdateUserPreferences", func(t *testing.T) {
		req := &userpb.UpdateUserPreferencesRequest{
			Preferences: &userpb.UserPreferences{
				Notifications: &userpb.NotificationPreferences{
					PushEnabled: false,
				},
				Privacy: &userpb.PrivacyPreferences{
					IncognitoMode: false,
				},
				Theme: "dark",
			},
		}
		resp, err := client.UpdateUserPreferences(ctx, req)
		require.NoError(t, err)
		assert.Equal(t, "User preferences updated successfully", resp.Message)
	})

	// Step 5: Block another user
	t.Run("BlockUser", func(t *testing.T) {
		req := &userpb.BlockUserRequest{
			UserId: fmt.Sprintf("%d", userID2),
			Reason: "Test block",
		}
		resp, err := client.BlockUser(ctx, req)
		require.NoError(t, err)
		assert.True(t, resp.Success)
	})

	// Step 6: List blocked users
	t.Run("ListBlockedUsers", func(t *testing.T) {
		req := &userpb.ListBlockedUsersRequest{
			Pagination: &userpb.PaginationRequest{
				Page:     1,
				PageSize: 20,
			},
		}
		resp, err := client.ListBlockedUsers(ctx, req)
		require.NoError(t, err)
		assert.GreaterOrEqual(t, len(resp.Users), 1)
	})

	// Step 7: Unblock user
	t.Run("UnblockUser", func(t *testing.T) {
		req := &userpb.UnblockUserRequest{
			UserId: fmt.Sprintf("%d", userID2),
		}
		resp, err := client.UnblockUser(ctx, req)
		require.NoError(t, err)
		assert.True(t, resp.Success)
	})

	// Step 8: Report user
	t.Run("ReportUser", func(t *testing.T) {
		req := &userpb.ReportUserRequest{
			UserId:  fmt.Sprintf("%d", userID2),
			Reason:  userpb.ReportReason_REPORT_REASON_SPAM,
			Details: "E2E test report",
		}
		resp, err := client.ReportUser(ctx, req)
		require.NoError(t, err)
		assert.NotEmpty(t, resp.ReportId)
	})

	// Step 9: Search users
	t.Run("SearchUsers", func(t *testing.T) {
		req := &userpb.SearchUsersRequest{
			Filters: &userpb.SearchFilters{
				AgeRange: &userpb.AgeRange{
					MinAge: 20,
					MaxAge: 40,
				},
			},
			Pagination: &userpb.PaginationRequest{
				Page:     1,
				PageSize: 10,
			},
		}
		resp, err := client.SearchUsers(ctx, req)
		require.NoError(t, err)
		assert.NotNil(t, resp)
	})

	// Step 10: Get recommendations
	t.Run("GetRecommendations", func(t *testing.T) {
		req := &userpb.GetRecommendationsRequest{
			Limit: 5,
		}
		resp, err := client.GetRecommendations(ctx, req)
		require.NoError(t, err)
		assert.NotNil(t, resp)
	})
}

func TestE2E_PhotoManagement(t *testing.T) {
	client, cleanup := setupE2ETest(t)
	defer cleanup()

	// Setup test data
	db, _ := setupIntegrationTest(t)
	userID := createTestUser(t, db, fmt.Sprintf("e2e-photos-%d@example.com", time.Now().Unix()))

	ctx := context.WithValue(context.Background(), "userID", userID)

	// Upload photo
	var photoID string
	t.Run("UploadPhoto", func(t *testing.T) {
		req := &userpb.UploadProfilePhotoRequest{
			PhotoData:   []byte("fake-photo-data-e2e"),
			ContentType: "image/jpeg",
			IsPrimary:   true,
			Order:       1,
			Caption:     "E2E test photo",
		}
		resp, err := client.UploadProfilePhoto(ctx, req)
		require.NoError(t, err)
		require.NotNil(t, resp)
		assert.NotEmpty(t, resp.Photo.PhotoId)
		assert.NotEmpty(t, resp.Photo.Url)
		photoID = resp.Photo.PhotoId
	})

	// Delete photo
	t.Run("DeletePhoto", func(t *testing.T) {
		req := &userpb.DeleteProfilePhotoRequest{
			PhotoId: photoID,
		}
		resp, err := client.DeleteProfilePhoto(ctx, req)
		require.NoError(t, err)
		assert.True(t, resp.Success)
	})
}

func TestE2E_ErrorHandling(t *testing.T) {
	client, cleanup := setupE2ETest(t)
	defer cleanup()

	ctx := context.Background()

	// Test invalid user ID format
	t.Run("InvalidUserIDFormat", func(t *testing.T) {
		req := &userpb.GetUserProfileRequest{
			UserId: "not-a-number",
		}
		resp, err := client.GetUserProfile(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Contains(t, err.Error(), "invalid user_id format")
	})

	// Test missing required fields
	t.Run("MissingUserID", func(t *testing.T) {
		req := &userpb.GetUserProfileRequest{
			UserId: "",
		}
		resp, err := client.GetUserProfile(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Contains(t, err.Error(), "user_id is required")
	})

	// Test invalid age range
	t.Run("InvalidAgeRange", func(t *testing.T) {
		req := &userpb.UpdatePartnerPreferencesRequest{
			Preferences: &userpb.PartnerPreferences{
				AgeRange: &userpb.AgeRange{
					MinAge: 15, // Below 18
					MaxAge: 25,
				},
			},
		}
		resp, err := client.UpdatePartnerPreferences(ctx, req)
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Contains(t, err.Error(), "minimum age must be at least 18")
	})
}
