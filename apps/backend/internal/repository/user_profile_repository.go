package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrProfileNotFound = errors.New("profile not found")
)

// UserProfile represents a user profile in the database
type UserProfile struct {
	ID                   int
	UserID               int
	Bio                  sql.NullString
	Occupation           []byte // JSONB
	Company              sql.NullString
	JobTitle             sql.NullString
	Education            []byte // JSONB
	School               sql.NullString
	Height               sql.NullInt32
	Location             []byte // JSONB
	Hometown             sql.NullString
	Interests            []byte // JSONB
	Languages            []byte // JSONB
	RelationshipGoals    []byte // JSONB
	Drinking             sql.NullString
	Smoking              sql.NullString
	Workout              sql.NullString
	DietaryPreference    sql.NullString
	Religion             sql.NullString
	ReligionImportance   sql.NullString
	PoliticalView        sql.NullString
	Pets                 sql.NullString
	Children             sql.NullString
	PersonalityType      sql.NullString
	CommunicationStyle   sql.NullString
	LoveLanguage         sql.NullString
	SleepSchedule        sql.NullString
	Prompts              []byte // JSONB
	CompletionPercentage int
	IsPublic             bool
	IsVerified           bool
}

// PartnerPreferences represents partner preferences in the database
type PartnerPreferences struct {
	ID                   int
	UserID               int
	// Basic Preferences
	LookingForGender     []byte // JSONB
	AgeRangeMin          int
	AgeRangeMax          int
	DistancePreference   int
	HeightRangeMin       sql.NullInt32
	HeightRangeMax       sql.NullInt32
	// Relationship & Lifestyle
	RelationshipGoals    []byte // JSONB
	EducationLevels      []byte // JSONB
	Occupations          []byte // JSONB
	Religions            []byte // JSONB
	ReligionImportance   int
	ChildrenPreferences  []byte // JSONB
	DrinkingPreferences  []byte // JSONB
	SmokingPreferences   []byte // JSONB
	DietaryPreferences   []byte // JSONB
	PetPreferences       []byte // JSONB
	WorkoutPreferences   []byte // JSONB
	// Personality & Communication
	PersonalityTypes     []byte // JSONB
	CommunicationStyles  []byte // JSONB
	LoveLanguages        []byte // JSONB
	PoliticalViews       []byte // JSONB
	SleepSchedules       []byte // JSONB
	// Cultural & Matrimonial
	CastePreferences     []byte // JSONB
	SubCastePreferences  []byte // JSONB
	GotraPreferences     []byte // JSONB
	ManglikPreference    int
	MotherTonguePrefs    []byte // JSONB
	EthnicityPreferences []byte // JSONB
	NationalityPrefs     []byte // JSONB
	NRIPreference        int
	HoroscopeRequired    bool
	RelocationExpectation int
	// Appearance
	BodyTypePreferences  []byte // JSONB
	ComplexionPrefs      []byte // JSONB
	HairColorPrefs       []byte // JSONB
	EyeColorPrefs        []byte // JSONB
	FacialHairPrefs      []byte // JSONB
	TattooPreference     int
	PiercingPreference   int
	DisabilityAcceptance int
	// Professional & Financial
	IncomePreferences    []byte // JSONB
	EmploymentPrefs      []byte // JSONB
	IndustryPreferences  []byte // JSONB
	MinYearsExperience   int
	PropertyPreference   int
	VehiclePreference    int
	FinancialExpectation int
	// Family Background
	FamilyTypePrefs      []byte // JSONB
	FamilyValuesPrefs    []byte // JSONB
	LivingSituationPrefs []byte // JSONB
	FamilyAffluencePrefs []byte // JSONB
	FamilyLocationPrefs  []byte // JSONB
	MaxSiblings          int
	// Language & Location
	LanguagePreferences  []byte // JSONB
	MinLangProficiency   int
	LocationPreferences  []byte // JSONB
	OpenToLongDistance   bool
	// Interest & Hobbies
	InterestPreferences  []byte // JSONB
	MinSharedInterests   int
	// Deal-Breakers & Must-Haves
	VerifiedOnly         bool
	MaxDaysInactive      int
	PhotosRequired       bool
	MinProfileCompletion int
	DealBreakers         []byte // JSONB
	MustHaves            []byte // JSONB
	CustomDealbreakers   []byte // JSONB
}

