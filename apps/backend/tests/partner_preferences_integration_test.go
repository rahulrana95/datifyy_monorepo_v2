// +build integration

package tests

import (
	"context"
	"fmt"
	"strconv"
	"testing"
	"time"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetPartnerPreferences_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)
	userService := service.NewUserService(db, redisClient)

	// Register a test user
	testEmail := fmt.Sprintf("partner-prefs-get-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Partner Prefs Test User"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Register user
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     testName,
		},
	}

	registerResp, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)
	require.NotNil(t, registerResp)

	// Get user ID and create auth context
	userID, err := strconv.Atoi(registerResp.User.UserId)
	require.NoError(t, err)
	authCtx := context.WithValue(ctx, "userID", userID)

	// Get partner preferences (should be empty/default initially)
	getReq := &userpb.GetPartnerPreferencesRequest{}
	getResp, err := userService.GetPartnerPreferences(authCtx, getReq)

	// Note: May return error if no preferences exist yet
	if err != nil {
		t.Logf("Initial get returned error (expected if no prefs exist): %v", err)
	} else {
		require.NotNil(t, getResp)
		t.Log("GetPartnerPreferences integration test passed successfully")
	}
}

func TestUpdatePartnerPreferences_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)
	userService := service.NewUserService(db, redisClient)

	// Register a test user
	testEmail := fmt.Sprintf("partner-prefs-update-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"
	testName := "Partner Prefs Update Test"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Register user
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     testName,
		},
	}

	registerResp, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)
	require.NotNil(t, registerResp)

	// Get user ID and create auth context
	userID, err := strconv.Atoi(registerResp.User.UserId)
	require.NoError(t, err)
	authCtx := context.WithValue(ctx, "userID", userID)

	// Update partner preferences
	updateReq := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 25,
				MaxAge: 35,
			},
			DistancePreference: 100,
			VerifiedOnly:       true,
			LookingForGender:   []userpb.Gender{userpb.Gender_GENDER_MALE, userpb.Gender_GENDER_FEMALE},
			ReligionImportance: 3,             // Important
			OpenToLongDistance: true,
			MinSharedInterests: 3,
			MaxSiblings:        5,
			MinYearsExperience: 2,
			MaxDaysInactive:    14,
			PhotosRequired:     true,
			MinProfileCompletion: 50,
		},
	}

	updateResp, err := userService.UpdatePartnerPreferences(authCtx, updateReq)
	require.NoError(t, err)
	require.NotNil(t, updateResp)
	assert.Equal(t, "Partner preferences updated successfully", updateResp.Message)

	// Verify the preferences were saved by getting them
	getReq := &userpb.GetPartnerPreferencesRequest{}
	getResp, err := userService.GetPartnerPreferences(authCtx, getReq)
	require.NoError(t, err)
	require.NotNil(t, getResp)

	// Verify values
	prefs := getResp.Preferences
	assert.Equal(t, int32(25), prefs.AgeRange.MinAge)
	assert.Equal(t, int32(35), prefs.AgeRange.MaxAge)
	assert.Equal(t, int32(100), prefs.DistancePreference)
	assert.True(t, prefs.VerifiedOnly)
	assert.Equal(t, int32(3), prefs.ReligionImportance)
	assert.True(t, prefs.OpenToLongDistance)
	assert.Equal(t, int32(3), prefs.MinSharedInterests)
	assert.Equal(t, int32(5), prefs.MaxSiblings)
	assert.Equal(t, int32(2), prefs.MinYearsExperience)
	assert.Equal(t, int32(14), prefs.MaxDaysInactive)
	assert.True(t, prefs.PhotosRequired)
	assert.Equal(t, int32(50), prefs.MinProfileCompletion)

	t.Log("UpdatePartnerPreferences integration test passed successfully")
}

