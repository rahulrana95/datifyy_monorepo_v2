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

	// Height range
	if prefs.HeightRangeMin.Valid && prefs.HeightRangeMax.Valid {
		pb.HeightRange = &userpb.HeightRange{
			MinHeight: prefs.HeightRangeMin.Int32,
			MaxHeight: prefs.HeightRangeMax.Int32,
		}
	}

	// Simple integer fields (enums)
	pb.ReligionImportance = userpb.Importance(prefs.ReligionImportance)
	pb.ManglikPreference = userpb.ManglikPreference(prefs.ManglikPreference)
	pb.NriPreference = userpb.NRIPreference(prefs.NRIPreference)
	pb.RelocationExpectation = userpb.RelocationExpectation(prefs.RelocationExpectation)
	pb.TattooPreference = userpb.TattooPreference(prefs.TattooPreference)
	pb.PiercingPreference = userpb.PiercingPreference(prefs.PiercingPreference)
	pb.DisabilityAcceptance = userpb.DisabilityAcceptance(prefs.DisabilityAcceptance)
	pb.MinYearsExperience = int32(prefs.MinYearsExperience)
	pb.PropertyPreference = userpb.PropertyOwnership(prefs.PropertyPreference)
	pb.VehiclePreference = userpb.VehicleOwnership(prefs.VehiclePreference)
	pb.FinancialExpectation = userpb.FinancialExpectation(prefs.FinancialExpectation)
	pb.MaxSiblings = int32(prefs.MaxSiblings)
	pb.MinLanguageProficiency = userpb.LanguageProficiency(prefs.MinLangProficiency)
	pb.MinSharedInterests = int32(prefs.MinSharedInterests)
	pb.MaxDaysInactive = int32(prefs.MaxDaysInactive)
	pb.MinProfileCompletion = int32(prefs.MinProfileCompletion)

	// Boolean fields
	pb.HoroscopeMatchingRequired = prefs.HoroscopeRequired
	pb.OpenToLongDistance = prefs.OpenToLongDistance
	pb.PhotosRequired = prefs.PhotosRequired

	// Parse JSONB arrays - Gender
	if len(prefs.LookingForGender) > 0 {
		var genders []int32
		if err := json.Unmarshal(prefs.LookingForGender, &genders); err == nil {
			pb.LookingForGender = make([]userpb.Gender, len(genders))
			for i, g := range genders {
				pb.LookingForGender[i] = userpb.Gender(g)
			}
		}
	}

	// RelationshipGoals
	if len(prefs.RelationshipGoals) > 0 {
		var goals []int32
		if err := json.Unmarshal(prefs.RelationshipGoals, &goals); err == nil {
			pb.RelationshipGoals = make([]userpb.RelationshipGoal, len(goals))
			for i, g := range goals {
				pb.RelationshipGoals[i] = userpb.RelationshipGoal(g)
			}
		}
	}

	// EducationLevels
	if len(prefs.EducationLevels) > 0 {
		var levels []int32
		if err := json.Unmarshal(prefs.EducationLevels, &levels); err == nil {
			pb.EducationLevels = make([]userpb.EducationLevel, len(levels))
			for i, l := range levels {
				pb.EducationLevels[i] = userpb.EducationLevel(l)
			}
		}
	}

	// Occupations
	if len(prefs.Occupations) > 0 {
		var occupations []int32
		if err := json.Unmarshal(prefs.Occupations, &occupations); err == nil {
			pb.Occupations = make([]userpb.OccupationCategory, len(occupations))
			for i, o := range occupations {
				pb.Occupations[i] = userpb.OccupationCategory(o)
			}
		}
	}

	// Religions
	if len(prefs.Religions) > 0 {
		var religions []int32
		if err := json.Unmarshal(prefs.Religions, &religions); err == nil {
			pb.Religions = make([]userpb.Religion, len(religions))
			for i, r := range religions {
				pb.Religions[i] = userpb.Religion(r)
			}
		}
	}

	// ChildrenPreferences
	if len(prefs.ChildrenPreferences) > 0 {
		var children []int32
		if err := json.Unmarshal(prefs.ChildrenPreferences, &children); err == nil {
			pb.ChildrenPreferences = make([]userpb.ChildrenPreference, len(children))
			for i, c := range children {
				pb.ChildrenPreferences[i] = userpb.ChildrenPreference(c)
			}
		}
	}

	// DrinkingPreferences
	if len(prefs.DrinkingPreferences) > 0 {
		var drinking []int32
		if err := json.Unmarshal(prefs.DrinkingPreferences, &drinking); err == nil {
			pb.DrinkingPreferences = make([]userpb.DrinkingHabit, len(drinking))
			for i, d := range drinking {
				pb.DrinkingPreferences[i] = userpb.DrinkingHabit(d)
			}
		}
	}

	// SmokingPreferences
	if len(prefs.SmokingPreferences) > 0 {
		var smoking []int32
		if err := json.Unmarshal(prefs.SmokingPreferences, &smoking); err == nil {
			pb.SmokingPreferences = make([]userpb.SmokingHabit, len(smoking))
			for i, s := range smoking {
				pb.SmokingPreferences[i] = userpb.SmokingHabit(s)
			}
		}
	}

	// DietaryPreferences
	if len(prefs.DietaryPreferences) > 0 {
		var dietary []int32
		if err := json.Unmarshal(prefs.DietaryPreferences, &dietary); err == nil {
			pb.DietaryPreferences = make([]userpb.DietaryPreference, len(dietary))
			for i, d := range dietary {
				pb.DietaryPreferences[i] = userpb.DietaryPreference(d)
			}
		}
	}

	// PetPreferences
	if len(prefs.PetPreferences) > 0 {
		var pets []int32
		if err := json.Unmarshal(prefs.PetPreferences, &pets); err == nil {
			pb.PetPreferences = make([]userpb.PetPreference, len(pets))
			for i, p := range pets {
				pb.PetPreferences[i] = userpb.PetPreference(p)
			}
		}
	}

	// WorkoutPreferences
	if len(prefs.WorkoutPreferences) > 0 {
		var workouts []int32
		if err := json.Unmarshal(prefs.WorkoutPreferences, &workouts); err == nil {
			pb.WorkoutPreferences = make([]userpb.WorkoutFrequency, len(workouts))
			for i, w := range workouts {
				pb.WorkoutPreferences[i] = userpb.WorkoutFrequency(w)
			}
		}
	}

	// PersonalityTypes (string array)
	if len(prefs.PersonalityTypes) > 0 {
		var personalities []string
		if err := json.Unmarshal(prefs.PersonalityTypes, &personalities); err == nil {
			pb.PersonalityTypes = personalities
		}
	}

	// CommunicationStyles
	if len(prefs.CommunicationStyles) > 0 {
		var styles []int32
		if err := json.Unmarshal(prefs.CommunicationStyles, &styles); err == nil {
			pb.CommunicationStyles = make([]userpb.CommunicationStyle, len(styles))
			for i, s := range styles {
				pb.CommunicationStyles[i] = userpb.CommunicationStyle(s)
			}
		}
	}

	// LoveLanguages
	if len(prefs.LoveLanguages) > 0 {
		var languages []int32
		if err := json.Unmarshal(prefs.LoveLanguages, &languages); err == nil {
			pb.LoveLanguages = make([]userpb.LoveLanguage, len(languages))
			for i, l := range languages {
				pb.LoveLanguages[i] = userpb.LoveLanguage(l)
			}
		}
	}

	// PoliticalViews
	if len(prefs.PoliticalViews) > 0 {
		var views []int32
		if err := json.Unmarshal(prefs.PoliticalViews, &views); err == nil {
			pb.PoliticalViews = make([]userpb.PoliticalView, len(views))
			for i, v := range views {
				pb.PoliticalViews[i] = userpb.PoliticalView(v)
			}
		}
	}

	// SleepSchedules
	if len(prefs.SleepSchedules) > 0 {
		var schedules []int32
		if err := json.Unmarshal(prefs.SleepSchedules, &schedules); err == nil {
			pb.SleepSchedules = make([]userpb.SleepSchedule, len(schedules))
			for i, s := range schedules {
				pb.SleepSchedules[i] = userpb.SleepSchedule(s)
			}
		}
	}

	// CastePreferences (string array)
	if len(prefs.CastePreferences) > 0 {
		var castes []string
		if err := json.Unmarshal(prefs.CastePreferences, &castes); err == nil {
			pb.CastePreferences = castes
		}
	}

	// SubCastePreferences (string array)
	if len(prefs.SubCastePreferences) > 0 {
		var subCastes []string
		if err := json.Unmarshal(prefs.SubCastePreferences, &subCastes); err == nil {
			pb.SubCastePreferences = subCastes
		}
	}

	// GotraPreferences (string array)
	if len(prefs.GotraPreferences) > 0 {
		var gotras []string
		if err := json.Unmarshal(prefs.GotraPreferences, &gotras); err == nil {
			pb.GotraPreferences = gotras
		}
	}

	// MotherTonguePreferences (string array)
	if len(prefs.MotherTonguePrefs) > 0 {
		var tongues []string
		if err := json.Unmarshal(prefs.MotherTonguePrefs, &tongues); err == nil {
			pb.MotherTonguePreferences = tongues
		}
	}

	// EthnicityPreferences
	if len(prefs.EthnicityPreferences) > 0 {
		var ethnicities []int32
		if err := json.Unmarshal(prefs.EthnicityPreferences, &ethnicities); err == nil {
			pb.EthnicityPreferences = make([]userpb.Ethnicity, len(ethnicities))
			for i, e := range ethnicities {
				pb.EthnicityPreferences[i] = userpb.Ethnicity(e)
			}
		}
	}

	// NationalityPreferences (string array)
	if len(prefs.NationalityPrefs) > 0 {
		var nationalities []string
		if err := json.Unmarshal(prefs.NationalityPrefs, &nationalities); err == nil {
			pb.NationalityPreferences = nationalities
		}
	}

	// BodyTypePreferences
	if len(prefs.BodyTypePreferences) > 0 {
		var bodyTypes []int32
		if err := json.Unmarshal(prefs.BodyTypePreferences, &bodyTypes); err == nil {
			pb.BodyTypePreferences = make([]userpb.BodyType, len(bodyTypes))
			for i, b := range bodyTypes {
				pb.BodyTypePreferences[i] = userpb.BodyType(b)
			}
		}
	}

	// ComplexionPreferences
	if len(prefs.ComplexionPrefs) > 0 {
		var complexions []int32
		if err := json.Unmarshal(prefs.ComplexionPrefs, &complexions); err == nil {
			pb.ComplexionPreferences = make([]userpb.Complexion, len(complexions))
			for i, c := range complexions {
				pb.ComplexionPreferences[i] = userpb.Complexion(c)
			}
		}
	}

	// HairColorPreferences
	if len(prefs.HairColorPrefs) > 0 {
		var hairColors []int32
		if err := json.Unmarshal(prefs.HairColorPrefs, &hairColors); err == nil {
			pb.HairColorPreferences = make([]userpb.HairColor, len(hairColors))
			for i, h := range hairColors {
				pb.HairColorPreferences[i] = userpb.HairColor(h)
			}
		}
	}

	// EyeColorPreferences
	if len(prefs.EyeColorPrefs) > 0 {
		var eyeColors []int32
		if err := json.Unmarshal(prefs.EyeColorPrefs, &eyeColors); err == nil {
			pb.EyeColorPreferences = make([]userpb.EyeColor, len(eyeColors))
			for i, e := range eyeColors {
				pb.EyeColorPreferences[i] = userpb.EyeColor(e)
			}
		}
	}

	// FacialHairPreferences
	if len(prefs.FacialHairPrefs) > 0 {
		var facialHairs []int32
		if err := json.Unmarshal(prefs.FacialHairPrefs, &facialHairs); err == nil {
			pb.FacialHairPreferences = make([]userpb.FacialHair, len(facialHairs))
			for i, f := range facialHairs {
				pb.FacialHairPreferences[i] = userpb.FacialHair(f)
			}
		}
	}

	// IncomePreferences
	if len(prefs.IncomePreferences) > 0 {
		var incomes []int32
		if err := json.Unmarshal(prefs.IncomePreferences, &incomes); err == nil {
			pb.IncomePreferences = make([]userpb.IncomeRange, len(incomes))
			for i, inc := range incomes {
				pb.IncomePreferences[i] = userpb.IncomeRange(inc)
			}
		}
	}

	// EmploymentPreferences
	if len(prefs.EmploymentPrefs) > 0 {
		var employments []int32
		if err := json.Unmarshal(prefs.EmploymentPrefs, &employments); err == nil {
			pb.EmploymentPreferences = make([]userpb.EmploymentType, len(employments))
			for i, e := range employments {
				pb.EmploymentPreferences[i] = userpb.EmploymentType(e)
			}
		}
	}

	// IndustryPreferences (string array)
	if len(prefs.IndustryPreferences) > 0 {
		var industries []string
		if err := json.Unmarshal(prefs.IndustryPreferences, &industries); err == nil {
			pb.IndustryPreferences = industries
		}
	}

	// FamilyTypePreferences
	if len(prefs.FamilyTypePrefs) > 0 {
		var familyTypes []int32
		if err := json.Unmarshal(prefs.FamilyTypePrefs, &familyTypes); err == nil {
			pb.FamilyTypePreferences = make([]userpb.FamilyType, len(familyTypes))
			for i, f := range familyTypes {
				pb.FamilyTypePreferences[i] = userpb.FamilyType(f)
			}
		}
	}

	// FamilyValuesPreferences
	if len(prefs.FamilyValuesPrefs) > 0 {
		var familyValues []int32
		if err := json.Unmarshal(prefs.FamilyValuesPrefs, &familyValues); err == nil {
			pb.FamilyValuesPreferences = make([]userpb.FamilyValues, len(familyValues))
			for i, f := range familyValues {
				pb.FamilyValuesPreferences[i] = userpb.FamilyValues(f)
			}
		}
	}

	// LivingSituationPreferences
	if len(prefs.LivingSituationPrefs) > 0 {
		var livingSituations []int32
		if err := json.Unmarshal(prefs.LivingSituationPrefs, &livingSituations); err == nil {
			pb.LivingSituationPreferences = make([]userpb.LivingSituation, len(livingSituations))
			for i, l := range livingSituations {
				pb.LivingSituationPreferences[i] = userpb.LivingSituation(l)
			}
		}
	}

	// FamilyAffluencePreferences
	if len(prefs.FamilyAffluencePrefs) > 0 {
		var affluences []int32
		if err := json.Unmarshal(prefs.FamilyAffluencePrefs, &affluences); err == nil {
			pb.FamilyAffluencePreferences = make([]userpb.FamilyAffluence, len(affluences))
			for i, a := range affluences {
				pb.FamilyAffluencePreferences[i] = userpb.FamilyAffluence(a)
			}
		}
	}

	// FamilyLocationPreferences (string array)
	if len(prefs.FamilyLocationPrefs) > 0 {
		var locations []string
		if err := json.Unmarshal(prefs.FamilyLocationPrefs, &locations); err == nil {
			pb.FamilyLocationPreferences = locations
		}
	}

	// LanguagePreferences
	if len(prefs.LanguagePreferences) > 0 {
		var langCodes []int32
		if err := json.Unmarshal(prefs.LanguagePreferences, &langCodes); err == nil {
			pb.LanguagePreferences = make([]userpb.LanguageCode, len(langCodes))
			for i, l := range langCodes {
				pb.LanguagePreferences[i] = userpb.LanguageCode(l)
			}
		}
	}

	// LocationPreferences (string array)
	if len(prefs.LocationPreferences) > 0 {
		var locations []string
		if err := json.Unmarshal(prefs.LocationPreferences, &locations); err == nil {
			pb.LocationPreferences = locations
		}
	}

	// InterestPreferences
	if len(prefs.InterestPreferences) > 0 {
		var interests []int32
		if err := json.Unmarshal(prefs.InterestPreferences, &interests); err == nil {
			pb.InterestPreferences = make([]userpb.InterestCategory, len(interests))
			for i, interest := range interests {
				pb.InterestPreferences[i] = userpb.InterestCategory(interest)
			}
		}
	}

	// DealBreakers (message array)
	if len(prefs.DealBreakers) > 0 {
		var dealBreakers []*userpb.DealBreaker
		if err := json.Unmarshal(prefs.DealBreakers, &dealBreakers); err == nil {
			pb.DealBreakers = dealBreakers
		}
	}

	// MustHaves (message array)
	if len(prefs.MustHaves) > 0 {
		var mustHaves []*userpb.MustHave
		if err := json.Unmarshal(prefs.MustHaves, &mustHaves); err == nil {
			pb.MustHaves = mustHaves
		}
	}

	// CustomDealbreakers (string array)
	if len(prefs.CustomDealbreakers) > 0 {
		var customDealbreakers []string
		if err := json.Unmarshal(prefs.CustomDealbreakers, &customDealbreakers); err == nil {
			pb.CustomDealbreakers = customDealbreakers
		}
	}

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
