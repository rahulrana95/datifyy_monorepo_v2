package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	commonpb "github.com/datifyy/backend/gen/common/v1"
	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/repository"
)

// buildUserProfileFromDB builds a UserProfile proto message from database models
func buildUserProfileFromDB(
	user *repository.User,
	profile *repository.UserProfile,
	photos []*repository.ProfilePhoto,
	partnerPrefs *repository.PartnerPreferences,
	userPrefs *repository.UserPreferences,
) (*userpb.UserProfile, error) {
	pbProfile := &userpb.UserProfile{
		UserId: strconv.Itoa(user.ID),
		BasicInfo: &userpb.BasicInfo{
			Name:  user.Name,
			Email: user.Email,
		},
		ProfileDetails:       &userpb.ProfileDetails{},
		LifestyleInfo:        &userpb.LifestyleInfo{},
		CompletionPercentage: int32(profile.CompletionPercentage),
		IsPublic:             profile.IsPublic,
		IsVerified:           profile.IsVerified,
		Metadata: &userpb.AccountMetadata{
			Status:        stringToAccountStatus(user.AccountStatus),
			EmailVerified: boolToVerificationStatus(user.EmailVerified),
			PhoneVerified: boolToVerificationStatus(user.PhoneVerified),
			CreatedAt:     timeToProto(user.CreatedAt),
			UpdatedAt:     timeToProto(user.UpdatedAt),
			IsVerified:    profile.IsVerified,
		},
	}

	// Add phone number if exists
	if user.PhoneNumber.Valid {
		pbProfile.BasicInfo.PhoneNumber = user.PhoneNumber.String
	}

	// Add date of birth and age if exists
	if user.DateOfBirth.Valid {
		pbProfile.BasicInfo.DateOfBirth = timeToProto(user.DateOfBirth.Time)
		pbProfile.BasicInfo.Age = int32(calculateAge(user.DateOfBirth.Time))
	}

	// Add gender if exists
	if user.Gender.Valid {
		pbProfile.BasicInfo.Gender = stringToGender(user.Gender.String)
	}

	// Add last login
	if user.LastLoginAt.Valid {
		pbProfile.Metadata.LastLoginAt = timeToProto(user.LastLoginAt.Time)
	}

	// Profile details
	if profile.Bio.Valid {
		pbProfile.ProfileDetails.Bio = profile.Bio.String
	}
	if profile.Company.Valid {
		pbProfile.ProfileDetails.Company = profile.Company.String
	}
	if profile.JobTitle.Valid {
		pbProfile.ProfileDetails.JobTitle = profile.JobTitle.String
	}
	if profile.School.Valid {
		pbProfile.ProfileDetails.School = profile.School.String
	}
	if profile.Height.Valid {
		pbProfile.ProfileDetails.Height = profile.Height.Int32
	}
	if profile.Hometown.Valid {
		pbProfile.ProfileDetails.Hometown = profile.Hometown.String
	}

	// Parse JSONB fields
	if len(profile.Occupation) > 0 {
		var occupations []*userpb.OccupationInfo
		if err := json.Unmarshal(profile.Occupation, &occupations); err == nil {
			pbProfile.ProfileDetails.Occupations = occupations
		}
	}

	if len(profile.Education) > 0 {
		var education []*userpb.EducationInfo
		if err := json.Unmarshal(profile.Education, &education); err == nil {
			pbProfile.ProfileDetails.Education = education
		}
	}

	if len(profile.Interests) > 0 {
		var interests []*userpb.InterestInfo
		if err := json.Unmarshal(profile.Interests, &interests); err == nil {
			pbProfile.ProfileDetails.Interests = interests
		}
	}

	if len(profile.Languages) > 0 {
		var languages []*userpb.LanguageInfo
		if err := json.Unmarshal(profile.Languages, &languages); err == nil {
			pbProfile.ProfileDetails.Languages = languages
		}
	}

	if len(profile.RelationshipGoals) > 0 {
		var goals []int32
		if err := json.Unmarshal(profile.RelationshipGoals, &goals); err == nil {
			pbGoals := make([]userpb.RelationshipGoal, len(goals))
			for i, g := range goals {
				pbGoals[i] = userpb.RelationshipGoal(g)
			}
			pbProfile.ProfileDetails.RelationshipGoals = pbGoals
		}
	}

	if len(profile.Location) > 0 {
		var location commonpb.Location
		if err := json.Unmarshal(profile.Location, &location); err == nil {
			pbProfile.ProfileDetails.Location = &location
		}
	}

	// Lifestyle info
	pbProfile.LifestyleInfo = &userpb.LifestyleInfo{}
	if profile.Drinking.Valid {
		pbProfile.LifestyleInfo.Drinking = stringToDrinkingHabit(profile.Drinking.String)
	}
	if profile.Smoking.Valid {
		pbProfile.LifestyleInfo.Smoking = stringToSmokingHabit(profile.Smoking.String)
	}
	if profile.Workout.Valid {
		pbProfile.LifestyleInfo.Workout = stringToWorkoutFrequency(profile.Workout.String)
	}
	if profile.DietaryPreference.Valid {
		pbProfile.LifestyleInfo.DietaryPreference = stringToDietaryPreference(profile.DietaryPreference.String)
	}
	if profile.Religion.Valid {
		pbProfile.LifestyleInfo.Religion = stringToReligion(profile.Religion.String)
	}
	if profile.ReligionImportance.Valid {
		pbProfile.LifestyleInfo.ReligionImportance = stringToImportance(profile.ReligionImportance.String)
	}
	if profile.PoliticalView.Valid {
		pbProfile.LifestyleInfo.PoliticalView = stringToPoliticalView(profile.PoliticalView.String)
	}
	if profile.Pets.Valid {
		pbProfile.LifestyleInfo.Pets = stringToPetPreference(profile.Pets.String)
	}
	if profile.Children.Valid {
		pbProfile.LifestyleInfo.Children = stringToChildrenPreference(profile.Children.String)
	}
	if profile.PersonalityType.Valid {
		pbProfile.LifestyleInfo.PersonalityType = profile.PersonalityType.String
	}
	if profile.CommunicationStyle.Valid {
		pbProfile.LifestyleInfo.CommunicationStyle = stringToCommunicationStyle(profile.CommunicationStyle.String)
	}
	if profile.LoveLanguage.Valid {
		pbProfile.LifestyleInfo.LoveLanguage = stringToLoveLanguage(profile.LoveLanguage.String)
	}
	if profile.SleepSchedule.Valid {
		pbProfile.LifestyleInfo.SleepSchedule = stringToSleepSchedule(profile.SleepSchedule.String)
	}

	// Parse prompts
	if len(profile.Prompts) > 0 {
		var prompts []*userpb.ProfilePrompt
		if err := json.Unmarshal(profile.Prompts, &prompts); err == nil {
			pbProfile.Prompts = prompts
		}
	}

	// Add photos
	pbProfile.Photos = make([]*userpb.ProfilePhoto, len(photos))
	for i, photo := range photos {
		pbProfile.Photos[i] = &userpb.ProfilePhoto{
			PhotoId:   photo.PhotoID,
			Url:       photo.URL,
			Order:     int32(photo.DisplayOrder),
			IsPrimary: photo.IsPrimary,
		}
		if photo.ThumbnailURL.Valid {
			pbProfile.Photos[i].ThumbnailUrl = photo.ThumbnailURL.String
		}
		if photo.Caption.Valid {
			pbProfile.Photos[i].Caption = photo.Caption.String
		}
		if photo.UploadedAt.Valid {
			pbProfile.Photos[i].UploadedAt = timeToProto(photo.UploadedAt.Time)
		}
	}

	// Add partner preferences
	if partnerPrefs != nil {
		pbProfile.PartnerPreferences = buildPartnerPreferencesFromDB(partnerPrefs)
	}

	// Add user preferences
	if userPrefs != nil {
		pbProfile.UserPreferences = buildUserPreferencesFromDB(userPrefs)
	}

	return pbProfile, nil
}

