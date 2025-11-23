package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/datifyy/backend/internal/ai"
	"github.com/datifyy/backend/internal/repository"
	"github.com/redis/go-redis/v9"
)

// DatesService handles curated dates and matching
type DatesService struct {
	db                   *sql.DB
	redis                *redis.Client
	aiProvider           ai.AIProvider
	curatedMatchesRepo   *repository.CuratedMatchesRepository
	suggestionsRepo      *repository.DateSuggestionsRepository
	adminRepo            *repository.AdminRepository
	userRepo             *repository.UserRepository
	profileRepo          *repository.UserProfileRepository
	availabilityRepo     *repository.AvailabilityRepository
}

// NewDatesService creates a new DatesService
func NewDatesService(db *sql.DB, redisClient *redis.Client) (*DatesService, error) {
	// Initialize AI provider (optional - only if API key is set)
	var aiProvider ai.AIProvider
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey != "" {
		ctx := context.Background()
		aiConfig := ai.Config{
			Provider: "gemini",
			APIKey:   apiKey,
			Model:    "gemini-2.5-flash",
		}

		var err error
		aiProvider, err = ai.NewAIProvider(ctx, aiConfig)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize AI provider: %w", err)
		}
		log.Printf("AI provider initialized: %s", aiProvider.GetProviderName())
	} else {
		log.Printf("GEMINI_API_KEY not set - AI compatibility analysis will not be available")
	}

	return &DatesService{
		db:                   db,
		redis:                redisClient,
		aiProvider:           aiProvider,
		curatedMatchesRepo:   repository.NewCuratedMatchesRepository(db),
		suggestionsRepo:      repository.NewDateSuggestionsRepository(db),
		adminRepo:            repository.NewAdminRepository(db),
		userRepo:             repository.NewUserRepository(db),
		profileRepo:          repository.NewUserProfileRepository(db),
		availabilityRepo:     repository.NewAvailabilityRepository(db),
	}, nil
}

// Close closes the AI provider connection
func (s *DatesService) Close() error {
	if s.aiProvider != nil {
		return s.aiProvider.Close()
	}
	return nil
}

// CandidateUser represents a user candidate for curation
type CandidateUser struct {
	UserID            int       `json:"user_id"`
	Email             string    `json:"email"`
	Name              string    `json:"name"`
	Age               int       `json:"age"`
	Gender            string    `json:"gender"`
	ProfileCompletion int       `json:"profile_completion"`
	EmailVerified     bool      `json:"email_verified"`
	AadharVerified    bool      `json:"aadhar_verified"`
	WorkEmailVerified bool      `json:"work_email_verified"`
	AvailableSlotsCount int     `json:"available_slots_count"`
	NextAvailableDate *time.Time `json:"next_available_date,omitempty"`
}

// GetCandidatesForCuration returns users available for dates day after tomorrow onwards
func (s *DatesService) GetCandidatesForCuration(ctx context.Context) ([]*CandidateUser, error) {
	// Get day after tomorrow's date range (starting point)
	dayAfterTomorrow := time.Now().AddDate(0, 0, 2)
	startOfDay := time.Date(dayAfterTomorrow.Year(), dayAfterTomorrow.Month(), dayAfterTomorrow.Day(), 0, 0, 0, 0, dayAfterTomorrow.Location())

	// Query for users with availability from day after tomorrow onwards
	query := `
		SELECT
			u.id,
			u.email,
			u.name,
			EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.date_of_birth))::INTEGER as age,
			COALESCE(u.gender, '') as gender,
			COALESCE(up.completion_percentage, 0) as profile_completion,
			u.email_verified,
			COUNT(avail.id) as available_slots_count,
			MIN(avail.start_time) as next_available_date
		FROM users u
		LEFT JOIN user_profiles up ON u.id = up.user_id
		LEFT JOIN availability_slots avail ON u.id = avail.user_id
		WHERE u.account_status = 'ACTIVE'
			AND avail.start_time >= $1
		GROUP BY u.id, u.email, u.name, u.date_of_birth, u.gender, up.completion_percentage,
				 u.email_verified
		HAVING COUNT(avail.id) > 0
		ORDER BY u.created_at DESC
	`

	rows, err := s.db.QueryContext(ctx, query, startOfDay.Unix())
	if err != nil {
		return nil, fmt.Errorf("failed to get candidates: %w", err)
	}
	defer rows.Close()

	var candidates []*CandidateUser
	for rows.Next() {
		candidate := &CandidateUser{}
		var nextAvailUnix sql.NullInt64

		err := rows.Scan(
			&candidate.UserID,
			&candidate.Email,
			&candidate.Name,
			&candidate.Age,
			&candidate.Gender,
			&candidate.ProfileCompletion,
			&candidate.EmailVerified,
			&candidate.AvailableSlotsCount,
			&nextAvailUnix,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan candidate: %w", err)
		}

		// Set verification fields (to be implemented in schema later)
		candidate.AadharVerified = false
		candidate.WorkEmailVerified = false

		if nextAvailUnix.Valid {
			t := time.Unix(nextAvailUnix.Int64, 0)
			candidate.NextAvailableDate = &t
		}

		candidates = append(candidates, candidate)
	}

	return candidates, nil
}