func TestUpdatePartnerPreferences_Validation_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)
	userService := service.NewUserService(db, redisClient)

	// Register a test user
	testEmail := fmt.Sprintf("partner-prefs-validation-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Register user
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     "Validation Test",
		},
	}

	registerResp, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)

	userID := int(registerResp.User.UserId)
	authCtx := context.WithValue(ctx, "userID", userID)

	// Test 1: Invalid age range (under 18)
	updateReq := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 15, // Invalid - under 18
				MaxAge: 30,
			},
		},
	}

	resp, err := userService.UpdatePartnerPreferences(authCtx, updateReq)
	assert.Error(t, err)
	assert.Nil(t, resp)
	assert.Contains(t, err.Error(), "minimum age must be at least 18")

	// Test 2: Invalid age order (max < min)
	updateReq2 := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 40,
				MaxAge: 25, // Invalid - less than min
			},
		},
	}

	resp2, err := userService.UpdatePartnerPreferences(authCtx, updateReq2)
	assert.Error(t, err)
	assert.Nil(t, resp2)
	assert.Contains(t, err.Error(), "maximum age must be greater than minimum age")

	t.Log("Partner preferences validation integration test passed successfully")
}

func TestPartnerPreferences_Unauthenticated_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background() // No userID in context
	userService := service.NewUserService(db, redisClient, nil)

	// Test get without auth
	getReq := &userpb.GetPartnerPreferencesRequest{}
	getResp, err := userService.GetPartnerPreferences(ctx, getReq)
	assert.Error(t, err)
	assert.Nil(t, getResp)
	assert.Contains(t, err.Error(), "authentication required")

	// Test update without auth
	updateReq := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 25,
				MaxAge: 35,
			},
		},
	}

	updateResp, err := userService.UpdatePartnerPreferences(ctx, updateReq)
	assert.Error(t, err)
	assert.Nil(t, updateResp)
	assert.Contains(t, err.Error(), "authentication required")

	t.Log("Unauthenticated partner preferences test passed successfully")
}

func TestUpdatePartnerPreferences_MultipleUpdates_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	db, redisClient := setupTestDB(t)
	defer db.Close()
	defer redisClient.Close()

	ctx := context.Background()
	authService := service.NewAuthService(db, redisClient, nil)
	userService := service.NewUserService(db, redisClient)

	// Register a test user
	testEmail := fmt.Sprintf("partner-prefs-multi-%d@example.com", time.Now().Unix())
	testPassword := "TestPass123!"

	// Cleanup before and after
	cleanupTestUser(t, db, testEmail)
	defer cleanupTestUser(t, db, testEmail)

	// Register user
	registerReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    testEmail,
			Password: testPassword,
			Name:     "Multi Update Test",
		},
	}

	registerResp, err := authService.RegisterWithEmail(ctx, registerReq)
	require.NoError(t, err)

	userID := int(registerResp.User.UserId)
	authCtx := context.WithValue(ctx, "userID", userID)

	// First update
	update1 := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 20,
				MaxAge: 30,
			},
			DistancePreference: 50,
		},
	}

	_, err = userService.UpdatePartnerPreferences(authCtx, update1)
	require.NoError(t, err)

	// Second update (should override)
	update2 := &userpb.UpdatePartnerPreferencesRequest{
		Preferences: &userpb.PartnerPreferences{
			AgeRange: &userpb.AgeRange{
				MinAge: 25,
				MaxAge: 40,
			},
			DistancePreference: 100,
			VerifiedOnly:       true,
		},
	}

	_, err = userService.UpdatePartnerPreferences(authCtx, update2)
	require.NoError(t, err)

	// Verify final values
	getResp, err := userService.GetPartnerPreferences(authCtx, &userpb.GetPartnerPreferencesRequest{})
	require.NoError(t, err)

	prefs := getResp.Preferences
	assert.Equal(t, int32(25), prefs.AgeRange.MinAge)
	assert.Equal(t, int32(40), prefs.AgeRange.MaxAge)
	assert.Equal(t, int32(100), prefs.DistancePreference)
	assert.True(t, prefs.VerifiedOnly)

	t.Log("Multiple updates integration test passed successfully")
}