// buildPartnerPreferencesFromDB builds PartnerPreferences proto from DB model
func buildPartnerPreferencesFromDB(prefs *repository.PartnerPreferences) *userpb.PartnerPreferences {
	if prefs == nil {
		return &userpb.PartnerPreferences{}
	}

	pb := &userpb.PartnerPreferences{
		AgeRange: &userpb.AgeRange{
			MinAge: int32(prefs.AgeRangeMin),
			MaxAge: int32(prefs.AgeRangeMax),
		},
		DistancePreference: int32(prefs.DistancePreference),
		VerifiedOnly:       prefs.VerifiedOnly,
	}

	if prefs.HeightRangeMin.Valid && prefs.HeightRangeMax.Valid {
		pb.HeightRange = &userpb.HeightRange{
			MinHeight: prefs.HeightRangeMin.Int32,
			MaxHeight: prefs.HeightRangeMax.Int32,
		}
	}

	// Parse JSONB arrays
	if len(prefs.LookingForGender) > 0 {
		var genders []int32
		if err := json.Unmarshal(prefs.LookingForGender, &genders); err == nil {
			pb.LookingForGender = make([]userpb.Gender, len(genders))
			for i, g := range genders {
				pb.LookingForGender[i] = userpb.Gender(g)
			}
		}
	}

	// Similar parsing for other JSONB fields...
	return pb
}