// MatchCandidate represents a potential match with compatibility
type MatchCandidate struct {
	UserID             int      `json:"user_id"`
	Name               string   `json:"name"`
	Age                int      `json:"age"`
	Gender             string   `json:"gender"`
	CompatibilityScore float64  `json:"compatibility_score"`
	IsMatch            bool     `json:"is_match"`
	Reasoning          string   `json:"reasoning"`
	MatchedAspects     []string `json:"matched_aspects"`
	MismatchedAspects  []string `json:"mismatched_aspects"`
}

// AnalyzeCompatibility analyzes compatibility between a user and potential matches
func (s *DatesService) AnalyzeCompatibility(ctx context.Context, userID int, candidateIDs []int, adminID int) ([]*MatchCandidate, error) {
	// Check if AI provider is available
	if s.aiProvider == nil {
		return nil, fmt.Errorf("AI provider not initialized - GEMINI_API_KEY must be set")
	}

	// Get user basic info, profile and preferences
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	userProfile, err := s.profileRepo.GetProfileByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user profile: %w", err)
	}

	userPrefs, err := s.profileRepo.GetPartnerPreferences(ctx, userID)
	if err != nil {
		log.Printf("No preferences found for user %d, using defaults", userID)
		userPrefs = &repository.PartnerPreferences{
			UserID: userID,
		}
	}

	var matches []*MatchCandidate

	for _, candidateID := range candidateIDs {
		// Skip if trying to match with self
		if candidateID == userID {
			continue
		}

		// Check if match already exists
		existingMatch, err := s.curatedMatchesRepo.GetByUserPair(ctx, userID, candidateID)
		if err != nil {
			log.Printf("Error checking existing match: %v", err)
		}
		if existingMatch != nil {
			// Return existing match
			matches = append(matches, &MatchCandidate{
				UserID:             candidateID,
				CompatibilityScore: existingMatch.CompatibilityScore,
				IsMatch:            existingMatch.IsMatch,
				Reasoning:          existingMatch.Reasoning,
				MatchedAspects:     existingMatch.MatchedAspects,
				MismatchedAspects:  existingMatch.MismatchedAspects,
			})
			continue
		}

		// Get candidate basic info, profile and preferences
		candidate, err := s.userRepo.GetByID(ctx, candidateID)
		if err != nil {
			log.Printf("Failed to get candidate %d: %v", candidateID, err)
			continue
		}

		candidateProfile, err := s.profileRepo.GetProfileByUserID(ctx, candidateID)
		if err != nil {
			log.Printf("Failed to get profile for candidate %d: %v", candidateID, err)
			continue
		}

		candidatePrefs, err := s.profileRepo.GetPartnerPreferences(ctx, candidateID)
		if err != nil {
			log.Printf("No preferences found for candidate %d, using defaults", candidateID)
			candidatePrefs = &repository.PartnerPreferences{
				UserID: candidateID,
			}
		}

		// Build AI compatibility request
		aiReq := ai.CompatibilityRequest{
			User1Profile: s.profileToAIProfile(user, userProfile),
			User1Preferences: s.preferencesToAIPreferences(userPrefs),
			User2Profile: s.profileToAIProfile(candidate, candidateProfile),
			User2Preferences: s.preferencesToAIPreferences(candidatePrefs),
		}

		// Call AI to analyze compatibility
		aiResp, err := s.aiProvider.CalculateCompatibility(ctx, aiReq)
		if err != nil {
			log.Printf("AI compatibility analysis failed for users %d and %d: %v", userID, candidateID, err)
			continue
		}

		// Store curated match in database
		curatedMatch := &repository.CuratedMatch{
			User1ID:            userID,
			User2ID:            candidateID,
			CompatibilityScore: aiResp.CompatibilityScore,
			IsMatch:            aiResp.IsMatch,
			Reasoning:          aiResp.Reasoning,
			MatchedAspects:     aiResp.MatchedAspects,
			MismatchedAspects:  aiResp.MismatchedAspects,
			AIProvider:         s.aiProvider.GetProviderName(),
			AIModel:            "gemini-1.5-flash",
			Status:             "pending",
			CreatedByAdmin:     &adminID,
		}

		err = s.curatedMatchesRepo.Create(ctx, curatedMatch)
		if err != nil {
			log.Printf("Failed to save curated match: %v", err)
			// Continue even if save fails
		}

		// Calculate age from date of birth
		age := 0
		if candidate.DateOfBirth.Valid {
			age = calculateAge(candidate.DateOfBirth.Time)
		}

		// Get gender from candidate
		gender := ""
		if candidate.Gender.Valid {
			gender = candidate.Gender.String
		}

		matches = append(matches, &MatchCandidate{
			UserID:             candidateID,
			Name:               candidate.Name,
			Age:                age,
			Gender:             gender,
			CompatibilityScore: aiResp.CompatibilityScore,
			IsMatch:            aiResp.IsMatch,
			Reasoning:          aiResp.Reasoning,
			MatchedAspects:     aiResp.MatchedAspects,
			MismatchedAspects:  aiResp.MismatchedAspects,
		})
	}

	return matches, nil
}