// UserPreferences represents user app preferences in the database
type UserPreferences struct {
	ID                  int
	UserID              int
	PushEnabled         bool
	EmailEnabled        bool
	SmsEnabled          bool
	NotifyMatches       bool
	NotifyMessages      bool
	NotifyLikes         bool
	NotifySuperLikes    bool
	NotifyProfileViews  bool
	PublicProfile       bool
	ShowOnlineStatus    bool
	ShowDistance        bool
	ShowAge             bool
	AllowSearchEngines  bool
	IncognitoMode       bool
	ReadReceipts        bool
	Discoverable        bool
	GlobalMode          bool
	VerifiedOnly        bool
	DistanceRadius      int
	RecentlyActiveDays  int
	AppLanguage         string
	Theme               string
}

// ProfilePhoto represents a user photo in the database
type ProfilePhoto struct {
	ID           int
	UserID       int
	PhotoID      string
	URL          string
	ThumbnailURL sql.NullString
	DisplayOrder int
	IsPrimary    bool
	Caption      sql.NullString
	UploadedAt   sql.NullTime
}

// UserBlock represents a user block in the database
type UserBlock struct {
	ID             int
	BlockerUserID  int
	BlockedUserID  int
	Reason         sql.NullString
	CreatedAt      sql.NullTime
}

// UserReport represents a user report in the database
type UserReport struct {
	ID              int
	ReporterUserID  int
	ReportedUserID  int
	ReportID        string
	Reason          string
	Details         sql.NullString
	EvidenceURLs    []byte // JSONB
	Status          string
	ReviewedBy      sql.NullInt32
	ReviewedAt      sql.NullTime
	ResolutionNotes sql.NullString
	CreatedAt       sql.NullTime
}

// UserProfileRepository handles user profile database operations
type UserProfileRepository struct {
	db *sql.DB
}

// NewUserProfileRepository creates a new user profile repository
func NewUserProfileRepository(db *sql.DB) *UserProfileRepository {
	return &UserProfileRepository{db: db}
}