// buildUserPreferencesFromDB builds UserPreferences proto from DB model
func buildUserPreferencesFromDB(prefs *repository.UserPreferences) *userpb.UserPreferences {
	return &userpb.UserPreferences{
		Notifications: &userpb.NotificationPreferences{
			PushEnabled:        prefs.PushEnabled,
			EmailEnabled:       prefs.EmailEnabled,
			SmsEnabled:         prefs.SmsEnabled,
			NotifyMatches:      prefs.NotifyMatches,
			NotifyMessages:     prefs.NotifyMessages,
			NotifyLikes:        prefs.NotifyLikes,
			NotifySuperLikes:   prefs.NotifySuperLikes,
			NotifyProfileViews: prefs.NotifyProfileViews,
		},
		Privacy: &userpb.PrivacyPreferences{
			PublicProfile:      prefs.PublicProfile,
			ShowOnlineStatus:   prefs.ShowOnlineStatus,
			ShowDistance:       prefs.ShowDistance,
			ShowAge:            prefs.ShowAge,
			AllowSearchEngines: prefs.AllowSearchEngines,
			IncognitoMode:      prefs.IncognitoMode,
			ReadReceipts:       prefs.ReadReceipts,
		},
		Discovery: &userpb.DiscoveryPreferences{
			Discoverable:       prefs.Discoverable,
			GlobalMode:         prefs.GlobalMode,
			VerifiedOnly:       prefs.VerifiedOnly,
			DistanceRadius:     int32(prefs.DistanceRadius),
			RecentlyActiveDays: int32(prefs.RecentlyActiveDays),
		},
		AppLanguage: prefs.AppLanguage,
		Theme:       prefs.Theme,
	}
}

// Helper conversion functions
func stringToAccountStatus(status string) commonpb.AccountStatus {
	switch status {
	case "ACTIVE":
		return commonpb.AccountStatus_ACCOUNT_STATUS_ACTIVE
	case "SUSPENDED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_SUSPENDED
	case "BANNED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_BANNED
	case "DELETED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_DELETED
	default:
		return commonpb.AccountStatus_ACCOUNT_STATUS_PENDING
	}
}