// Helper function to convert repository profile to AI profile
func (s *DatesService) profileToAIProfile(user *repository.User, profile *repository.UserProfile) ai.UserProfile {
	// Calculate age from date of birth
	age := 0
	if user.DateOfBirth.Valid {
		age = calculateAge(user.DateOfBirth.Time)
	}

	// Get gender
	gender := ""
	if user.Gender.Valid {
		gender = user.Gender.String
	}

	// Parse JSONB interests
	interests := parseJSONBStringArray(profile.Interests)

	// Parse JSONB location
	location := parseJSONBLocation(profile.Location)

	// Get bio
	bio := ""
	if profile.Bio.Valid {
		bio = profile.Bio.String
	}

	// Parse occupation from JSONB
	occupation := parseJSONBOccupation(profile.Occupation)

	// Parse education from JSONB
	education := parseJSONBEducation(profile.Education)

	// Build lifestyle string from various fields
	lifestyle := buildLifestyleString(profile)

	return ai.UserProfile{
		UserID:     fmt.Sprintf("%d", profile.UserID),
		Name:       user.Name,
		Age:        age,
		Gender:     gender,
		Location:   location,
		Bio:        bio,
		Interests:  interests,
		Occupation: occupation,
		Education:  education,
		Lifestyle:  lifestyle,
	}
}

// Helper function to convert repository preferences to AI preferences
func (s *DatesService) preferencesToAIPreferences(prefs *repository.PartnerPreferences) ai.PartnerPreferences {
	return ai.PartnerPreferences{
		AgeMin:             prefs.AgeRangeMin,
		AgeMax:             prefs.AgeRangeMax,
		GenderPreference:   string(prefs.LookingForGender),
		LocationPreference: parseJSONBStringArray(prefs.LocationPreferences),
		InterestsPreferred: parseJSONBStringArray(prefs.InterestPreferences),
		EducationPreference: parseJSONBStringArray(prefs.EducationLevels),
		LifestylePreference: buildLifestylePreferences(prefs),
	}
}

// =============================================================================
// JSONB Parsing Helper Functions
// =============================================================================