// GetProfileByUserID retrieves a user profile by user ID
func (r *UserProfileRepository) GetProfileByUserID(ctx context.Context, userID int) (*UserProfile, error) {
	query := `
		SELECT id, user_id, bio, occupation, company, job_title, education,
		       school, height, location, hometown, interests, languages,
		       relationship_goals, drinking, smoking, workout, dietary_preference,
		       religion, religion_importance, political_view, pets, children,
		       personality_type, communication_style, love_language, sleep_schedule,
		       prompts, completion_percentage, is_public, is_verified
		FROM user_profiles
		WHERE user_id = $1
	`

	profile := &UserProfile{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&profile.ID, &profile.UserID, &profile.Bio, &profile.Occupation,
		&profile.Company, &profile.JobTitle, &profile.Education, &profile.School,
		&profile.Height, &profile.Location, &profile.Hometown, &profile.Interests,
		&profile.Languages, &profile.RelationshipGoals, &profile.Drinking,
		&profile.Smoking, &profile.Workout, &profile.DietaryPreference,
		&profile.Religion, &profile.ReligionImportance, &profile.PoliticalView,
		&profile.Pets, &profile.Children, &profile.PersonalityType,
		&profile.CommunicationStyle, &profile.LoveLanguage, &profile.SleepSchedule,
		&profile.Prompts, &profile.CompletionPercentage, &profile.IsPublic,
		&profile.IsVerified,
	)

	if err == sql.ErrNoRows {
		return nil, ErrProfileNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return profile, nil
}

// UpdateProfile updates a user profile
func (r *UserProfileRepository) UpdateProfile(ctx context.Context, userID int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Build dynamic UPDATE query
	query := "UPDATE user_profiles SET "
	args := []interface{}{}
	argPos := 1

	for key, value := range updates {
		if argPos > 1 {
			query += ", "
		}
		query += fmt.Sprintf("%s = $%d", key, argPos)
		args = append(args, value)
		argPos++
	}

	query += fmt.Sprintf(" WHERE user_id = $%d", argPos)
	args = append(args, userID)

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// GetPartnerPreferences retrieves partner preferences by user ID
func (r *UserProfileRepository) GetPartnerPreferences(ctx context.Context, userID int) (*PartnerPreferences, error) {
	query := `
		SELECT id, user_id, looking_for_gender, age_range_min, age_range_max,
		       distance_preference, height_range_min, height_range_max,
		       relationship_goals, education_levels, occupations, religions,
		       religion_importance, children_preferences, drinking_preferences, smoking_preferences,
		       dietary_preferences, pet_preferences, workout_preferences,
		       personality_types, communication_styles, love_languages, political_views, sleep_schedules,
		       caste_preferences, sub_caste_preferences, gotra_preferences, manglik_preference,
		       mother_tongue_preferences, ethnicity_preferences, nationality_preferences, nri_preference,
		       horoscope_matching_required, relocation_expectation,
		       body_type_preferences, complexion_preferences, hair_color_preferences, eye_color_preferences,
		       facial_hair_preferences, tattoo_preference, piercing_preference, disability_acceptance,
		       income_preferences, employment_preferences, industry_preferences, min_years_experience,
		       property_preference, vehicle_preference, financial_expectation,
		       family_type_preferences, family_values_preferences, living_situation_preferences,
		       family_affluence_preferences, family_location_preferences, max_siblings,
		       language_preferences, min_language_proficiency, location_preferences, open_to_long_distance,
		       interest_preferences, min_shared_interests,
		       verified_only, max_days_inactive, photos_required, min_profile_completion,
		       deal_breakers, must_haves, custom_dealbreakers
		FROM partner_preferences
		WHERE user_id = $1
	`

	prefs := &PartnerPreferences{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&prefs.ID, &prefs.UserID, &prefs.LookingForGender, &prefs.AgeRangeMin,
		&prefs.AgeRangeMax, &prefs.DistancePreference, &prefs.HeightRangeMin,
		&prefs.HeightRangeMax, &prefs.RelationshipGoals, &prefs.EducationLevels,
		&prefs.Occupations, &prefs.Religions, &prefs.ReligionImportance,
		&prefs.ChildrenPreferences, &prefs.DrinkingPreferences, &prefs.SmokingPreferences,
		&prefs.DietaryPreferences, &prefs.PetPreferences, &prefs.WorkoutPreferences,
		&prefs.PersonalityTypes, &prefs.CommunicationStyles, &prefs.LoveLanguages,
		&prefs.PoliticalViews, &prefs.SleepSchedules,
		&prefs.CastePreferences, &prefs.SubCastePreferences, &prefs.GotraPreferences,
		&prefs.ManglikPreference, &prefs.MotherTonguePrefs, &prefs.EthnicityPreferences,
		&prefs.NationalityPrefs, &prefs.NRIPreference, &prefs.HoroscopeRequired,
		&prefs.RelocationExpectation, &prefs.BodyTypePreferences, &prefs.ComplexionPrefs,
		&prefs.HairColorPrefs, &prefs.EyeColorPrefs, &prefs.FacialHairPrefs,
		&prefs.TattooPreference, &prefs.PiercingPreference, &prefs.DisabilityAcceptance,
		&prefs.IncomePreferences, &prefs.EmploymentPrefs, &prefs.IndustryPreferences,
		&prefs.MinYearsExperience, &prefs.PropertyPreference, &prefs.VehiclePreference,
		&prefs.FinancialExpectation, &prefs.FamilyTypePrefs, &prefs.FamilyValuesPrefs,
		&prefs.LivingSituationPrefs, &prefs.FamilyAffluencePrefs, &prefs.FamilyLocationPrefs,
		&prefs.MaxSiblings, &prefs.LanguagePreferences, &prefs.MinLangProficiency,
		&prefs.LocationPreferences, &prefs.OpenToLongDistance, &prefs.InterestPreferences,
		&prefs.MinSharedInterests, &prefs.VerifiedOnly, &prefs.MaxDaysInactive,
		&prefs.PhotosRequired, &prefs.MinProfileCompletion, &prefs.DealBreakers,
		&prefs.MustHaves, &prefs.CustomDealbreakers,
	)

	if err == sql.ErrNoRows {
		return nil, ErrProfileNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return prefs, nil
}

// UpdatePartnerPreferences updates partner preferences (UPSERT)
func (r *UserProfileRepository) UpdatePartnerPreferences(ctx context.Context, userID int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Build UPSERT query with ON CONFLICT
	// First, build the column names and values for INSERT
	columns := []string{"user_id"}
	placeholders := []string{"$1"}
	args := []interface{}{userID}
	argPos := 2

	// Build SET clause for ON CONFLICT UPDATE
	var setClauses []string

	for key, value := range updates {
		columns = append(columns, key)
		placeholders = append(placeholders, fmt.Sprintf("$%d", argPos))
		args = append(args, value)
		setClauses = append(setClauses, fmt.Sprintf("%s = EXCLUDED.%s", key, key))
		argPos++
	}

	query := fmt.Sprintf(`
		INSERT INTO partner_preferences (%s, created_at, updated_at)
		VALUES (%s, NOW(), NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			%s,
			updated_at = NOW()
	`, strings.Join(columns, ", "), strings.Join(placeholders, ", "), strings.Join(setClauses, ", "))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// GetUserPreferences retrieves user app preferences by user ID
func (r *UserProfileRepository) GetUserPreferences(ctx context.Context, userID int) (*UserPreferences, error) {
	query := `
		SELECT id, user_id, push_enabled, email_enabled, sms_enabled,
		       notify_matches, notify_messages, notify_likes, notify_super_likes,
		       notify_profile_views, public_profile, show_online_status, show_distance,
		       show_age, allow_search_engines, incognito_mode, read_receipts,
		       discoverable, global_mode, verified_only, distance_radius,
		       recently_active_days, app_language, theme
		FROM user_preferences
		WHERE user_id = $1
	`

	prefs := &UserPreferences{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&prefs.ID, &prefs.UserID, &prefs.PushEnabled, &prefs.EmailEnabled,
		&prefs.SmsEnabled, &prefs.NotifyMatches, &prefs.NotifyMessages,
		&prefs.NotifyLikes, &prefs.NotifySuperLikes, &prefs.NotifyProfileViews,
		&prefs.PublicProfile, &prefs.ShowOnlineStatus, &prefs.ShowDistance,
		&prefs.ShowAge, &prefs.AllowSearchEngines, &prefs.IncognitoMode,
		&prefs.ReadReceipts, &prefs.Discoverable, &prefs.GlobalMode,
		&prefs.VerifiedOnly, &prefs.DistanceRadius, &prefs.RecentlyActiveDays,
		&prefs.AppLanguage, &prefs.Theme,
	)

	if err == sql.ErrNoRows {
		// Create default preferences if not exists
		return r.CreateDefaultUserPreferences(ctx, userID)
	}

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return prefs, nil
}

// CreateDefaultUserPreferences creates default user preferences
func (r *UserProfileRepository) CreateDefaultUserPreferences(ctx context.Context, userID int) (*UserPreferences, error) {
	query := `
		INSERT INTO user_preferences (user_id)
		VALUES ($1)
		RETURNING id, user_id, push_enabled, email_enabled, sms_enabled,
		          notify_matches, notify_messages, notify_likes, notify_super_likes,
		          notify_profile_views, public_profile, show_online_status, show_distance,
		          show_age, allow_search_engines, incognito_mode, read_receipts,
		          discoverable, global_mode, verified_only, distance_radius,
		          recently_active_days, app_language, theme
	`

	prefs := &UserPreferences{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&prefs.ID, &prefs.UserID, &prefs.PushEnabled, &prefs.EmailEnabled,
		&prefs.SmsEnabled, &prefs.NotifyMatches, &prefs.NotifyMessages,
		&prefs.NotifyLikes, &prefs.NotifySuperLikes, &prefs.NotifyProfileViews,
		&prefs.PublicProfile, &prefs.ShowOnlineStatus, &prefs.ShowDistance,
		&prefs.ShowAge, &prefs.AllowSearchEngines, &prefs.IncognitoMode,
		&prefs.ReadReceipts, &prefs.Discoverable, &prefs.GlobalMode,
		&prefs.VerifiedOnly, &prefs.DistanceRadius, &prefs.RecentlyActiveDays,
		&prefs.AppLanguage, &prefs.Theme,
	)

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return prefs, nil
}

// UpdateUserPreferences updates user app preferences
func (r *UserProfileRepository) UpdateUserPreferences(ctx context.Context, userID int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Build dynamic UPDATE query
	query := "UPDATE user_preferences SET "
	args := []interface{}{}
	argPos := 1

	for key, value := range updates {
		if argPos > 1 {
			query += ", "
		}
		query += fmt.Sprintf("%s = $%d", key, argPos)
		args = append(args, value)
		argPos++
	}

	query += fmt.Sprintf(" WHERE user_id = $%d", argPos)
	args = append(args, userID)

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// GetPhotosByUserID retrieves all photos for a user
func (r *UserProfileRepository) GetPhotosByUserID(ctx context.Context, userID int) ([]*ProfilePhoto, error) {
	query := `
		SELECT id, user_id, photo_id, url, thumbnail_url, display_order,
		       is_primary, caption, uploaded_at
		FROM user_photos
		WHERE user_id = $1
		ORDER BY display_order ASC, uploaded_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}
	defer rows.Close()

	photos := []*ProfilePhoto{}
	for rows.Next() {
		photo := &ProfilePhoto{}
		err := rows.Scan(
			&photo.ID, &photo.UserID, &photo.PhotoID, &photo.URL,
			&photo.ThumbnailURL, &photo.DisplayOrder, &photo.IsPrimary,
			&photo.Caption, &photo.UploadedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
		}
		photos = append(photos, photo)
	}

	return photos, nil
}

// CreatePhoto creates a new user photo
func (r *UserProfileRepository) CreatePhoto(ctx context.Context, photo *ProfilePhoto) error {
	query := `
		INSERT INTO user_photos (user_id, photo_id, url, thumbnail_url,
		                         display_order, is_primary, caption, uploaded_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		RETURNING id, uploaded_at
	`

	err := r.db.QueryRowContext(ctx, query,
		photo.UserID, photo.PhotoID, photo.URL, photo.ThumbnailURL,
		photo.DisplayOrder, photo.IsPrimary, photo.Caption,
	).Scan(&photo.ID, &photo.UploadedAt)

	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// DeletePhoto deletes a user photo
func (r *UserProfileRepository) DeletePhoto(ctx context.Context, userID int, photoID string) error {
	query := `DELETE FROM user_photos WHERE user_id = $1 AND photo_id = $2`

	result, err := r.db.ExecContext(ctx, query, userID, photoID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	if rowsAffected == 0 {
		return errors.New("photo not found")
	}

	return nil
}

// BlockUser blocks a user
func (r *UserProfileRepository) BlockUser(ctx context.Context, blockerUserID, blockedUserID int, reason string) error {
	query := `
		INSERT INTO user_blocks (blocker_user_id, blocked_user_id, reason)
		VALUES ($1, $2, $3)
	`

	_, err := r.db.ExecContext(ctx, query, blockerUserID, blockedUserID, reason)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// UnblockUser unblocks a user
func (r *UserProfileRepository) UnblockUser(ctx context.Context, blockerUserID, blockedUserID int) error {
	query := `DELETE FROM user_blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2`

	result, err := r.db.ExecContext(ctx, query, blockerUserID, blockedUserID)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	if rowsAffected == 0 {
		return errors.New("block not found")
	}

	return nil
}

// GetBlockedUsers retrieves all users blocked by a user
func (r *UserProfileRepository) GetBlockedUsers(ctx context.Context, blockerUserID int, limit, offset int) ([]int, int, error) {
	// Get total count
	countQuery := `SELECT COUNT(*) FROM user_blocks WHERE blocker_user_id = $1`
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, blockerUserID).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	// Get blocked user IDs
	query := `
		SELECT blocked_user_id
		FROM user_blocks
		WHERE blocker_user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, blockerUserID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}
	defer rows.Close()

	userIDs := []int{}
	for rows.Next() {
		var userID int
		if err := rows.Scan(&userID); err != nil {
			return nil, 0, fmt.Errorf("%w: %v", ErrDatabaseError, err)
		}
		userIDs = append(userIDs, userID)
	}

	return userIDs, totalCount, nil
}

// CreateReport creates a user report
func (r *UserProfileRepository) CreateReport(ctx context.Context, reporterUserID, reportedUserID int, reportID, reason, details string, evidenceURLs []string) error {
	// Convert evidence URLs to JSON
	evidenceJSON, err := json.Marshal(evidenceURLs)
	if err != nil {
		return fmt.Errorf("failed to marshal evidence URLs: %v", err)
	}

	query := `
		INSERT INTO user_reports (reporter_user_id, reported_user_id, report_id,
		                          reason, details, evidence_urls)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err = r.db.ExecContext(ctx, query, reporterUserID, reportedUserID, reportID, reason, details, evidenceJSON)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return nil
}

// IsUserBlocked checks if a user is blocked
func (r *UserProfileRepository) IsUserBlocked(ctx context.Context, blockerUserID, blockedUserID int) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM user_blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2)`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, blockerUserID, blockedUserID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return exists, nil
}