func boolToVerificationStatus(verified bool) commonpb.VerificationStatus {
	if verified {
		return commonpb.VerificationStatus_VERIFICATION_STATUS_VERIFIED
	}
	return commonpb.VerificationStatus_VERIFICATION_STATUS_UNVERIFIED
}

func stringToGender(gender string) userpb.Gender {
	switch gender {
	case "MALE", "GENDER_MALE":
		return userpb.Gender_GENDER_MALE
	case "FEMALE", "GENDER_FEMALE":
		return userpb.Gender_GENDER_FEMALE
	case "NON_BINARY", "GENDER_NON_BINARY":
		return userpb.Gender_GENDER_NON_BINARY
	default:
		return userpb.Gender_GENDER_UNSPECIFIED
	}
}

func stringToDrinkingHabit(habit string) userpb.DrinkingHabit {
	switch habit {
	case "NEVER", "DRINKING_NEVER":
		return userpb.DrinkingHabit_DRINKING_NEVER
	case "RARELY", "DRINKING_RARELY":
		return userpb.DrinkingHabit_DRINKING_RARELY
	case "SOCIALLY", "DRINKING_SOCIALLY":
		return userpb.DrinkingHabit_DRINKING_SOCIALLY
	case "REGULARLY", "DRINKING_REGULARLY":
		return userpb.DrinkingHabit_DRINKING_REGULARLY
	default:
		return userpb.DrinkingHabit_DRINKING_UNSPECIFIED
	}
}

func stringToSmokingHabit(habit string) userpb.SmokingHabit {
	switch habit {
	case "NEVER", "SMOKING_NEVER":
		return userpb.SmokingHabit_SMOKING_NEVER
	case "SOCIALLY", "SMOKING_SOCIALLY":
		return userpb.SmokingHabit_SMOKING_SOCIALLY
	case "REGULARLY", "SMOKING_REGULARLY":
		return userpb.SmokingHabit_SMOKING_REGULARLY
	case "TRYING_TO_QUIT", "SMOKING_TRYING_TO_QUIT":
		return userpb.SmokingHabit_SMOKING_TRYING_TO_QUIT
	default:
		return userpb.SmokingHabit_SMOKING_UNSPECIFIED
	}
}

func stringToWorkoutFrequency(freq string) userpb.WorkoutFrequency {
	switch freq {
	case "NEVER", "WORKOUT_NEVER":
		return userpb.WorkoutFrequency_WORKOUT_NEVER
	case "RARELY", "WORKOUT_RARELY":
		return userpb.WorkoutFrequency_WORKOUT_RARELY
	case "SOMETIMES", "WORKOUT_SOMETIMES":
		return userpb.WorkoutFrequency_WORKOUT_SOMETIMES
	case "OFTEN", "WORKOUT_OFTEN":
		return userpb.WorkoutFrequency_WORKOUT_OFTEN
	case "DAILY", "WORKOUT_DAILY":
		return userpb.WorkoutFrequency_WORKOUT_DAILY
	case "ATHLETE", "WORKOUT_ATHLETE":
		return userpb.WorkoutFrequency_WORKOUT_ATHLETE
	default:
		return userpb.WorkoutFrequency_WORKOUT_UNSPECIFIED
	}
}

func stringToDietaryPreference(pref string) userpb.DietaryPreference {
	switch pref {
	case "ANYTHING", "DIETARY_ANYTHING":
		return userpb.DietaryPreference_DIETARY_ANYTHING
	case "VEGETARIAN", "DIETARY_VEGETARIAN":
		return userpb.DietaryPreference_DIETARY_VEGETARIAN
	case "VEGAN", "DIETARY_VEGAN":
		return userpb.DietaryPreference_DIETARY_VEGAN
	case "PESCATARIAN", "DIETARY_PESCATARIAN":
		return userpb.DietaryPreference_DIETARY_PESCATARIAN
	case "HALAL", "DIETARY_HALAL":
		return userpb.DietaryPreference_DIETARY_HALAL
	default:
		return userpb.DietaryPreference_DIETARY_UNSPECIFIED
	}
}