// parseJSONBStringArray parses a JSONB byte array to []string
func parseJSONBStringArray(jsonbData []byte) []string {
	if len(jsonbData) == 0 {
		return []string{}
	}

	var result []string
	err := json.Unmarshal(jsonbData, &result)
	if err != nil {
		log.Printf("Failed to parse JSONB string array: %v", err)
		return []string{}
	}

	return result
}

// parseJSONBLocation parses JSONB location data to a string
func parseJSONBLocation(jsonbData []byte) string {
	if len(jsonbData) == 0 {
		return ""
	}

	var location map[string]interface{}
	err := json.Unmarshal(jsonbData, &location)
	if err != nil {
		return ""
	}

	// Try to build location string from common fields
	city, _ := location["city"].(string)
	state, _ := location["state"].(string)
	country, _ := location["country"].(string)

	parts := []string{}
	if city != "" {
		parts = append(parts, city)
	}
	if state != "" {
		parts = append(parts, state)
	}
	if country != "" {
		parts = append(parts, country)
	}

	if len(parts) > 0 {
		return fmt.Sprintf("%s", parts[0])
	}

	return ""
}

// parseJSONBOccupation parses JSONB occupation data to a string
func parseJSONBOccupation(jsonbData []byte) string {
	if len(jsonbData) == 0 {
		return ""
	}

	var occupation map[string]interface{}
	err := json.Unmarshal(jsonbData, &occupation)
	if err != nil {
		return ""
	}

	// Try common fields
	if title, ok := occupation["title"].(string); ok {
		return title
	}
	if jobTitle, ok := occupation["job_title"].(string); ok {
		return jobTitle
	}

	return ""
}

// parseJSONBEducation parses JSONB education data to a string
func parseJSONBEducation(jsonbData []byte) string {
	if len(jsonbData) == 0 {
		return ""
	}

	var education map[string]interface{}
	err := json.Unmarshal(jsonbData, &education)
	if err != nil {
		// Try as array
		var eduArray []map[string]interface{}
		if err := json.Unmarshal(jsonbData, &eduArray); err == nil && len(eduArray) > 0 {
			if level, ok := eduArray[0]["level"].(string); ok {
				return level
			}
			if degree, ok := eduArray[0]["degree"].(string); ok {
				return degree
			}
		}
		return ""
	}

	// Try common fields
	if level, ok := education["level"].(string); ok {
		return level
	}
	if degree, ok := education["degree"].(string); ok {
		return degree
	}

	return ""
}

// buildLifestyleString builds a lifestyle description from profile fields
func buildLifestyleString(profile *repository.UserProfile) string {
	parts := []string{}

	if profile.Drinking.Valid && profile.Drinking.String != "" {
		parts = append(parts, "Drinking: "+profile.Drinking.String)
	}
	if profile.Smoking.Valid && profile.Smoking.String != "" {
		parts = append(parts, "Smoking: "+profile.Smoking.String)
	}
	if profile.Workout.Valid && profile.Workout.String != "" {
		parts = append(parts, "Workout: "+profile.Workout.String)
	}
	if profile.DietaryPreference.Valid && profile.DietaryPreference.String != "" {
		parts = append(parts, "Diet: "+profile.DietaryPreference.String)
	}

	if len(parts) > 0 {
		return fmt.Sprintf("%s", parts[0])
	}

	return ""
}

// buildLifestylePreferences builds lifestyle preferences string from partner preferences
func buildLifestylePreferences(prefs *repository.PartnerPreferences) string {
	parts := []string{}

	drinking := parseJSONBStringArray(prefs.DrinkingPreferences)
	if len(drinking) > 0 {
		parts = append(parts, "Drinking: "+drinking[0])
	}

	smoking := parseJSONBStringArray(prefs.SmokingPreferences)
	if len(smoking) > 0 {
		parts = append(parts, "Smoking: "+smoking[0])
	}

	workout := parseJSONBStringArray(prefs.WorkoutPreferences)
	if len(workout) > 0 {
		parts = append(parts, "Workout: "+workout[0])
	}

	if len(parts) > 0 {
		return fmt.Sprintf("%s", parts[0])
	}

	return ""
}
