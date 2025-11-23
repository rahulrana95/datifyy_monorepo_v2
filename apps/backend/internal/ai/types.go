package ai

// CompatibilityRequest represents the data needed for compatibility analysis
type CompatibilityRequest struct {
	User1Profile         UserProfile         `json:"user1_profile"`
	User1Preferences     PartnerPreferences  `json:"user1_preferences"`
	User2Profile         UserProfile         `json:"user2_profile"`
	User2Preferences     PartnerPreferences  `json:"user2_preferences"`
}

// UserProfile contains user information for compatibility check
type UserProfile struct {
	UserID      string   `json:"user_id"`
	Name        string   `json:"name"`
	Age         int      `json:"age"`
	Gender      string   `json:"gender"`
	Location    string   `json:"location"`
	Bio         string   `json:"bio"`
	Interests   []string `json:"interests"`
	Occupation  string   `json:"occupation"`
	Education   string   `json:"education"`
	Lifestyle   string   `json:"lifestyle"`
}

// PartnerPreferences contains what user is looking for in a partner
type PartnerPreferences struct {
	AgeMin              int      `json:"age_min"`
	AgeMax              int      `json:"age_max"`
	GenderPreference    string   `json:"gender_preference"`
	LocationPreference  []string `json:"location_preference"`
	InterestsPreferred  []string `json:"interests_preferred"`
	EducationPreference []string `json:"education_preference"`
	LifestylePreference string   `json:"lifestyle_preference"`
}

// CompatibilityResponse contains the AI analysis result
type CompatibilityResponse struct {
	CompatibilityScore float64  `json:"compatibility_score"` // 0-100
	IsMatch            bool     `json:"is_match"`             // true if score >= 60
	Reasoning          string   `json:"reasoning"`
	MatchedAspects     []string `json:"matched_aspects"`
	MismatchedAspects  []string `json:"mismatched_aspects"`
}