func stringToReligion(religion string) userpb.Religion {
	switch religion {
	case "HINDU", "RELIGION_HINDU":
		return userpb.Religion_RELIGION_HINDU
	case "MUSLIM", "RELIGION_MUSLIM":
		return userpb.Religion_RELIGION_MUSLIM
	case "CHRISTIAN", "RELIGION_CHRISTIAN":
		return userpb.Religion_RELIGION_CHRISTIAN
	case "SIKH", "RELIGION_SIKH":
		return userpb.Religion_RELIGION_SIKH
	case "BUDDHIST", "RELIGION_BUDDHIST":
		return userpb.Religion_RELIGION_BUDDHIST
	case "ATHEIST", "RELIGION_ATHEIST":
		return userpb.Religion_RELIGION_ATHEIST
	default:
		return userpb.Religion_RELIGION_UNSPECIFIED
	}
}

func stringToImportance(importance string) userpb.Importance {
	switch importance {
	case "NOT_IMPORTANT":
		return userpb.Importance_IMPORTANCE_NOT_IMPORTANT
	case "SOMEWHAT_IMPORTANT":
		return userpb.Importance_IMPORTANCE_SOMEWHAT_IMPORTANT
	case "IMPORTANT":
		return userpb.Importance_IMPORTANCE_IMPORTANT
	case "VERY_IMPORTANT":
		return userpb.Importance_IMPORTANCE_VERY_IMPORTANT
	default:
		return userpb.Importance_IMPORTANCE_UNSPECIFIED
	}
}

func stringToPoliticalView(view string) userpb.PoliticalView {
	switch view {
	case "LIBERAL", "POLITICAL_LIBERAL":
		return userpb.PoliticalView_POLITICAL_LIBERAL
	case "MODERATE", "POLITICAL_MODERATE":
		return userpb.PoliticalView_POLITICAL_MODERATE
	case "CONSERVATIVE", "POLITICAL_CONSERVATIVE":
		return userpb.PoliticalView_POLITICAL_CONSERVATIVE
	case "APOLITICAL", "POLITICAL_APOLITICAL":
		return userpb.PoliticalView_POLITICAL_APOLITICAL
	default:
		return userpb.PoliticalView_POLITICAL_UNSPECIFIED
	}
}

func stringToPetPreference(pref string) userpb.PetPreference {
	switch pref {
	case "DOG_LOVER", "PET_DOG_LOVER":
		return userpb.PetPreference_PET_DOG_LOVER
	case "CAT_LOVER", "PET_CAT_LOVER":
		return userpb.PetPreference_PET_CAT_LOVER
	case "BOTH", "PET_BOTH":
		return userpb.PetPreference_PET_BOTH
	case "NO_PETS", "PET_NO_PETS":
		return userpb.PetPreference_PET_NO_PETS
	default:
		return userpb.PetPreference_PET_UNSPECIFIED
	}
}

func stringToChildrenPreference(pref string) userpb.ChildrenPreference {
	switch pref {
	case "HAVE_AND_WANT_MORE", "CHILDREN_HAVE_AND_WANT_MORE":
		return userpb.ChildrenPreference_CHILDREN_HAVE_AND_WANT_MORE
	case "HAVE_DONT_WANT_MORE", "CHILDREN_HAVE_DONT_WANT_MORE":
		return userpb.ChildrenPreference_CHILDREN_HAVE_DONT_WANT_MORE
	case "DONT_HAVE_WANT", "CHILDREN_DONT_HAVE_WANT":
		return userpb.ChildrenPreference_CHILDREN_DONT_HAVE_WANT
	case "DONT_HAVE_DONT_WANT", "CHILDREN_DONT_HAVE_DONT_WANT":
		return userpb.ChildrenPreference_CHILDREN_DONT_HAVE_DONT_WANT
	default:
		return userpb.ChildrenPreference_CHILDREN_UNSPECIFIED
	}
}

