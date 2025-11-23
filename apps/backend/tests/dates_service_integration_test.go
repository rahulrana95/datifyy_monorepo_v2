// +build integration

package tests

import (
	"context"
	"database/sql"
	"os"
	"testing"
	"time"

	"github.com/datifyy/backend/internal/service"
	"github.com/redis/go-redis/v9"
	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupDatesServiceTest(t *testing.T) (*sql.DB, *service.DatesService, func()) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}

	db, err := sql.Open("postgres", dbURL)
	require.NoError(t, err)

	err = db.Ping()
	require.NoError(t, err)

	// Setup Redis client
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	redisOpts, err := redis.ParseURL(redisURL)
	require.NoError(t, err)
	redisClient := redis.NewClient(redisOpts)

	// Create DatesService
	datesService, err := service.NewDatesService(db, redisClient)
	require.NoError(t, err)

	cleanup := func() {
		// Cleanup test data
		db.Exec("DELETE FROM curated_matches WHERE user1_id IN (SELECT id FROM users WHERE email LIKE 'test_curation_%@test.com')")
		db.Exec("DELETE FROM date_suggestions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_curation_%@test.com')")
		db.Exec("DELETE FROM date_rejections WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_curation_%@test.com')")
		db.Exec("DELETE FROM availability_slots WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_curation_%@test.com')")
		db.Exec("DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_curation_%@test.com')")
		db.Exec("DELETE FROM partner_preferences WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_curation_%@test.com')")
		db.Exec("DELETE FROM users WHERE email LIKE 'test_curation_%@test.com'")
		datesService.Close()
		db.Close()
		redisClient.Close()
	}

	return db, datesService, cleanup
}

func createTestUserWithAvailability(t *testing.T, db *sql.DB, email, name, gender string, age int, availableTomorrow bool) int {
	ctx := context.Background()

	// Calculate date of birth from age
	dob := time.Now().AddDate(-age, 0, 0)

	// Create user
	var userID int
	err := db.QueryRowContext(ctx, `
		INSERT INTO users (email, name, password_hash, gender, date_of_birth, account_status, email_verified)
		VALUES ($1, $2, $3, $4, $5, 'ACTIVE', true)
		RETURNING id
	`, email, name, "hashedpassword", gender, dob).Scan(&userID)
	require.NoError(t, err)

	// Create profile
	_, err = db.ExecContext(ctx, `
		INSERT INTO user_profiles (
			user_id, bio, occupation, education, interests,
			drinking, smoking, workout, dietary_preference,
			completion_percentage, is_public
		) VALUES (
			$1, $2, $3::jsonb, $4::jsonb, $5::jsonb,
			$6, $7, $8, $9,
			75, true
		)
	`, userID, "Test bio",
		`{"title": "Software Engineer"}`,
		`{"level": "Bachelor's"}`,
		`["coding", "hiking", "reading"]`,
		"Socially", "Never", "Regularly", "Vegetarian")
	require.NoError(t, err)

	// Create partner preferences
	_, err = db.ExecContext(ctx, `
		INSERT INTO partner_preferences (
			user_id, age_range_min, age_range_max,
			looking_for_gender, distance_preference,
			drinking_preferences, smoking_preferences, workout_preferences
		) VALUES (
			$1, $2, $3,
			$4::jsonb, 50,
			$5::jsonb, $6::jsonb, $7::jsonb
		)
	`, userID, age-5, age+5,
		`["MALE", "FEMALE"]`,
		`["Socially", "Never"]`,
		`["Never"]`,
		`["Regularly", "Sometimes"]`)
	require.NoError(t, err)

	// Add availability for tomorrow if requested
	if availableTomorrow {
		tomorrow := time.Now().AddDate(0, 0, 1)
		startOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 18, 0, 0, 0, tomorrow.Location())

		_, err = db.ExecContext(ctx, `
			INSERT INTO availability_slots (user_id, start_time, end_time)
			VALUES ($1, $2, $3)
		`, userID, startOfDay.Unix(), startOfDay.Add(2*time.Hour).Unix())
		require.NoError(t, err)
	}

	return userID
}

func TestGetCandidatesForCuration(t *testing.T) {
	db, datesService, cleanup := setupDatesServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users
	// User with availability tomorrow
	user1ID := createTestUserWithAvailability(t, db, "test_curation_1@test.com", "Alice", "FEMALE", 28, true)

	// User with availability tomorrow
	user2ID := createTestUserWithAvailability(t, db, "test_curation_2@test.com", "Bob", "MALE", 30, true)

	// User without availability tomorrow
	_ = createTestUserWithAvailability(t, db, "test_curation_3@test.com", "Charlie", "MALE", 25, false)

	// Test: Get candidates for curation
	candidates, err := datesService.GetCandidatesForCuration(ctx)
	require.NoError(t, err)

	// Should return only users with availability tomorrow
	assert.GreaterOrEqual(t, len(candidates), 2, "Should have at least 2 candidates with availability")

	// Verify user1 is in candidates
	found1 := false
	found2 := false
	for _, c := range candidates {
		if c.UserID == user1ID {
			found1 = true
			assert.Equal(t, "Alice", c.Name)
			assert.Equal(t, "FEMALE", c.Gender)
			assert.Equal(t, 28, c.Age)
			assert.True(t, c.EmailVerified)
			assert.GreaterOrEqual(t, c.AvailableSlotsCount, 1)
		}
		if c.UserID == user2ID {
			found2 = true
			assert.Equal(t, "Bob", c.Name)
			assert.Equal(t, "MALE", c.Gender)
		}
	}

	assert.True(t, found1, "User1 should be in candidates")
	assert.True(t, found2, "User2 should be in candidates")
}

