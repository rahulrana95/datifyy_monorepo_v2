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
	scheduledDatesRepo   *repository.ScheduledDatesRepository
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
		scheduledDatesRepo:   repository.NewScheduledDatesRepository(db),
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

// GetCandidatesForCuration returns users available for dates from tomorrow onwards
func (s *DatesService) GetCandidatesForCuration(ctx context.Context) ([]*CandidateUser, error) {
	// Get tomorrow's date range (starting point)
	tomorrow := time.Now().AddDate(0, 0, 1)
	startOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, tomorrow.Location())

	// Query for users with availability from tomorrow onwards
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
			// Get candidate info for existing match
			candidate, err := s.userRepo.GetByID(ctx, candidateID)
			if err != nil {
				log.Printf("Failed to get candidate %d for existing match: %v", candidateID, err)
				continue
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

			// Return existing match with user info
			matches = append(matches, &MatchCandidate{
				UserID:             candidateID,
				Name:               candidate.Name,
				Age:                age,
				Gender:             gender,
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

// UpdateCuratedMatchAction updates the status of a curated match based on admin action
func (s *DatesService) UpdateCuratedMatchAction(ctx context.Context, matchID int, action string) (string, error) {
	// Map action to status
	var status string
	switch action {
	case "accept", "CURATED_MATCH_ACTION_ACCEPT":
		status = "accepted"
	case "reject", "CURATED_MATCH_ACTION_REJECT":
		status = "rejected"
	case "review_later", "CURATED_MATCH_ACTION_REVIEW_LATER":
		status = "review_later"
	default:
		return "", fmt.Errorf("invalid action: %s", action)
	}

	// Update status in repository
	err := s.curatedMatchesRepo.UpdateStatus(ctx, matchID, status)
	if err != nil {
		return "", fmt.Errorf("failed to update curated match status: %w", err)
	}

	return status, nil
}

// CuratedMatchWithUsers represents a curated match with full user details
type CuratedMatchWithUsers struct {
	ID                  int
	User1ID             int
	User1Name           string
	User1Email          string
	User1Age            int
	User1Gender         string
	User2ID             int
	User2Name           string
	User2Email          string
	User2Age            int
	User2Gender         string
	CompatibilityScore  float64
	IsMatch             bool
	Reasoning           string
	MatchedAspects      []string
	MismatchedAspects   []string
	Status              string
	CreatedByAdmin      *int
	ScheduledDateID     *int
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// GetCuratedMatchesByStatus retrieves curated matches by status with user details
func (s *DatesService) GetCuratedMatchesByStatus(ctx context.Context, status string, limit, offset int) ([]*CuratedMatchWithUsers, int, error) {
	// Get matches from repository
	matches, err := s.curatedMatchesRepo.ListByStatus(ctx, status, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list matches by status: %w", err)
	}

	// Get total count
	totalCount, err := s.curatedMatchesRepo.CountByStatus(ctx, status)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count matches: %w", err)
	}

	// Enrich with user details
	var enrichedMatches []*CuratedMatchWithUsers
	for _, match := range matches {
		// Get user1 details
		user1, err := s.userRepo.GetByID(ctx, match.User1ID)
		if err != nil {
			log.Printf("Failed to get user1 %d: %v", match.User1ID, err)
			continue
		}

		// Get user2 details
		user2, err := s.userRepo.GetByID(ctx, match.User2ID)
		if err != nil {
			log.Printf("Failed to get user2 %d: %v", match.User2ID, err)
			continue
		}

		enriched := &CuratedMatchWithUsers{
			ID:                  match.ID,
			User1ID:             match.User1ID,
			User1Name:           user1.Name,
			User1Email:          user1.Email,
			User1Age:            calculateAge(user1.DateOfBirth.Time),
			User1Gender:         user1.Gender.String,
			User2ID:             match.User2ID,
			User2Name:           user2.Name,
			User2Email:          user2.Email,
			User2Age:            calculateAge(user2.DateOfBirth.Time),
			User2Gender:         user2.Gender.String,
			CompatibilityScore:  match.CompatibilityScore,
			IsMatch:             match.IsMatch,
			Reasoning:           match.Reasoning,
			MatchedAspects:      match.MatchedAspects,
			MismatchedAspects:   match.MismatchedAspects,
			Status:              match.Status,
			CreatedByAdmin:      match.CreatedByAdmin,
			ScheduledDateID:     match.ScheduledDateID,
			CreatedAt:           match.CreatedAt,
			UpdatedAt:           match.UpdatedAt,
		}

		enrichedMatches = append(enrichedMatches, enriched)
	}

	return enrichedMatches, totalCount, nil
}

// CreateSuggestionsFromMatch creates date suggestions for both users from a curated match
func (s *DatesService) CreateSuggestionsFromMatch(ctx context.Context, matchID int) error {
	// Get the curated match
	match, err := s.curatedMatchesRepo.GetByID(ctx, matchID)
	if err != nil {
		return fmt.Errorf("failed to get curated match: %w", err)
	}

	// Verify match is in accepted status
	if match.Status != "accepted" {
		return fmt.Errorf("can only create suggestions from accepted matches, current status: %s", match.Status)
	}

	// Check if suggestions already exist for this match
	existingSuggestions, err := s.suggestionsRepo.ListByUser(ctx, match.User1ID, "", 100, 0)
	if err == nil {
		for _, sugg := range existingSuggestions {
			if sugg.CuratedMatchID != nil && *sugg.CuratedMatchID == matchID {
				return fmt.Errorf("suggestions already exist for this match")
			}
		}
	}

	// Create suggestion for user1 (suggesting user2)
	suggestion1 := &repository.DateSuggestion{
		UserID:             match.User1ID,
		SuggestedUserID:    match.User2ID,
		CuratedMatchID:     &matchID,
		CompatibilityScore: match.CompatibilityScore,
		Reasoning:          match.Reasoning,
		Status:             "pending",
	}
	if err := s.suggestionsRepo.Create(ctx, suggestion1); err != nil {
		return fmt.Errorf("failed to create suggestion for user1: %w", err)
	}

	// Create suggestion for user2 (suggesting user1)
	suggestion2 := &repository.DateSuggestion{
		UserID:             match.User2ID,
		SuggestedUserID:    match.User1ID,
		CuratedMatchID:     &matchID,
		CompatibilityScore: match.CompatibilityScore,
		Reasoning:          match.Reasoning,
		Status:             "pending",
	}
	if err := s.suggestionsRepo.Create(ctx, suggestion2); err != nil {
		return fmt.Errorf("failed to create suggestion for user2: %w", err)
	}

	log.Printf("Created date suggestions for match %d (users %d and %d)", matchID, match.User1ID, match.User2ID)
	return nil
}

// DateSuggestionWithUser represents a suggestion with suggested user details
type DateSuggestionWithUser struct {
	ID                  int
	SuggestedUserID     int
	SuggestedUserName   string
	SuggestedUserEmail  string
	SuggestedUserAge    int
	SuggestedUserGender string
	CompatibilityScore  float64
	Reasoning           string
	Status              string
	CreatedAt           time.Time
}

// GetUserSuggestions retrieves date suggestions for a user with suggested user details
func (s *DatesService) GetUserSuggestions(ctx context.Context, userID int, status string) ([]*DateSuggestionWithUser, error) {
	// Get suggestions from repository
	suggestions, err := s.suggestionsRepo.ListByUser(ctx, userID, status, 100, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to list user suggestions: %w", err)
	}

	// Enrich with suggested user details
	var enriched []*DateSuggestionWithUser
	for _, sugg := range suggestions {
		// Get suggested user details
		suggestedUser, err := s.userRepo.GetByID(ctx, sugg.SuggestedUserID)
		if err != nil {
			log.Printf("Failed to get suggested user %d: %v", sugg.SuggestedUserID, err)
			continue
		}

		enriched = append(enriched, &DateSuggestionWithUser{
			ID:                  sugg.ID,
			SuggestedUserID:     sugg.SuggestedUserID,
			SuggestedUserName:   suggestedUser.Name,
			SuggestedUserEmail:  suggestedUser.Email,
			SuggestedUserAge:    calculateAge(suggestedUser.DateOfBirth.Time),
			SuggestedUserGender: suggestedUser.Gender.String,
			CompatibilityScore:  sugg.CompatibilityScore,
			Reasoning:           sugg.Reasoning,
			Status:              sugg.Status,
			CreatedAt:           sugg.CreatedAt,
		})
	}

	return enriched, nil
}

// RespondToSuggestion allows a user to accept or reject a date suggestion
func (s *DatesService) RespondToSuggestion(ctx context.Context, suggestionID int, userID int, accept bool) error {
	// Get the suggestion
	suggestion, err := s.suggestionsRepo.GetByID(ctx, suggestionID)
	if err != nil {
		return fmt.Errorf("failed to get suggestion: %w", err)
	}

	// Verify the suggestion belongs to this user
	if suggestion.UserID != userID {
		return fmt.Errorf("suggestion does not belong to this user")
	}

	// Check if already responded
	if suggestion.Status != "pending" {
		return fmt.Errorf("suggestion already responded to with status: %s", suggestion.Status)
	}

	// Update suggestion status
	if accept {
		err = s.suggestionsRepo.Accept(ctx, suggestionID)
	} else {
		err = s.suggestionsRepo.Reject(ctx, suggestionID)
	}

	if err != nil {
		return fmt.Errorf("failed to update suggestion status: %w", err)
	}

	log.Printf("User %d %s suggestion %d", userID, map[bool]string{true: "accepted", false: "rejected"}[accept], suggestionID)
	return nil
}

// ScheduleDateFromMatch schedules a date from a curated match with genie assignment
func (s *DatesService) ScheduleDateFromMatch(ctx context.Context, matchID int, genieID int, scheduledTime time.Time, durationMinutes int, dateType string) (*repository.ScheduledDate, error) {
	// Get the curated match
	match, err := s.curatedMatchesRepo.GetByID(ctx, matchID)
	if err != nil {
		return nil, fmt.Errorf("failed to get curated match: %w", err)
	}

	// Verify both users have accepted their suggestions
	user1Suggestions, err := s.suggestionsRepo.ListByUser(ctx, match.User1ID, "accepted", 100, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get user1 suggestions: %w", err)
	}

	user2Suggestions, err := s.suggestionsRepo.ListByUser(ctx, match.User2ID, "accepted", 100, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get user2 suggestions: %w", err)
	}

	// Check if both users have accepted this match
	user1Accepted := false
	user2Accepted := false
	for _, sugg := range user1Suggestions {
		if sugg.CuratedMatchID != nil && *sugg.CuratedMatchID == matchID {
			user1Accepted = true
			break
		}
	}
	for _, sugg := range user2Suggestions {
		if sugg.CuratedMatchID != nil && *sugg.CuratedMatchID == matchID {
			user2Accepted = true
			break
		}
	}

	if !user1Accepted || !user2Accepted {
		return nil, fmt.Errorf("both users must accept the suggestion before scheduling")
	}

	// Get user details for generating meet link and calendar info
	user1, err := s.userRepo.GetByID(ctx, match.User1ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user1: %w", err)
	}
	user2, err := s.userRepo.GetByID(ctx, match.User2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user2: %w", err)
	}

	// Generate Google Meet link
	meetLink := generateGoogleMeetLink(user1.Name, user2.Name, scheduledTime)

	// Generate calendar invite text
	calendarInfo := generateCalendarInviteText(user1.Name, user2.Name, scheduledTime, durationMinutes, meetLink)

	// Create scheduled date
	genieIDNullable := sql.NullInt64{Int64: int64(genieID), Valid: true}
	notesText := sql.NullString{String: fmt.Sprintf("Google Meet: %s\n\nCalendar Info:\n%s", meetLink, calendarInfo), Valid: true}

	scheduledDate := &repository.ScheduledDate{
		User1ID:         match.User1ID,
		User2ID:         match.User2ID,
		GenieID:         genieIDNullable,
		ScheduledTime:   scheduledTime,
		DurationMinutes: durationMinutes,
		Status:          "scheduled",
		DateType:        dateType,
		Notes:           notesText,
		AdminNotes:      sql.NullString{String: fmt.Sprintf("Scheduled by genie %d from curated match %d", genieID, matchID), Valid: true},
	}

	err = s.scheduledDatesRepo.Create(ctx, scheduledDate)
	if err != nil {
		return nil, fmt.Errorf("failed to create scheduled date: %w", err)
	}

	// Link the scheduled date to the curated match
	err = s.curatedMatchesRepo.LinkScheduledDate(ctx, matchID, scheduledDate.ID)
	if err != nil {
		log.Printf("Warning: failed to link scheduled date to curated match: %v", err)
	}

	log.Printf("Scheduled date %d for users %d and %d with genie %d", scheduledDate.ID, match.User1ID, match.User2ID, genieID)
	return scheduledDate, nil
}

// generateGoogleMeetLink generates a Google Meet link (simplified version)
// In production, this would use the Google Calendar API to create actual meets
func generateGoogleMeetLink(user1Name, user2Name string, scheduledTime time.Time) string {
	// For now, generate a placeholder Google Meet link
	// In production, integrate with Google Calendar API to create real meetings
	meetID := fmt.Sprintf("datifyy-%d-%s-%s", scheduledTime.Unix(),
		sanitizeForURL(user1Name), sanitizeForURL(user2Name))
	return fmt.Sprintf("https://meet.google.com/%s", meetID[:20])
}

// generateCalendarInviteText generates calendar invite information
// In production, this would use Google Calendar API to send actual invites
func generateCalendarInviteText(user1Name, user2Name string, scheduledTime time.Time, durationMinutes int, meetLink string) string {
	endTime := scheduledTime.Add(time.Duration(durationMinutes) * time.Minute)

	return fmt.Sprintf(`📅 Date Details:
• When: %s
• Duration: %d minutes
• End Time: %s
• Participants: %s & %s
• Location: %s

This is your Datifyy curated date! 💝
`,
		scheduledTime.Format("Monday, January 2, 2006 at 3:04 PM MST"),
		durationMinutes,
		endTime.Format("3:04 PM MST"),
		user1Name,
		user2Name,
		meetLink,
	)
}

// sanitizeForURL removes special characters for URL-safe strings
func sanitizeForURL(s string) string {
	// Simple implementation - in production use proper URL encoding
	result := ""
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			result += string(r)
		}
	}
	if len(result) > 10 {
		result = result[:10]
	}
	return result
}