func stringToCommunicationStyle(style string) userpb.CommunicationStyle {
	switch style {
	case "BIG_TIME_TEXTER", "COMMUNICATION_BIG_TIME_TEXTER":
		return userpb.CommunicationStyle_COMMUNICATION_BIG_TIME_TEXTER
	case "PHONE_CALLER", "COMMUNICATION_PHONE_CALLER":
		return userpb.CommunicationStyle_COMMUNICATION_PHONE_CALLER
	case "VIDEO_CHATTER", "COMMUNICATION_VIDEO_CHATTER":
		return userpb.CommunicationStyle_COMMUNICATION_VIDEO_CHATTER
	case "IN_PERSON", "COMMUNICATION_IN_PERSON":
		return userpb.CommunicationStyle_COMMUNICATION_IN_PERSON
	default:
		return userpb.CommunicationStyle_COMMUNICATION_UNSPECIFIED
	}
}

func stringToLoveLanguage(lang string) userpb.LoveLanguage {
	switch lang {
	case "WORDS_OF_AFFIRMATION", "LOVE_LANGUAGE_WORDS_OF_AFFIRMATION":
		return userpb.LoveLanguage_LOVE_LANGUAGE_WORDS_OF_AFFIRMATION
	case "ACTS_OF_SERVICE", "LOVE_LANGUAGE_ACTS_OF_SERVICE":
		return userpb.LoveLanguage_LOVE_LANGUAGE_ACTS_OF_SERVICE
	case "RECEIVING_GIFTS", "LOVE_LANGUAGE_RECEIVING_GIFTS":
		return userpb.LoveLanguage_LOVE_LANGUAGE_RECEIVING_GIFTS
	case "QUALITY_TIME", "LOVE_LANGUAGE_QUALITY_TIME":
		return userpb.LoveLanguage_LOVE_LANGUAGE_QUALITY_TIME
	case "PHYSICAL_TOUCH", "LOVE_LANGUAGE_PHYSICAL_TOUCH":
		return userpb.LoveLanguage_LOVE_LANGUAGE_PHYSICAL_TOUCH
	default:
		return userpb.LoveLanguage_LOVE_LANGUAGE_UNSPECIFIED
	}
}

func stringToSleepSchedule(schedule string) userpb.SleepSchedule {
	switch schedule {
	case "EARLY_BIRD", "SLEEP_SCHEDULE_EARLY_BIRD":
		return userpb.SleepSchedule_SLEEP_SCHEDULE_EARLY_BIRD
	case "NIGHT_OWL", "SLEEP_SCHEDULE_NIGHT_OWL":
		return userpb.SleepSchedule_SLEEP_SCHEDULE_NIGHT_OWL
	case "VARIES", "SLEEP_SCHEDULE_VARIES":
		return userpb.SleepSchedule_SLEEP_SCHEDULE_VARIES
	default:
		return userpb.SleepSchedule_SLEEP_SCHEDULE_UNSPECIFIED
	}
}

func calculateAge(dob time.Time) int {
	now := time.Now()
	age := now.Year() - dob.Year()
	if now.YearDay() < dob.YearDay() {
		age--
	}
	return age
}

// Helper to extract user ID from context (to be implemented with auth middleware)
func getUserIDFromContext(ctx context.Context) (int, error) {
	// Check if userID is in context (for testing)
	if userID, ok := ctx.Value("userID").(int); ok {
		return userID, nil
	}

	// TODO: Implement proper JWT/auth extraction from metadata
	// For now, return a placeholder
	return 0, fmt.Errorf("authentication required")
}

// Conversion from string to sql.NullString
func toNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// Conversion from int32 to sql.NullInt32
func toNullInt32(i int32) sql.NullInt32 {
	if i == 0 {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{Int32: i, Valid: true}
}