func TestAnalyzeCompatibility(t *testing.T) {
	// Skip if GEMINI_API_KEY not set
	if os.Getenv("GEMINI_API_KEY") == "" {
		t.Skip("GEMINI_API_KEY not set, skipping AI compatibility test")
	}

	db, datesService, cleanup := setupDatesServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users with different profiles
	user1ID := createTestUserWithAvailability(t, db, "test_curation_match1@test.com", "Alice", "FEMALE", 28, true)
	user2ID := createTestUserWithAvailability(t, db, "test_curation_match2@test.com", "Bob", "MALE", 30, true)
	user3ID := createTestUserWithAvailability(t, db, "test_curation_match3@test.com", "Charlie", "MALE", 45, true)

	// Test: Analyze compatibility
	matches, err := datesService.AnalyzeCompatibility(ctx, user1ID, []int{user2ID, user3ID}, 1)
	require.NoError(t, err)

	assert.Len(t, matches, 2, "Should return compatibility for both candidates")

	for _, match := range matches {
		// Verify match structure
		assert.NotEmpty(t, match.Name, "Match should have name")
		assert.Greater(t, match.Age, 0, "Match should have age")
		assert.NotEmpty(t, match.Gender, "Match should have gender")
		assert.GreaterOrEqual(t, match.CompatibilityScore, 0.0, "Score should be >= 0")
		assert.LessOrEqual(t, match.CompatibilityScore, 100.0, "Score should be <= 100")
		assert.NotEmpty(t, match.Reasoning, "Should have reasoning")

		// If score >= 60, should be marked as match
		if match.CompatibilityScore >= 60.0 {
			assert.True(t, match.IsMatch, "High score should be marked as match")
		}

		t.Logf("Compatibility with %s (age %d): %.2f%% - IsMatch: %v",
			match.Name, match.Age, match.CompatibilityScore, match.IsMatch)
		t.Logf("Reasoning: %s", match.Reasoning)
		t.Logf("Matched aspects: %v", match.MatchedAspects)
		t.Logf("Mismatched aspects: %v", match.MismatchedAspects)
	}

	// Verify curated match was saved in database
	var savedMatchCount int
	err = db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM curated_matches
		WHERE user1_id = $1 OR user2_id = $1
	`, user1ID).Scan(&savedMatchCount)
	require.NoError(t, err)
	assert.Equal(t, 2, savedMatchCount, "Should have saved 2 curated matches")
}

func TestAnalyzeCompatibility_ExistingMatch(t *testing.T) {
	db, datesService, cleanup := setupDatesServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test users
	user1ID := createTestUserWithAvailability(t, db, "test_curation_existing1@test.com", "Alice", "FEMALE", 28, true)
	user2ID := createTestUserWithAvailability(t, db, "test_curation_existing2@test.com", "Bob", "MALE", 30, true)

	// Create existing curated match
	_, err := db.ExecContext(ctx, `
		INSERT INTO curated_matches (
			user1_id, user2_id, compatibility_score, is_match,
			reasoning, matched_aspects, mismatched_aspects,
			ai_provider, ai_model, status, created_by_admin
		) VALUES (
			$1, $2, 85.5, true,
			'Existing match reasoning',
			ARRAY['shared interests', 'compatible lifestyle'],
			ARRAY['age difference'],
			'gemini', 'gemini-1.5-flash', 'pending', 1
		)
	`, user1ID, user2ID)
	require.NoError(t, err)

	// Test: Analyze compatibility should return existing match
	matches, err := datesService.AnalyzeCompatibility(ctx, user1ID, []int{user2ID}, 1)
	require.NoError(t, err)

	assert.Len(t, matches, 1, "Should return 1 match")
	assert.Equal(t, 85.5, matches[0].CompatibilityScore, "Should return existing compatibility score")
	assert.Equal(t, "Existing match reasoning", matches[0].Reasoning, "Should return existing reasoning")
	assert.True(t, matches[0].IsMatch, "Should return existing match status")
}

func TestAnalyzeCompatibility_SelfMatch(t *testing.T) {
	db, datesService, cleanup := setupDatesServiceTest(t)
	defer cleanup()

	ctx := context.Background()

	// Create test user
	userID := createTestUserWithAvailability(t, db, "test_curation_self@test.com", "Alice", "FEMALE", 28, true)

	// Test: Try to match with self - should be skipped
	matches, err := datesService.AnalyzeCompatibility(ctx, userID, []int{userID}, 1)
	require.NoError(t, err)

	assert.Len(t, matches, 0, "Should not match user with themselves")
}
